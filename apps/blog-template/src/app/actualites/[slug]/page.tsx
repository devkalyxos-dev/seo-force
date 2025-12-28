import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabase, getBlog } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';
import { Header, Footer } from '@/components';
import { ArrowLeftIcon, ExternalLinkIcon, ClockIcon, NewspaperIcon } from '@/components/Icons';
import { formatDate } from '@/lib/utils';
import type { News, Blog } from '@seo-force/shared';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getNewsBySlug(blogId: string, slug: string): Promise<News | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('blog_id', blogId)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    blogId: data.blog_id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    content: data.content,
    sourceTitle: data.source_title,
    sourceUrl: data.source_url,
    sourceDomain: data.source_domain,
    sourcePublishedAt: data.source_published_at,
    category: data.category,
    tags: data.tags || [],
    featuredImage: data.featured_image,
    isPublished: data.is_published,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function getCategoryLabel(category?: string): string {
  const labels: Record<string, string> = {
    economie: 'Économie',
    juridique: 'Juridique',
    tendances: 'Tendances',
    tech: 'Tech',
    lifestyle: 'Lifestyle',
    createurs: 'Créateurs',
  };
  return labels[category || ''] || 'Actualité';
}

function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    economie: 'bg-emerald-100 text-emerald-700',
    juridique: 'bg-slate-100 text-slate-700',
    tendances: 'bg-pink-100 text-pink-700',
    tech: 'bg-blue-100 text-blue-700',
    lifestyle: 'bg-amber-100 text-amber-700',
    createurs: 'bg-purple-100 text-purple-700',
  };
  return colors[category || ''] || 'bg-neutral-100 text-neutral-700';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);
  if (!blog) {
    return { title: 'Actualité non trouvée' };
  }

  const news = await getNewsBySlug(blog.id, slug);
  if (!news) {
    return { title: 'Actualité non trouvée' };
  }

  return {
    title: `${news.title} | ${blog.name}`,
    description: news.summary,
    openGraph: {
      title: news.title,
      description: news.summary,
      type: 'article',
      publishedTime: news.publishedAt,
      images: news.featuredImage ? [news.featuredImage] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);
  if (!blog) {
    notFound();
  }

  const news = await getNewsBySlug(blog.id, slug);
  if (!news) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.summary,
    image: news.featuredImage,
    datePublished: news.publishedAt,
    dateModified: news.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: blog.name,
    },
    citation: {
      '@type': 'WebPage',
      name: news.sourceTitle,
      url: news.sourceUrl,
    },
  };

  return (
    <>
      <Header blog={blog} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* Hero with image */}
        {news.featuredImage && (
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
            <img
              src={news.featuredImage}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour aux actualités
          </Link>

          <article className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-6 md:p-8 lg:p-10">
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(news.category)}`}>
                  {getCategoryLabel(news.category)}
                </span>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <ClockIcon className="w-4 h-4" />
                  <time dateTime={news.publishedAt}>
                    {formatDate(news.publishedAt)}
                  </time>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 leading-tight">
                {news.title}
              </h1>

              {/* Summary */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-neutral-700 text-lg leading-relaxed">
                  {news.summary}
                </p>
              </div>

              {/* Extended content if available */}
              {news.content && (
                <div
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              )}

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {news.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Source citation */}
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <NewspaperIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500 mb-1">Source originale</p>
                    <p className="font-medium text-neutral-900 mb-2">{news.sourceTitle}</p>
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      Lire l'article original sur {news.sourceDomain}
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="mt-6 text-xs text-neutral-500 italic">
                Cet article est un résumé éditorial basé sur des informations publiques.
                Pour les informations complètes et officielles, consultez la source originale ci-dessus.
              </p>
            </div>
          </article>

          {/* CTA to go back */}
          <div className="mt-8 text-center">
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Voir toutes les actualités
            </Link>
          </div>
        </div>
      </main>

      <Footer blog={blog} />
    </>
  );
}
