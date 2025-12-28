import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Blog, Article, Product, LegalPage, News } from '@seo-force/shared';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// Get the current blog configuration
export async function getBlog(slug: string): Promise<Blog | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog:', error);
    return null;
  }

  return data;
}

// Get published articles for the blog
export async function getArticles(
  blogId: string,
  options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Article[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('articles')
    .select('*')
    .eq('blog_id', blogId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

// Get a single article by slug
export async function getArticle(
  blogId: string,
  slug: string
): Promise<Article | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('blog_id', blogId)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

// Get featured article
export async function getFeaturedArticle(blogId: string): Promise<Article | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('blog_id', blogId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching featured article:', error);
    return null;
  }

  return data;
}

// Get products for the blog
export async function getProducts(
  blogId: string,
  options?: {
    limit?: number;
    productIds?: string[];
  }
): Promise<Product[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('products')
    .select('*')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: false });

  if (options?.productIds) {
    query = query.in('product_id', options.productIds);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

// Get a single product
export async function getProduct(
  blogId: string,
  productId: string
): Promise<Product | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('blog_id', blogId)
    .eq('product_id', productId)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

// Get legal page content
export async function getLegalPage(
  blogId: string,
  type: 'mentions' | 'privacy' | 'cgv' | 'about'
): Promise<LegalPage | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('blog_id', blogId)
    .eq('type', type)
    .single();

  if (error) {
    console.error('Error fetching legal page:', error);
    return null;
  }

  return data;
}

// Subscribe to newsletter
export async function subscribeNewsletter(
  blogId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('subscribers')
    .insert({ blog_id: blogId, email });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Cet email est déjà inscrit.' };
    }
    return { success: false, error: 'Une erreur est survenue.' };
  }

  return { success: true };
}

// Get affiliate ID for the blog
export async function getAffiliateId(
  blogId: string,
  partnerId: string = 'amazon'
): Promise<string | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('blog_affiliate_ids')
    .select('affiliate_id')
    .eq('blog_id', blogId)
    .eq('partner_id', partnerId)
    .single();

  if (error) {
    console.error('Error fetching affiliate ID:', error);
    return null;
  }

  return data?.affiliate_id || null;
}

// Get all secondary product images for a blog (excluding primary images)
export async function getProductSecondaryImages(blogId: string): Promise<string[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('products')
    .select('images')
    .eq('blog_id', blogId);

  if (error || !data) {
    console.error('Error fetching product images:', error);
    return [];
  }

  // Collect all secondary images (skip the first image of each product)
  const secondaryImages: string[] = [];
  for (const product of data) {
    if (product.images && Array.isArray(product.images) && product.images.length > 1) {
      // Add images starting from index 1 (skip the main product image)
      secondaryImages.push(...product.images.slice(1));
    }
  }

  return secondaryImages;
}

// Simple hash function for deterministic randomness
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Enrich articles with product images
export async function enrichArticlesWithImages(
  blogId: string,
  articles: Article[]
): Promise<Article[]> {
  // Get all secondary product images
  const images = await getProductSecondaryImages(blogId);

  if (images.length === 0) {
    return articles;
  }

  // Assign an image to each article that doesn't have one
  return articles.map((article) => {
    if (article.featured_image) {
      return article;
    }

    // Use article ID as seed for deterministic selection
    const index = hashString(article.id) % images.length;
    return {
      ...article,
      featured_image: images[index],
    };
  });
}

// Get articles with images
export async function getArticlesWithImages(
  blogId: string,
  options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Article[]> {
  const articles = await getArticles(blogId, options);
  return enrichArticlesWithImages(blogId, articles);
}

// Get featured article with image
export async function getFeaturedArticleWithImage(blogId: string): Promise<Article | null> {
  const article = await getFeaturedArticle(blogId);
  if (!article) return null;

  const enriched = await enrichArticlesWithImages(blogId, [article]);
  return enriched[0] || null;
}

// Count total published articles for pagination
export async function getArticlesCount(
  blogId: string,
  options?: { category?: string }
): Promise<number> {
  const supabase = getSupabase();

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('blog_id', blogId)
    .eq('status', 'published');

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting articles:', error);
    return 0;
  }

  return count || 0;
}

// ============================================
// NEWS (Actualités)
// ============================================

// Get published news for the blog
export async function getNews(
  blogId: string,
  options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<News[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('news')
    .select('*')
    .eq('blog_id', blogId)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  // Map snake_case to camelCase
  return (data || []).map((item: any) => ({
    id: item.id,
    blogId: item.blog_id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    sourceTitle: item.source_title,
    sourceUrl: item.source_url,
    sourceDomain: item.source_domain,
    sourcePublishedAt: item.source_published_at,
    category: item.category,
    tags: item.tags || [],
    featuredImage: item.featured_image,
    isPublished: item.is_published,
    publishedAt: item.published_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

// Count total published news for pagination
export async function getNewsCount(
  blogId: string,
  options?: { category?: string }
): Promise<number> {
  const supabase = getSupabase();

  let query = supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .eq('blog_id', blogId)
    .eq('is_published', true);

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting news:', error);
    return 0;
  }

  return count || 0;
}
