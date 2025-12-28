import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { scrapeGoogleNews, checkNewsExists, extractDomain } from '@/lib/services/newsScraperService';
import { initOpenAI, generateNewsSummary, saveNewsToDatabase, fetchUnsplashImage } from '@/lib/services/aiNewsService';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { blog_id, max_items = 10, keywords } = body;

  if (!blog_id) {
    return NextResponse.json(
      { error: 'blog_id est requis' },
      { status: 400 }
    );
  }

  try {
    // Get the blog
    const { data: blog, error: blogError } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blog_id)
      .single();

    if (blogError || !blog) {
      return NextResponse.json(
        { error: 'Blog non trouvé' },
        { status: 404 }
      );
    }

    // Get API keys from settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('openai_api_key, settings')
      .eq('id', 'default')
      .single();

    if (!settings?.openai_api_key) {
      return NextResponse.json(
        { error: 'Clé API OpenAI non configurée dans les paramètres' },
        { status: 400 }
      );
    }

    // Get Unsplash key from settings or env
    const unsplashKey = settings?.settings?.unsplash_api_key || process.env.UNSPLASH_ACCESS_KEY;

    // Initialize OpenAI client
    initOpenAI(settings.openai_api_key);

    // Scrape Google News
    const scrapedItems = await scrapeGoogleNews({
      niche: blog.niche,
      keywords: keywords || [],
      maxResults: max_items * 2, // Scrape more to account for duplicates
    });

    if (scrapedItems.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        message: 'Aucune actualité trouvée',
        news: [],
      });
    }

    // Filter out existing news
    const newItems = [];
    for (const item of scrapedItems) {
      const exists = await checkNewsExists(supabase, blog_id, item.url);
      if (!exists) {
        newItems.push(item);
      }
      if (newItems.length >= max_items) break;
    }

    if (newItems.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        message: 'Toutes les actualités existent déjà',
        news: [],
      });
    }

    // Generate summaries and save to database
    const results = [];
    let successCount = 0;

    for (const item of newItems) {
      try {
        const summary = await generateNewsSummary(item, blog.niche);

        if (summary) {
          // Fetch image from Unsplash if key is available
          let imageUrl: string | null = null;
          if (unsplashKey && summary.imageKeyword) {
            imageUrl = await fetchUnsplashImage(summary.imageKeyword, unsplashKey);
          }

          const saveResult = await saveNewsToDatabase(supabase, blog_id, item, summary, imageUrl);

          if (saveResult.success) {
            successCount++;
            results.push({
              id: saveResult.id,
              title: summary.title,
              source: extractDomain(item.url),
              category: summary.category,
              image: imageUrl,
            });
          }
        }

        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('Error processing news item:', error);
      }
    }

    return NextResponse.json({
      success: true,
      generated: successCount,
      scraped: scrapedItems.length,
      filtered: newItems.length,
      news: results,
    });
  } catch (error) {
    console.error('Error generating news:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}

// GET - List all news for a blog
export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blog_id');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!blogId) {
    return NextResponse.json(
      { error: 'blog_id est requis' },
      { status: 400 }
    );
  }

  try {
    const { data: news, error, count } = await supabase
      .from('news')
      .select('*', { count: 'exact' })
      .eq('blog_id', blogId)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      news: news || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des actualités' },
      { status: 500 }
    );
  }
}
