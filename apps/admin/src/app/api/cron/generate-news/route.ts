import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { scrapeGoogleNews, checkNewsExists, extractDomain } from '@/lib/services/newsScraperService';
import { initOpenAI, generateNewsSummary, saveNewsToDatabase } from '@/lib/services/aiNewsService';

/**
 * Cron job pour générer automatiquement des actualités pour tous les blogs actifs
 * Planifié pour s'exécuter quotidiennement à 6h
 */
export async function GET(request: NextRequest) {
  // Vérifier l'authentification du cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // En production, vérifier le secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();

  try {
    // Récupérer les paramètres OpenAI
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('openai_api_key')
      .eq('id', 'default')
      .single();

    if (!settings?.openai_api_key) {
      return NextResponse.json({
        success: false,
        error: 'Clé API OpenAI non configurée',
      });
    }

    // Initialiser OpenAI
    initOpenAI(settings.openai_api_key);

    // Récupérer tous les blogs actifs
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('id, name, niche')
      .eq('is_active', true);

    if (blogsError || !blogs || blogs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun blog actif trouvé',
      });
    }

    const results: { blogId: string; blogName: string; generated: number; errors: number }[] = [];

    // Traiter chaque blog
    for (const blog of blogs) {
      let generated = 0;
      let errors = 0;

      try {
        // Scraper les actualités
        const scrapedItems = await scrapeGoogleNews({
          niche: blog.niche,
          maxResults: 15,
        });

        // Filtrer les doublons
        const newItems = [];
        for (const item of scrapedItems) {
          const exists = await checkNewsExists(supabase, blog.id, item.url);
          if (!exists) {
            newItems.push(item);
          }
          if (newItems.length >= 5) break; // Limiter à 5 news par blog par jour
        }

        // Générer et sauvegarder
        for (const item of newItems) {
          try {
            const summary = await generateNewsSummary(item, blog.niche);

            if (summary) {
              const saveResult = await saveNewsToDatabase(supabase, blog.id, item, summary);
              if (saveResult.success) {
                generated++;
              } else {
                errors++;
              }
            }

            // Délai entre les requêtes
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            errors++;
            console.error(`Error processing news for blog ${blog.name}:`, error);
          }
        }
      } catch (error) {
        errors++;
        console.error(`Error scraping news for blog ${blog.name}:`, error);
      }

      results.push({
        blogId: blog.id,
        blogName: blog.name,
        generated,
        errors,
      });

      // Délai entre les blogs
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Calculer les totaux
    const totalGenerated = results.reduce((sum, r) => sum + r.generated, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      blogsProcessed: blogs.length,
      totalGenerated,
      totalErrors,
      details: results,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur dans le cron job',
      },
      { status: 500 }
    );
  }
}
