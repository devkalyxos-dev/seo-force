import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateArticle, ArticleType } from '@/lib/services/aiArticleService';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const {
    blog_id,
    type,
    subject,
    product_ids,
    keywords,
    tone,
    publish,
  } = body;

  if (!blog_id || !type || !subject) {
    return NextResponse.json(
      { error: 'blog_id, type et subject sont requis' },
      { status: 400 }
    );
  }

  const validTypes: ArticleType[] = ['review', 'guide', 'comparatif', 'top'];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: 'Type invalide. Valeurs acceptées: review, guide, comparatif, top' },
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

    // Get products if specified
    let products: any[] = [];
    if (product_ids && product_ids.length > 0) {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('blog_id', blog_id)
        .in('id', product_ids);

      products = productData || [];
    }

    // Generate the article
    const generatedArticle = await generateArticle({
      blog,
      type,
      subject,
      products,
      keywords: keywords || [],
      tone: tone || 'professional',
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

    // Save the article
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
        status: publish ? 'published' : 'draft',
        published_at: publish ? new Date().toISOString() : null,
        product_ids: products.map((p) => p.id),
      })
      .select()
      .single();

    if (articleError) {
      return NextResponse.json(
        { error: articleError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      article,
      generated: generatedArticle,
    });
  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
