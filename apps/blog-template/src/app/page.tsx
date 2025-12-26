import { ArticleCard, CategoryTabs, Newsletter, ProductCard, ArrowRightIcon } from '@/components';
import { getBlog, getArticles, getFeaturedArticle, getProducts, getAffiliateId } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';
import Link from 'next/link';

export default async function HomePage() {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const [featuredArticle, articles, products, affiliateId] = await Promise.all([
    getFeaturedArticle(blog.id),
    getArticles(blog.id, { limit: 6, offset: 1 }),
    getProducts(blog.id, { limit: 4 }),
    getAffiliateId(blog.id),
  ]);

  return (
    <>
      {/* Hero - Featured Article */}
      {featuredArticle && (
        <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6">
            <ArticleCard article={featuredArticle} featured />
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Latest Articles Grid */}
      <section className="py-20 bg-neutral-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Derniers articles
            </h2>
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
        <section className="py-24 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
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

      {/* Newsletter */}
      <Newsletter blogId={blog.id} />
    </>
  );
}
