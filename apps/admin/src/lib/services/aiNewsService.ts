/**
 * Service de génération de résumés d'actualités par IA
 * Utilise OpenAI GPT-4o-mini pour créer des résumés originaux
 */

import OpenAI from 'openai';
import type { ScrapedNewsItem, GeneratedNewsSummary, NewsCategory } from '@seo-force/shared';

let openaiClient: OpenAI | null = null;

/**
 * Initialise le client OpenAI
 */
export function initOpenAI(apiKey: string): void {
  openaiClient = new OpenAI({ apiKey });
}

/**
 * Génère un slug à partir d'un titre
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Espaces -> tirets
    .replace(/-+/g, '-') // Plusieurs tirets -> un seul
    .replace(/^-+|-+$/g, '') // Supprimer tirets début/fin
    .substring(0, 80); // Limiter la longueur
}

/**
 * Contexte par niche pour orienter les résumés vers les produits
 */
const NICHE_CONTEXT: Record<string, { description: string; products: string[]; angle: string }> = {
  tech: {
    description: 'blog de tests et comparatifs de gadgets high-tech',
    products: ['smartphones', 'tablettes', 'accessoires tech', 'objets connectés', 'écouteurs', 'montres connectées'],
    angle: 'guide d\'achat et conseils pour choisir les meilleurs produits tech',
  },
  audio: {
    description: 'blog spécialisé dans le matériel audio et hi-fi',
    products: ['casques audio', 'enceintes', 'écouteurs', 'amplis', 'DAC', 'platines'],
    angle: 'tests et comparatifs pour les audiophiles et mélomanes',
  },
  gaming: {
    description: 'blog gaming et matériel de jeu',
    products: ['consoles', 'PC gaming', 'manettes', 'casques gaming', 'claviers', 'souris'],
    angle: 'actualités gaming et guides d\'achat pour les gamers',
  },
  maison: {
    description: 'blog domotique et équipement maison',
    products: ['robots aspirateurs', 'purificateurs', 'électroménager connecté', 'domotique'],
    angle: 'tests de produits pour la maison intelligente',
  },
  sport: {
    description: 'blog équipement sportif et fitness',
    products: ['montres GPS', 'vélos électriques', 'équipement fitness', 'accessoires running'],
    angle: 'comparatifs et tests pour les sportifs',
  },
  photo: {
    description: 'blog photo et vidéo',
    products: ['appareils photo', 'objectifs', 'drones', 'stabilisateurs', 'accessoires'],
    angle: 'tests et guides pour les photographes',
  },
  cuisine: {
    description: 'blog électroménager cuisine',
    products: ['robots cuisine', 'multicuiseurs', 'blenders', 'machines à café'],
    angle: 'tests et comparatifs d\'équipement culinaire',
  },
  beaute: {
    description: 'blog beauté et soins',
    products: ['appareils beauté', 'sèche-cheveux', 'épilateurs', 'brosses'],
    angle: 'tests de gadgets beauté et conseils',
  },
};

/**
 * Génère un résumé original pour une actualité
 */
