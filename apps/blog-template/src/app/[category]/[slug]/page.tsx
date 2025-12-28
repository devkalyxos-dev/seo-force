import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ProductCard,
  ClockIcon,
  ArrowRightIcon,
  Rating,
  ProsConsBox,
  VerdictBox,
  CompactProductCard,
  TableOfContents,
} from '@/components';
import { getBlog, getArticle, getArticlesWithImages, getProducts, getAffiliateId, enrichArticlesWithImages } from '@/lib/supabase';
import { getBlogConfig, CATEGORIES } from '@/lib/config';
import { buildAmazonAffiliateUrl } from '@/lib/affiliate';

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

  const categoryInfo = CATEGORIES.find((c) => c.slug === category);

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    alternates: {
      canonical: `/${category}/${slug}`,
    },
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: ['Expert'],
      section: categoryInfo?.label || category,
      tags: article.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
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

function getCategoryColor(categorySlug: string): string {
  const colors: Record<string, string> = {
    reviews: 'bg-blue-500',
    guides: 'bg-emerald-500',
    comparatifs: 'bg-purple-500',
    tops: 'bg-amber-500',
  };
  return colors[categorySlug] || 'bg-primary-500';
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const rawArticle = await getArticle(blog.id, slug);

  if (!rawArticle || rawArticle.category !== category) {
    notFound();
  }

  // Enrich article with product image if no featured_image
  const [enrichedArticles] = await Promise.all([
    enrichArticlesWithImages(blog.id, [rawArticle]),
  ]);
  const article = enrichedArticles[0];

  // Get related products and articles
  const [affiliateId, relatedArticles] = await Promise.all([
    getAffiliateId(blog.id),
    getArticlesWithImages(blog.id, { category, limit: 4 }),
  ]);

  // Get products mentioned in the article
  const productIds = article.amazon_products?.map((p: { asin: string }) => p.asin) || [];
  const products = productIds.length > 0
    ? await getProducts(blog.id, { productIds })
    : [];

  // Filter out current article from related
  const filteredRelatedArticles = relatedArticles.filter((a) => a.id !== article.id).slice(0, 3);

  // Build JSON-LD structured data
  const baseUrl = blog.domain
    ? `https://${blog.domain}`
    : `https://${config.slug}.vercel.app`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image || undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: 'Expert',
    },
    publisher: {
      '@type': 'Organization',
      name: blog.name,
      logo: {
        '@type': 'ImageObject',
        url: blog.logo_url || `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${category}/${article.slug}`,
    },
    keywords: article.tags?.join(', ') || '',
    articleSection: getCategoryLabel(category),
    wordCount: article.content?.split(/\s+/).length || 0,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: getCategoryLabel(category),
        item: `${baseUrl}/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${baseUrl}/${category}/${article.slug}`,
      },
    ],
  };

  // Get first product for sidebar
  const mainProduct = products[0];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Article Header - Compact */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Accueil
            </Link>
            <span className="text-neutral-300">/</span>
            <Link href={`/${category}`} className="hover:text-neutral-900 transition-colors">
              {getCategoryLabel(category)}
            </Link>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1 max-w-3xl">
              {/* Category Badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full ${getCategoryColor(category)} text-white text-xs font-semibold uppercase tracking-wider mb-4`}>
                {getCategoryLabel(category)}
              </span>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-4">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-lg text-neutral-600 leading-relaxed mb-4">
                  {article.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-600">AI</span>
                  </div>
                  <span className="font-medium text-neutral-700">Expert</span>
                </div>
                <span className="text-neutral-300">|</span>
                <span>{formatDate(article.published_at)}</span>
                <span className="text-neutral-300">|</span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {article.reading_time} min
                </span>
              </div>
            </div>

            {/* Rating Badge (if available) */}
            {mainProduct?.rating && (
              <div className="flex-shrink-0 text-center">
                <div className="inline-flex flex-col items-center bg-neutral-50 rounded-2xl p-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Note</span>
                  <div className="text-4xl font-bold text-neutral-900">{mainProduct.rating.toFixed(1)}</div>
                  <Rating score={mainProduct.rating} size="sm" showLabel={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Article Content */}
          <article className="flex-1 min-w-0">
            {/* Featured Image - Contained */}
            {article.featured_image && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-neutral-100 mb-8">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            )}

            {/* Table of Contents - Mobile */}
            <div className="lg:hidden">
              <TableOfContents content={article.content} />
            </div>

            {/* Article Body */}
            <div
              className="article-content prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-neutral-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-neutral-100
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-neutral-700 prose-p:leading-relaxed
                prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-neutral-900
                prose-ul:my-4 prose-li:text-neutral-700
                prose-img:rounded-xl prose-img:my-6
                prose-table:border prose-table:border-neutral-200 prose-th:bg-neutral-50 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-neutral-100"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Products Mentioned */}
            {products.length > 0 && affiliateId && (
              <div className="mt-12 pt-8 border-t border-neutral-100">
                <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                  Produits mentionnés
                </h2>
                <div className="space-y-3">
                  {products.map((product) => (
                    <CompactProductCard
                      key={product.id}
                      name={product.title}
                      image={product.image_url || undefined}
                      price={product.price ? `${product.price.toFixed(2)}€` : undefined}
                      rating={product.rating || undefined}
                      affiliateUrl={buildAmazonAffiliateUrl(product.asin, affiliateId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-neutral-100">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-sm rounded-full hover:bg-neutral-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Table of Contents - Desktop */}
              <div className="hidden lg:block bg-neutral-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Sommaire
                </h4>
                <TableOfContents content={article.content} />
              </div>

              {/* Main Product Card */}
              {mainProduct && affiliateId && (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                  {mainProduct.image_url && (
                    <div className="aspect-square bg-neutral-50 p-4 relative">
                      <Image
                        src={mainProduct.image_url}
                        alt={mainProduct.title}
                        fill
                        className="object-contain p-4"
                        sizes="300px"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                      {mainProduct.title}
                    </h3>
                    {mainProduct.rating && (
                      <div className="mb-3">
                        <Rating score={mainProduct.rating} size="sm" />
                      </div>
                    )}
                    {mainProduct.price && (
                      <div className="text-2xl font-bold text-neutral-900 mb-4">
                        {mainProduct.price.toFixed(2)}€
                      </div>
                    )}
                    <a
                      href={buildAmazonAffiliateUrl(mainProduct.asin, affiliateId)}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      className="block w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white text-center font-semibold rounded-xl transition-colors"
                    >
                      Voir sur Amazon
                    </a>
                  </div>
                </div>
              )}

              {/* Other Products */}
              {products.length > 1 && affiliateId && (
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-3">Voir aussi</h4>
                  <div className="space-y-3">
                    {products.slice(1, 3).map((product) => (
                      <a
                        key={product.id}
                        href={buildAmazonAffiliateUrl(product.asin, affiliateId)}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        className="flex items-center gap-3 p-2 bg-white rounded-lg hover:shadow-sm transition-shadow"
                      >
                        {product.image_url && (
                          <div className="w-12 h-12 relative flex-shrink-0">
                            <Image
                              src={product.image_url}
                              alt={product.title}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                            {product.title}
                          </p>
                          {product.price && (
                            <p className="text-sm font-bold text-neutral-700">
                              {product.price.toFixed(2)}€
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles */}
      {filteredRelatedArticles.length > 0 && (
        <section className="py-12 lg:py-16 bg-neutral-50 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">
                Articles similaires
              </h2>
              <Link
                href={`/${category}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Voir tout
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRelatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/${relatedArticle.category}/${relatedArticle.slug}`}
                  className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-[16/10] relative bg-neutral-100">
                    {relatedArticle.featured_image && (
                      <Image
                        src={relatedArticle.featured_image}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <span className={`absolute top-3 left-3 px-2 py-1 ${getCategoryColor(relatedArticle.category)} text-white text-xs font-semibold rounded-full`}>
                      {getCategoryLabel(relatedArticle.category)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">
                      {relatedArticle.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
