import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@seo-force/shared';
import { ClockIcon } from './Icons';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    reviews: 'Review',
    guides: 'Guide',
    comparatifs: 'Comparatif',
    tops: 'TOP',
  };
  return labels[category] || category;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const href = `/${article.category}/${article.slug}`;

  if (featured) {
    return (
      <article className="group">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-semibold uppercase tracking-wider border border-primary-100">
                Article Vedette
              </span>
              <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {article.reading_time} min
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
              {article.title}
            </h1>
            <p className="text-lg text-neutral-500 mb-8 leading-relaxed max-w-lg">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                  <span className="text-xs font-bold text-neutral-600">AI</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-neutral-900">Expert</p>
                  <p className="text-neutral-500 text-xs">Rédaction</p>
                </div>
              </div>
              <div className="h-8 w-px bg-neutral-200 mx-2" />
              <Link
                href={href}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group/link"
              >
                Lire l'article
                <svg
                  className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 relative group cursor-pointer">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <Link href={href} className="block aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-primary-900/10 border border-primary-100/50 relative">
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-50 to-white relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-primary-200/50 rounded-full animate-pulse" />
                  </div>
                  <div className="absolute bottom-4 right-4 text-primary-300">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden card-lift hover:border-primary-200 transition-all duration-300">
      <Link
        href={href}
        className="relative aspect-[16/10] overflow-hidden bg-primary-50"
      >
        {article.featured_image ? (
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-50 to-white relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-primary-600 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase shadow-sm">
          {getCategoryLabel(article.category)}
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
          <span>{formatDate(article.published_at)}</span>
          <span className="w-1 h-1 rounded-full bg-primary-300" />
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {article.reading_time} min
          </span>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 leading-snug group-hover:text-primary-600 transition-colors">
          <Link href={href}>{article.title}</Link>
        </h3>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-6">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-600">AI</span>
            </div>
            <span className="text-xs font-medium text-neutral-700">Expert</span>
          </div>
          <span className="text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Lire →
          </span>
        </div>
      </div>
    </article>
  );
}
