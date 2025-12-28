/**
 * Service de scraping Google News RSS
 * Récupère les actualités pertinentes pour une niche donnée
 */

import type { ScrapedNewsItem } from '@seo-force/shared';

export interface NewsScraperOptions {
  niche: string;
  keywords?: string[];
  maxResults?: number;
  language?: string;
  region?: string;
}

/**
 * Génère les mots-clés de recherche basés sur la niche du blog
 * Focus sur les actualités produits et tests pour les blogs d'affiliation
 */
function generateSearchKeywords(niche: string, additionalKeywords?: string[]): string[] {
  // Mots-clés orientés produits/tests selon la niche
  const nicheKeywords: Record<string, string[]> = {
    tech: [
      'test smartphone 2025',
      'nouveauté high-tech',
      'meilleur gadget tech',
      'comparatif accessoires',
      'sortie produit tech',
      'promo high-tech',
    ],
    audio: [
      'test casque audio',
      'nouveauté enceinte bluetooth',
      'comparatif écouteurs',
      'meilleur DAC audiophile',
      'sortie casque sans fil',
    ],
    gaming: [
      'test console gaming',
      'nouveau jeu vidéo',
      'comparatif manette',
      'meilleur PC gamer',
      'accessoire gaming 2025',
    ],
    mode: [
      'tendance mode 2025',
      'nouvelle collection',
      'marque streetwear',
      'accessoire mode',
      'sneakers sortie',
    ],
    maison: [
      'test robot aspirateur',
      'comparatif électroménager',
      'nouveauté domotique',
      'meilleur purificateur air',
      'gadget maison connectée',
    ],
    sport: [
      'test montre connectée sport',
      'comparatif vélo électrique',
      'meilleur équipement fitness',
      'nouveauté running',
      'accessoire musculation',
    ],
    photo: [
      'test appareil photo',
      'nouveau smartphone photo',
      'comparatif objectif',
      'meilleur drone caméra',
      'accessoire photographe',
    ],
    cuisine: [
      'test robot cuisine',
      'comparatif multicuiseur',
      'meilleur blender',
      'nouveauté électroménager',
      'accessoire cuisine pro',
    ],
    beaute: [
      'test appareil beauté',
      'nouveauté soin visage',
      'comparatif sèche-cheveux',
      'meilleur épilateur',
      'gadget beauté tech',
    ],
    jardin: [
      'test robot tondeuse',
      'comparatif taille-haie',
      'meilleur arrosage automatique',
      'nouveauté outillage jardin',
      'gadget jardinage',
    ],
  };

  const baseKeywords = nicheKeywords[niche.toLowerCase()] || [`test ${niche}`, `meilleur ${niche}`, `comparatif ${niche}`];
  return [...baseKeywords, ...(additionalKeywords || [])];
}

/**
 * Construit l'URL Google News RSS pour une requête
 */
function buildGoogleNewsRssUrl(query: string, language: string = 'fr', region: string = 'FR'): string {
  const encodedQuery = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encodedQuery}&hl=${language}&gl=${region}&ceid=${region}:${language}`;
}

/**
 * Parse le XML RSS de Google News
 */
function parseRssXml(xmlText: string): ScrapedNewsItem[] {
  const items: ScrapedNewsItem[] = [];

  // Regex pour extraire les items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    // Extraire le titre
    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i.exec(itemXml);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';

    // Extraire le lien
    const linkMatch = /<link>(.*?)<\/link>/i.exec(itemXml);
    const url = linkMatch ? linkMatch[1].trim() : '';

    // Extraire la source
    const sourceMatch = /<source[^>]*>(.*?)<\/source>/i.exec(itemXml);
    const source = sourceMatch ? sourceMatch[1].trim() : '';

    // Extraire la description/snippet
    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i.exec(itemXml);
    let snippet = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';

    // Nettoyer le snippet des balises HTML
    snippet = snippet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Extraire la date de publication
    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/i.exec(itemXml);
    const publishedAt = pubDateMatch ? pubDateMatch[1].trim() : undefined;

    if (title && url) {
      items.push({
        title,
        url,
        source,
        snippet: snippet.substring(0, 500),
        publishedAt,
      });
    }
  }

  return items;
}

/**
 * Extrait le domaine d'une URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Scrape Google News RSS pour une niche donnée
 */
export async function scrapeGoogleNews(options: NewsScraperOptions): Promise<ScrapedNewsItem[]> {
  const {
    niche,
    keywords: additionalKeywords,
    maxResults = 10,
    language = 'fr',
    region = 'FR',
  } = options;

  const searchKeywords = generateSearchKeywords(niche, additionalKeywords);
  const allItems: ScrapedNewsItem[] = [];
  const seenUrls = new Set<string>();

  // Limiter à 3 requêtes pour éviter le rate limiting
  const keywordsToSearch = searchKeywords.slice(0, 3);

  for (const keyword of keywordsToSearch) {
    try {
      const rssUrl = buildGoogleNewsRssUrl(keyword, language, region);

      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch RSS for keyword "${keyword}": ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const items = parseRssXml(xmlText);

      // Ajouter uniquement les items non dupliqués
      for (const item of items) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          allItems.push(item);
        }
      }

      // Petit délai entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error scraping Google News for keyword "${keyword}":`, error);
    }
  }

  // Trier par date (plus récent en premier) et limiter
  return allItems
    .sort((a, b) => {
      if (!a.publishedAt || !b.publishedAt) return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, maxResults);
}

/**
 * Vérifie si une news existe déjà en base (par URL source)
 */
export async function checkNewsExists(
  supabase: any,
  blogId: string,
  sourceUrl: string
): Promise<boolean> {
  const { data } = await supabase
    .from('news')
    .select('id')
    .eq('blog_id', blogId)
    .eq('source_url', sourceUrl)
    .single();

  return !!data;
}
