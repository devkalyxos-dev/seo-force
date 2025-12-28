import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArticleCard, CategoryTabs, ArrowRightIcon } from '@/components';
import { getBlog, getArticlesWithImages } from '@/lib/supabase';
import { getBlogConfig, CATEGORIES } from '@/lib/config';
import Link from 'next/link';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = CATEGORIES.find((c) => c.slug === category);

  if (!categoryInfo) {
    return { title: 'Catégorie non trouvée' };
  }

  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  return {
    title: categoryInfo.label,
    description: `${categoryInfo.description} - ${blog?.name || 'Blog'}`,
    alternates: {
      canonical: `/${category}`,
    },
    openGraph: {
      title: `${categoryInfo.label} | ${blog?.name || 'Blog'}`,
      description: categoryInfo.description,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryInfo = CATEGORIES.find((c) => c.slug === category);

  if (!categoryInfo) {
    notFound();
  }

  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const articles = await getArticlesWithImages(blog.id, { category, limit: 12 });

  // Build JSON-LD structured data for category page
  const baseUrl = blog.domain
    ? `https://${blog.domain}`
    : `https://${config.slug}.vercel.app`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryInfo.label,
    description: categoryInfo.description,
    url: `${baseUrl}/${category}`,
    isPartOf: {
      '@type': 'WebSite',
      name: blog.name,
      url: baseUrl,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 10).map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}/${article.category}/${article.slug}`,
        name: article.title,
      })),
    },
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
        name: categoryInfo.label,
        item: `${baseUrl}/${category}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/" className="hover:text-neutral-900">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-neutral-900">{categoryInfo.label}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 mb-4">
            {categoryInfo.label}
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl">
            {categoryInfo.description}
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Articles Grid */}
      <section className="py-16 bg-neutral-50/30">
        <div className="max-w-7xl mx-auto px-6">
          {articles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Aucun article dans cette catégorie
              </h2>
              <p className="text-neutral-500 mb-6">
                Les articles arrivent bientôt !
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Retour à l'accueil
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
