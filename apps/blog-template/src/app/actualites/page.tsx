import { Metadata } from 'next';
import { NewsCard, Pagination, NewspaperIcon } from '@/components';
import { getBlog, getNews, getNewsCount } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';

const NEWS_PER_PAGE = 12;

interface ActualitesPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return { title: 'Actualités' };
  }

  return {
    title: `Actualités ${blog.niche} | ${blog.name}`,
    description: `Toutes les actualités de l'univers ${blog.niche}. Restez informé des dernières tendances, innovations et nouvelles du secteur.`,
    openGraph: {
      title: `Actualités ${blog.niche} | ${blog.name}`,
      description: `Toutes les actualités de l'univers ${blog.niche}`,
      type: 'website',
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ActualitesPage({ searchParams }: ActualitesPageProps) {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  // Get current page and category from searchParams
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const category = params.category || undefined;
  const offset = (currentPage - 1) * NEWS_PER_PAGE;

  const [news, totalCount] = await Promise.all([
    getNews(blog.id, { limit: NEWS_PER_PAGE, offset, category }),
    getNewsCount(blog.id, { category }),
  ]);

  const totalPages = Math.ceil(totalCount / NEWS_PER_PAGE);

  // Categories for filtering
  const categories = [
    { slug: '', label: 'Toutes' },
    { slug: 'tech', label: 'Tech' },
    { slug: 'economie', label: 'Économie' },
    { slug: 'tendances', label: 'Tendances' },
    { slug: 'lifestyle', label: 'Lifestyle' },
    { slug: 'createurs', label: 'Créateurs' },
    { slug: 'juridique', label: 'Juridique' },
  ];

  // Build base URL for pagination
  const baseUrl = category ? `/actualites?category=${category}` : '/actualites';

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <NewspaperIcon className="w-4 h-4" />
              Actualités
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              L'actualité de l'univers {blog.niche}
            </h1>
            <p className="text-lg text-neutral-600">
              Restez informé des dernières tendances, innovations et nouvelles du secteur.
              Sources vérifiées et résumés exclusifs.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="sticky top-16 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isActive = (cat.slug === '' && !category) || cat.slug === category;
              const href = cat.slug ? `/actualites?category=${cat.slug}` : '/actualites';

              return (
                <a
                  key={cat.slug || 'all'}
                  href={href}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Stats */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-neutral-900">
              {category
                ? `Actualités ${categories.find(c => c.slug === category)?.label || category}`
                : 'Dernières actualités'}
            </h2>
            <span className="text-sm text-neutral-500">
              {totalCount} actualité{totalCount > 1 ? 's' : ''}
            </span>
          </div>

          {/* News List */}
          {news.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
              <NewspaperIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Aucune actualité
              </h3>
              <p className="text-neutral-500">
                {category
                  ? `Aucune actualité dans la catégorie "${categories.find(c => c.slug === category)?.label || category}".`
                  : 'Les actualités seront bientôt disponibles.'}
              </p>
              {category && (
                <a
                  href="/actualites"
                  className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Voir toutes les actualités
                </a>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={baseUrl}
            />
          )}
        </div>
      </section>

      {/* SEO Notice */}
      <section className="py-8 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs text-neutral-500 text-center">
            Les actualités présentées sont des résumés éditoriaux.
            Les sources originales sont citées et liées pour chaque article.
          </p>
        </div>
      </section>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Actualités ${blog.niche}`,
            description: `Toutes les actualités de l'univers ${blog.niche}`,
            url: `${blog.domain || ''}/actualites`,
            isPartOf: {
              '@type': 'WebSite',
              name: blog.name,
            },
            hasPart: news.slice(0, 10).map((item) => ({
              '@type': 'NewsArticle',
              headline: item.title,
              description: item.summary,
              datePublished: item.publishedAt,
              citation: {
                '@type': 'WebPage',
                name: item.sourceTitle,
                url: item.sourceUrl,
              },
            })),
          }),
        }}
      />
    </>
  );
}
