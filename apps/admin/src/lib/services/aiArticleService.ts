import OpenAI from 'openai';
import type { Article, Product, Blog } from '@seo-force/shared';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ArticleType = 'review' | 'guide' | 'comparatif' | 'top';

export interface GenerateArticleParams {
  blog: Blog;
  type: ArticleType;
  subject: string;
  products?: Product[];
  keywords?: string[];
  tone?: 'professional' | 'casual' | 'enthusiastic';
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  tags: string[];
  readingTime: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function getCategoryFromType(type: ArticleType): string {
  const categoryMap: Record<ArticleType, string> = {
    review: 'reviews',
    guide: 'guides',
    comparatif: 'comparatifs',
    top: 'tops',
  };
  return categoryMap[type];
}

export async function generateArticle(params: GenerateArticleParams): Promise<GeneratedArticle> {
  const { blog, type, subject, products = [], keywords = [], tone = 'professional' } = params;

  // Build product context if available
  let productContext = '';
  if (products.length > 0) {
    productContext = '\n\nProduits à inclure dans l\'article:\n';
    products.forEach((product, index) => {
      productContext += `\n${index + 1}. ${product.title}`;
      if (product.price) productContext += ` - ${product.price}€`;
      if (product.rating) productContext += ` - Note: ${product.rating}/5`;
      if (product.features && product.features.length > 0) {
        productContext += `\n   Caractéristiques: ${product.features.slice(0, 3).join(', ')}`;
      }
      productContext += `\n   ASIN: ${product.product_id}`;
    });
  }

  // Build the prompt based on article type
  const prompts: Record<ArticleType, string> = {
    review: `Écris un test/review détaillé et objectif sur: ${subject}

Structure attendue:
1. Introduction accrocheuse
2. Présentation du produit
3. Caractéristiques principales
4. Points forts (avec liste)
5. Points faibles (avec liste)
6. Notre avis
7. Conclusion avec verdict

Le contenu doit être:
- Honnête et équilibré
- Basé sur une analyse approfondie
- Utile pour le lecteur qui hésite à acheter
- Optimisé SEO avec le mot-clé principal

${productContext}`,

    guide: `Écris un guide d'achat complet sur: ${subject}

Structure attendue:
1. Introduction expliquant pourquoi ce guide est utile
2. Les critères essentiels à considérer avant l'achat
3. Les différents types/catégories de produits
4. Les erreurs à éviter
5. Notre sélection recommandée
6. FAQ (3-5 questions fréquentes)
7. Conclusion avec conseils finaux

Le contenu doit être:
- Éducatif et informatif
- Structuré avec des sous-titres clairs
- Pratique avec des conseils actionables
- Optimisé SEO

${productContext}`,

    comparatif: `Écris un comparatif détaillé: ${subject}

Structure attendue:
1. Introduction présentant les produits comparés
2. Tableau récapitulatif des caractéristiques
3. Comparaison détaillée critère par critère
4. Pour quel profil d'utilisateur chaque produit ?
5. Notre verdict final
6. Conclusion

Le contenu doit être:
- Objectif et factuel
- Avec des comparaisons précises
- Utile pour aider à choisir
- Optimisé SEO

${productContext}`,

    top: `Écris un article "TOP/Meilleurs" sur: ${subject}

Structure attendue:
1. Introduction expliquant la méthodologie de sélection
2. Liste numérotée des produits (du meilleur au moins bien)
3. Pour chaque produit:
   - Titre avec position (#1, #2, etc.)
   - Description courte
   - Points forts
   - Points faibles
   - Pour qui ?
   - Prix indicatif
4. Conclusion avec récapitulatif

Le contenu doit être:
- Engageant et facile à parcourir
- Avec un classement justifié
- Utile pour décider rapidement
- Optimisé SEO

${productContext}`,
  };

  const toneInstructions: Record<string, string> = {
    professional: 'Adopte un ton professionnel et expert, avec un vocabulaire précis.',
    casual: 'Adopte un ton décontracté et accessible, comme si tu parlais à un ami.',
    enthusiastic: 'Adopte un ton enthousiaste et passionné, tout en restant crédible.',
  };

  const systemPrompt = `Tu es un rédacteur expert en contenu d'affiliation pour le blog "${blog.name}" dans la niche "${blog.niche}".

Règles importantes:
- Écris en français
- Utilise le format HTML pour le contenu (h2, h3, p, ul, li, strong, em)
- N'utilise JAMAIS de h1 (le titre sera ajouté séparément)
- Inclus des appels à l'action naturels vers Amazon
- Pour chaque produit mentionné, inclus un bouton d'achat avec l'ASIN
- ${toneInstructions[tone]}
- Mots-clés à intégrer naturellement: ${keywords.join(', ') || 'aucun spécifié'}

Format des liens affiliés à utiliser:
<a href="AFFILIATE_LINK_ASIN_HERE" class="affiliate-btn" target="_blank" rel="nofollow sponsored">Voir sur Amazon</a>

Remplace ASIN_HERE par l'ASIN du produit.`;

  // Generate the article content
  const contentResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompts[type] },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = contentResponse.choices[0]?.message?.content || '';

  // Generate title and meta
  const metaResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Tu génères des métadonnées SEO optimisées pour des articles d'affiliation.
Réponds uniquement en JSON valide avec ce format exact:
{
  "title": "Titre accrocheur de l'article (max 60 caractères)",
  "seoTitle": "Titre SEO optimisé avec mot-clé principal (max 60 caractères)",
  "seoDescription": "Meta description engageante avec call-to-action (max 155 caractères)",
  "excerpt": "Résumé de l'article en 2-3 phrases (max 200 caractères)",
  "tags": ["tag1", "tag2", "tag3"]
}`,
      },
      {
        role: 'user',
        content: `Génère les métadonnées pour cet article de type "${type}" sur le sujet: "${subject}"

Blog: ${blog.name}
Niche: ${blog.niche}

Contenu de l'article (début):
${content.slice(0, 1000)}...`,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  });

  let meta = {
    title: subject,
    seoTitle: subject,
    seoDescription: `Découvrez notre ${type} sur ${subject}`,
    excerpt: `Notre ${type} complet sur ${subject}.`,
    tags: [] as string[],
  };

  try {
    const metaContent = metaResponse.choices[0]?.message?.content || '';
    const jsonMatch = metaContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      meta = JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing meta response:', error);
  }

  return {
    title: meta.title,
    slug: slugify(meta.title),
    excerpt: meta.excerpt,
    content,
    seoTitle: meta.seoTitle,
    seoDescription: meta.seoDescription,
    category: getCategoryFromType(type),
    tags: meta.tags,
    readingTime: estimateReadingTime(content),
  };
}

export async function generateArticleIdeas(
  blog: Blog,
  count: number = 5
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en stratégie de contenu pour les blogs d'affiliation.
Génère des idées d'articles qui ont un fort potentiel SEO et de conversion.
Réponds uniquement avec une liste JSON de titres d'articles.`,
      },
      {
        role: 'user',
        content: `Génère ${count} idées d'articles pour le blog "${blog.name}" dans la niche "${blog.niche}".

Types d'articles possibles:
- Reviews de produits spécifiques
- Guides d'achat thématiques
- Comparatifs entre produits populaires
- TOP/Classements des meilleurs produits

Format de réponse attendu:
["Idée 1", "Idée 2", ...]`,
      },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  try {
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing ideas response:', error);
  }

  return [];
}
