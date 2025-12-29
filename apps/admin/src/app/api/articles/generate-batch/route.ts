import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateArticle, ArticleType } from '@/lib/services/aiArticleService';

interface GenerateAndSaveParams {
  blog: any;
  type: ArticleType;
  products: any[];
  blog_id: string;
  supabase: any;
}

async function generateAndSave({ blog, type, products, blog_id, supabase }: GenerateAndSaveParams) {
  // Generate subject from main product
  const subject = products[0]?.title || 'Article';

  // Generate the article
  const generatedArticle = await generateArticle({
    blog,
    type,
    subject,
    products,
    keywords: products[0]?.features?.slice(0, 3) || [],
    tone: 'enthusiastic',
  });

  // Check if slug already exists
  const { data: existing } = await supabase
    .from('articles')
    .select('slug')
    .eq('blog_id', blog_id)
    .eq('slug', generatedArticle.slug)
    .single();

  let finalSlug = generatedArticle.slug;
  if (existing) {
    finalSlug = `${generatedArticle.slug}-${Date.now()}`;
  }

  // Save the article (always as draft)
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .insert({
      blog_id,
      title: generatedArticle.title,
      slug: finalSlug,
      excerpt: generatedArticle.excerpt,
      content: generatedArticle.content,
      category: generatedArticle.category,
      tags: generatedArticle.tags,
      reading_time: generatedArticle.readingTime,
      seo_title: generatedArticle.seoTitle,
      seo_description: generatedArticle.seoDescription,
      status: 'draft',
      published_at: null,
      product_ids: products.map((p) => p.id),
    })
    .select()
    .single();

  if (articleError) {
    throw new Error(`Erreur lors de la sauvegarde: ${articleError.message}`);
  }

  return article;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { blog_id, product_id, other_product_ids = [] } = body;

  if (!blog_id || !product_id) {
    return NextResponse.json(
      { error: 'blog_id et product_id sont requis' },
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

    // Get the main product
    const { data: mainProduct, error: mainProductError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (mainProductError || !mainProduct) {
      return NextResponse.json(
        { error: 'Produit principal non trouvé' },
        { status: 404 }
      );
    }

    // Get other products for comparatif/top
    let otherProducts: any[] = [];
    if (other_product_ids.length > 0) {
      const { data: otherProductsData } = await supabase
        .from('products')
        .select('*')
        .in('id', other_product_ids);
      otherProducts = otherProductsData || [];
    }

    const results: any[] = [];
    const errors: string[] = [];

    // 1. Review - produit seul
    try {
      const review = await generateAndSave({
        blog,
        type: 'review',
        products: [mainProduct],
        blog_id,
        supabase,
      });
      results.push({ type: 'review', article: review });
    } catch (error) {
      errors.push(`Review: ${error instanceof Error ? error.message : 'Erreur'}`);
    }

    // 2. Guide - produit seul
    try {
      const guide = await generateAndSave({
        blog,
        type: 'guide',
        products: [mainProduct],
        blog_id,
        supabase,
      });
      results.push({ type: 'guide', article: guide });
    } catch (error) {
      errors.push(`Guide: ${error instanceof Error ? error.message : 'Erreur'}`);
    }

    // 3. Comparatif - produit principal + 1-2 autres
    try {
      const comparatifProducts = [mainProduct, ...otherProducts.slice(0, 2)];
      const comparatif = await generateAndSave({
        blog,
        type: 'comparatif',
        products: comparatifProducts,
        blog_id,
        supabase,
      });
      results.push({ type: 'comparatif', article: comparatif });
    } catch (error) {
      errors.push(`Comparatif: ${error instanceof Error ? error.message : 'Erreur'}`);
    }

    // 4. TOP - tous les produits
    try {
      const topProducts = [mainProduct, ...otherProducts];
      const top = await generateAndSave({
        blog,
        type: 'top',
        products: topProducts,
        blog_id,
        supabase,
      });
      results.push({ type: 'top', article: top });
    } catch (error) {
      errors.push(`TOP: ${error instanceof Error ? error.message : 'Erreur'}`);
    }

    return NextResponse.json({
      success: true,
      articles: results,
      errors: errors.length > 0 ? errors : undefined,
      mainProduct: {
        id: mainProduct.id,
        title: mainProduct.title,
      },
    });
  } catch (error) {
    console.error('Error in batch generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
