import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard, ClockIcon, ArrowRightIcon } from '@/components';
import { getBlog, getArticle, getArticles, getProducts, getAffiliateId } from '@/lib/supabase';
import { getBlogConfig, CATEGORIES } from '@/lib/config';

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return { title: 'Article non trouvé' };
  }

  const article = await getArticle(blog.id, slug);

  if (!article) {
    return { title: 'Article non trouvé' };
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
  };
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getCategoryLabel(categorySlug: string): string {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  return category?.label || categorySlug;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const article = await getArticle(blog.id, slug);

  if (!article || article.category !== category) {
    notFound();
  }

  // Get related products and articles
  const [affiliateId, relatedArticles] = await Promise.all([
    getAffiliateId(blog.id),
    getArticles(blog.id, { category, limit: 3 }),
  ]);

  // Get products mentioned in the article
  const productIds = article.amazon_products?.map((p: { asin: string }) => p.asin) || [];
  const products = productIds.length > 0
    ? await getProducts(blog.id, { productIds })
    : [];

  // Filter out current article from related
  const filteredRelatedArticles = relatedArticles.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <>
      {/* Article Header */}
      <article className="pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/" className="hover:text-neutral-900">
              Accueil
            </Link>
            <span>/</span>
            <Link href={`/${category}`} className="hover:text-neutral-900">
              {getCategoryLabel(category)}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 line-clamp-1">{article.title}</span>
          </nav>

          {/* Category & Meta */}
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider">
              {getCategoryLabel(category)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-neutral-500">
              <ClockIcon className="w-4 h-4" />
              {article.reading_time} min de lecture
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-neutral-500 leading-relaxed mb-8">
              {article.excerpt}
            </p>
          )}

          {/* Author & Date */}
          <div className="flex items-center gap-4 pb-8 border-b border-neutral-100">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
              <span className="text-sm font-bold text-neutral-600">AI</span>
            </div>
            <div>
              <p className="font-medium text-neutral-900">Expert</p>
              <p className="text-sm text-neutral-500">
                {formatDate(article.published_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="max-w-5xl mx-auto px-6 mt-10">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div
            className="article-content prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Products Section */}
        {products.length > 0 && affiliateId && (
          <div className="max-w-4xl mx-auto px-6 py-12 border-t border-neutral-100">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-8">
              Produits mentionnés
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  affiliateId={affiliateId}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="max-w-4xl mx-auto px-6 py-8 border-t border-neutral-100">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Articles */}
      {filteredRelatedArticles.length > 0 && (
        <section className="py-16 bg-neutral-50/50 border-t border-neutral-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Articles similaires
              </h2>
              <Link
                href={`/${category}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Voir tout
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {filteredRelatedArticles.map((relatedArticle) => (
                <article
                  key={relatedArticle.id}
                  className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link
                    href={`/${relatedArticle.category}/${relatedArticle.slug}`}
                    className="block"
                  >
                    <div className="aspect-[16/9] relative bg-neutral-100">
                      {relatedArticle.featured_image && (
                        <Image
                          src={relatedArticle.featured_image}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-2 line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
