import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductFilters } from '@/components';
import { getBlog, getProducts, getAffiliateId } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  return {
    title: 'Tous nos produits',
    description: `Découvrez tous les produits testés et recommandés par ${blog?.name || 'notre équipe'}. Comparatifs, avis et meilleurs prix.`,
    alternates: {
      canonical: '/produits',
    },
    openGraph: {
      title: `Produits | ${blog?.name || 'Blog'}`,
      description: 'Tous les produits testés et recommandés',
      type: 'website',
    },
  };
}

export default async function ProductsPage() {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const products = await getProducts(blog.id);
  const affiliateId = await getAffiliateId(blog.id, 'amazon');

  // Build JSON-LD structured data
  const baseUrl = blog.domain
    ? `https://${blog.domain}`
    : `https://${config.slug}.vercel.app`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tous nos produits',
    description: `Découvrez tous les produits testés et recommandés par ${blog.name}`,
    url: `${baseUrl}/produits`,
    isPartOf: {
      '@type': 'WebSite',
      name: blog.name,
      url: baseUrl,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          image: product.images?.[0],
          offers: product.price ? {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency || 'EUR',
          } : undefined,
          aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.review_count || 0,
          } : undefined,
        },
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
        name: 'Produits',
        item: `${baseUrl}/produits`,
      },
    ],
  };

  // Stats for hero
  const priceStats = {
    budget: products.filter(p => p.price && p.price < 100).length,
    midRange: products.filter(p => p.price && p.price >= 100 && p.price < 200).length,
    premium: products.filter(p => p.price && p.price >= 200).length,
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
            <span className="text-neutral-900">Produits</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 mb-4">
            Tous nos produits
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl">
            Découvrez notre sélection de {products.length} produits testés et recommandés.
            Trouvez le meilleur rapport qualité-prix pour vos achats.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">{products.length}</div>
              <div className="text-sm text-neutral-500">Produits testés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">{priceStats.budget}</div>
              <div className="text-sm text-neutral-500">Moins de 100€</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">{priceStats.midRange}</div>
              <div className="text-sm text-neutral-500">100€ - 200€</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">{priceStats.premium}</div>
              <div className="text-sm text-neutral-500">Plus de 200€</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products with Filters */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {products.length > 0 ? (
            <ProductFilters
              products={products}
              affiliateId={affiliateId || ''}
            />
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Aucun produit pour le moment
              </h2>
              <p className="text-neutral-500 mb-6">
                Les produits arrivent bientôt !
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Retour à l'accueil
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
