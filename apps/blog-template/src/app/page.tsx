import { ArticleCard, CategoryTabs, Newsletter, ProductCard, LongScrollArticleCard, Pagination, ArrowRightIcon } from '@/components';
import { getBlog, getArticlesWithImages, getFeaturedArticleWithImage, getProducts, getAffiliateId, getArticlesCount } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';
import { getBlogBackgrounds } from '@/lib/unsplash';
import Link from 'next/link';

const ARTICLES_PER_PAGE = 12;

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  // Get current page from searchParams
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  // For first page, offset by 1 to skip featured article
  const articlesOffset = currentPage === 1 ? 1 : offset;
  const articlesLimit = currentPage === 1 ? ARTICLES_PER_PAGE - 1 : ARTICLES_PER_PAGE;

  const [featuredArticle, articles, products, affiliateId, totalCount] = await Promise.all([
    currentPage === 1 ? getFeaturedArticleWithImage(blog.id) : null,
    getArticlesWithImages(blog.id, { limit: articlesLimit, offset: articlesOffset }),
    getProducts(blog.id, { limit: 4 }),
    getAffiliateId(blog.id),
    getArticlesCount(blog.id),
  ]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  // Get unique backgrounds for this blog
  const backgrounds = getBlogBackgrounds(config.slug, blog.niche);

  return (
    <>
      {/* Hero - Featured Article with Unsplash Background (only on first page) */}
      {currentPage === 1 && featuredArticle && (
        <section
          className="relative pt-16 pb-16 md:pt-24 md:pb-24 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.85)), url('${backgrounds.hero}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-transparent to-primary-100/30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <ArticleCard article={featuredArticle} featured />
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Long-Scrolling Articles Section */}
      <section className="py-16 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2 block">
                Articles
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                {currentPage === 1 ? 'Derniers articles' : `Articles - Page ${currentPage}`}
              </h2>
            </div>
            {totalPages > 1 && (
              <span className="text-sm text-neutral-500">
                {totalCount} article{totalCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Long-Scrolling Article List */}
          {articles.length > 0 ? (
            <div className="space-y-8">
              {articles.map((article, index) => (
                <LongScrollArticleCard
                  key={article.id}
                  article={article}
                  priority={index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <p>Aucun article pour le moment.</p>
              <p className="text-sm mt-2">Revenez bientôt !</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/"
            />
          )}
        </div>
      </section>

      {/* Popular Products (only on first page) */}
      {currentPage === 1 && products.length > 0 && affiliateId && (
        <section className="py-24 bg-gradient-to-br from-primary-50/50 to-white relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2 block">Shopping</span>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  Produits populaires
                </h2>
                <p className="mt-2 text-neutral-500 text-sm">
                  Nos recommandations du moment.
                </p>
              </div>
              <Link
                href="/produits"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                Tous les produits
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  affiliateId={affiliateId}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter with Dark Background (only on first page) */}
      {currentPage === 1 && (
        <Newsletter blogId={blog.id} backgroundImage={backgrounds.dark} />
      )}
    </>
  );
}
