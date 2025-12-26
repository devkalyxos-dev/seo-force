import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Blog, Article, Product, LegalPage } from '@seo-force/shared';

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