export async function generateNewsSummary(
  scrapedItem: ScrapedNewsItem,
  niche: string
): Promise<GeneratedNewsSummary | null> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Call initOpenAI first.');
  }

  // Récupérer le contexte de la niche
  const context = NICHE_CONTEXT[niche.toLowerCase()] || {
    description: `blog spécialisé ${niche}`,
    products: [niche],
    angle: `actualités et guides ${niche}`,
  };

  const prompt = `Tu es le rédacteur en chef d'un ${context.description}.

Ton blog propose des tests, comparatifs et guides d'achat pour ces types de produits : ${context.products.join(', ')}.

OBJECTIF : Transformer cette actualité en contenu pertinent pour tes lecteurs qui cherchent des conseils d'achat.

Actualité source :
- Titre : "${scrapedItem.title}"
- Source : ${scrapedItem.source}
- Extrait : "${scrapedItem.snippet}"

INSTRUCTIONS :
1. Reformule COMPLÈTEMENT avec tes propres mots (jamais de copie)
2. Oriente le résumé vers l'INTÉRÊT PRATIQUE pour un acheteur potentiel
3. Si l'actu parle d'un nouveau produit → mentionne pourquoi c'est intéressant à suivre
4. Si c'est une tendance marché → explique l'impact sur les choix d'achat
5. Si l'actu n'est pas pertinente pour un guide d'achat → retourne null

Génère un JSON avec cette structure :
{
  "title": "Titre accrocheur orienté produit/achat (max 80 caractères)",
  "summary": "Résumé de 200-300 caractères expliquant pourquoi cette actu intéresse un acheteur",
  "category": "tech|tendances|economie (choisir la plus pertinente)",
  "tags": ["3-5 tags produits pertinents"],
  "imageKeyword": "mot-clé ANGLAIS précis pour Unsplash (ex: smartphone, headphones, laptop, smartwatch)"
}

Si l'actualité n'est PAS pertinente pour un blog ${context.angle}, réponds : {"skip": true}

Réponds UNIQUEMENT avec le JSON.`;

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant qui génère des résumés d\'actualités au format JSON. Tu réponds uniquement en JSON valide.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.error('No content in OpenAI response');
      return null;
    }

    // Extraire le JSON de la réponse
    let jsonContent = content;

    // Si la réponse contient des backticks markdown, les supprimer
    if (content.includes('```json')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.includes('```')) {
      jsonContent = content.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonContent);

    // Si l'IA a décidé de skip cette actualité (non pertinente)
    if (parsed.skip) {
      console.log('Actualité non pertinente, skipped:', scrapedItem.title.substring(0, 50));
      return null;
    }

    // Valider les catégories
    const validCategories: NewsCategory[] = ['economie', 'juridique', 'tendances', 'tech', 'lifestyle', 'createurs'];
    const category: NewsCategory = validCategories.includes(parsed.category)
      ? parsed.category
      : 'tech'; // Par défaut tech pour un blog de gadgets

    return {
      title: parsed.title || scrapedItem.title,
      slug: generateSlug(parsed.title || scrapedItem.title) + '-' + Date.now().toString(36),
      summary: parsed.summary || scrapedItem.snippet,
      category,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      imageKeyword: parsed.imageKeyword || 'gadget',
    };
  } catch (error) {
    console.error('Error generating news summary:', error);
    return null;
  }
}

/**
 * Génère des résumés pour plusieurs actualités
 */
export async function generateMultipleNewsSummaries(
  items: ScrapedNewsItem[],
  niche: string,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, GeneratedNewsSummary>> {
  const results = new Map<string, GeneratedNewsSummary>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    try {
      const summary = await generateNewsSummary(item, niche);
      if (summary) {
        results.set(item.url, summary);
      }

      // Callback de progression
      if (onProgress) {
        onProgress(i + 1, items.length);
      }

      // Délai entre les requêtes pour éviter le rate limiting
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing news item ${i + 1}:`, error);
    }
  }

  return results;
}

/**
 * Récupère une image depuis Unsplash basée sur un mot-clé
 */
export async function fetchUnsplashImage(
  keyword: string,
  unsplashKey: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Prendre une image aléatoire parmi les 5 premiers résultats
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
      const photo = data.results[randomIndex];
      // Utiliser l'URL regular (1080px) pour un bon équilibre taille/qualité
      return photo.urls?.regular || photo.urls?.small || null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
}

/**
 * Sauvegarde une actualité en base de données
 */
export async function saveNewsToDatabase(
  supabase: any,
  blogId: string,
  scrapedItem: ScrapedNewsItem,
  generatedSummary: GeneratedNewsSummary,
  imageUrl?: string | null
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Extraire le domaine de la source
    let sourceDomain = '';
    try {
      sourceDomain = new URL(scrapedItem.url).hostname.replace('www.', '');
    } catch {
      sourceDomain = scrapedItem.source || '';
    }

    const { data, error } = await supabase
      .from('news')
      .insert({
        blog_id: blogId,
        title: generatedSummary.title,
        slug: generatedSummary.slug,
        summary: generatedSummary.summary,
        source_title: scrapedItem.title,
        source_url: scrapedItem.url,
        source_domain: sourceDomain,
        source_published_at: scrapedItem.publishedAt ? new Date(scrapedItem.publishedAt).toISOString() : null,
        category: generatedSummary.category,
        tags: generatedSummary.tags,
        featured_image: imageUrl || null,
        is_published: true,
      })
      .select('id')
      .single();

    if (error) {
      // Gérer l'erreur de doublon
      if (error.code === '23505') {
        return { success: false, error: 'Cette actualité existe déjà' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error saving news to database:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
}
