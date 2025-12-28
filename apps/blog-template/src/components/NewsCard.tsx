import Link from 'next/link';
import type { News } from '@seo-force/shared';
import { ExternalLinkIcon, NewspaperIcon, ClockIcon } from './Icons';
import { formatDate } from '@/lib/utils';

interface NewsCardProps {
  news: News;
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

export function NewsCard({ news }: NewsCardProps) {
  return (
    <article className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-300">
      {/* Image */}
      {news.featuredImage && (
        <Link href={`/actualites/${news.slug}`} className="block">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={news.featuredImage}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      )}

      <div className="p-6">
        {/* Header with category and source */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(news.category)}`}>
            {getCategoryLabel(news.category)}
          </span>
          <a
            href={news.sourceUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600 transition-colors"
          >
            <span className="font-medium">{news.sourceDomain}</span>
            <ExternalLinkIcon className="w-3 h-3" />
          </a>
        </div>

        {/* Title - Clickable */}
        <Link href={`/actualites/${news.slug}`}>
          <h3 className="text-lg font-semibold text-neutral-900 mb-3 leading-snug group-hover:text-primary-600 transition-colors cursor-pointer">
            {news.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-neutral-600 text-sm leading-relaxed mb-4">
          {news.summary}
        </p>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {news.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ClockIcon className="w-3.5 h-3.5" />
            <time dateTime={news.publishedAt}>
              {formatDate(news.publishedAt)}
            </time>
          </div>

          <Link
            href={`/actualites/${news.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Lire la suite
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Variante compacte pour les sidebars
export function NewsCardCompact({ news }: NewsCardProps) {
  return (
    <article className="group py-3 border-b border-neutral-100 last:border-0">
      <a
        href={news.sourceUrl}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="block"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <NewspaperIcon className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {news.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
              <span>{news.sourceDomain}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <span>{formatDate(news.publishedAt)}</span>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}
