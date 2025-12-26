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
            <div className="absolute inset-0 bg-primary-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
            <Link href={href} className="block aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-neutral-100 relative">
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
                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-neutral-200/50 hover:border-neutral-300 transition-all duration-300">
      <Link
        href={href}
        className="relative aspect-[16/10] overflow-hidden bg-neutral-100"
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
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-semibold tracking-wide uppercase text-neutral-900">
          {getCategoryLabel(article.category)}
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
          <span>{formatDate(article.published_at)}</span>
          <span className="w-1 h-1 rounded-full bg-neutral-300" />
          <span>{article.reading_time} min</span>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 leading-snug group-hover:text-primary-600 transition-colors">
          <Link href={href}>{article.title}</Link>
        </h3>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-6">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center">
            <span className="text-[10px] font-bold text-neutral-500">AI</span>
          </div>
          <span className="text-xs font-medium text-neutral-700">Expert</span>
        </div>
      </div>
    </article>
  );
}
