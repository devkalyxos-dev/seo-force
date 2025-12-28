import { ArticleCard, CategoryTabs, Newsletter, ProductCard, ArrowRightIcon } from '@/components';
import { getBlog, getArticlesWithImages, getFeaturedArticleWithImage, getProducts, getAffiliateId } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';
import { getBlogBackgrounds } from '@/lib/unsplash';
import Link from 'next/link';

export default async function HomePage() {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const [featuredArticle, articles, products, affiliateId] = await Promise.all([
    getFeaturedArticleWithImage(blog.id),
    getArticlesWithImages(blog.id, { limit: 6, offset: 1 }),
    getProducts(blog.id, { limit: 4 }),
    getAffiliateId(blog.id),
  ]);

  // Get unique backgrounds for this blog
  const backgrounds = getBlogBackgrounds(config.slug, blog.niche);

  return (
    <>
      {/* Hero - Featured Article with Unsplash Background */}
      {featuredArticle && (
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

      {/* Latest Articles Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2 block">Actualités</span>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Derniers articles
              </h2>
            </div>
            <Link
              href="/archives"
              className="text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1 transition-colors"
            >
              Voir tout
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <p>Aucun article pour le moment.</p>
              <p className="text-sm mt-2">Revenez bientôt !</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Products */}
      {products.length > 0 && affiliateId && (
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

      {/* Newsletter with Dark Background */}
      <Newsletter blogId={blog.id} backgroundImage={backgrounds.dark} />
    </>
  );
}
