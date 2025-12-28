import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@seo-force/shared';
import { ClockIcon, ArrowRightIcon } from './Icons';
import { extractTextPreview, formatDate, getCategoryLabel, getCategoryColor } from '@/lib/utils';

interface LongScrollArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function LongScrollArticleCard({ article, priority = false }: LongScrollArticleCardProps) {
  const href = `/${article.category}/${article.slug}`;

  // Extraire un aperçu étendu du contenu HTML
  const preview = article.content
    ? extractTextPreview(article.content, 600)
    : article.excerpt || '';

  return (
    <article className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row">
        {/* Image - 40% sur desktop */}
        <Link
          href={href}
          className="relative lg:w-2/5 aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden bg-primary-50 flex-shrink-0"
        >
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-50 to-white relative flex items-center justify-center">
              <div className="text-primary-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          )}
          {/* Badge catégorie sur l'image */}
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm border ${getCategoryColor(article.category)}`}>
            {getCategoryLabel(article.category)}
          </div>
        </Link>

        {/* Contenu - 60% sur desktop */}
        <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col">
          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
            <time dateTime={article.published_at || undefined}>
              {formatDate(article.published_at)}
            </time>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {article.reading_time} min de lecture
            </span>
          </div>

          {/* Titre */}
          <h2 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-4 leading-snug group-hover:text-primary-600 transition-colors">
            <Link href={href}>{article.title}</Link>
          </h2>

          {/* Aperçu étendu */}
          <p className="text-neutral-600 leading-relaxed mb-6 flex-grow">
            {preview}
          </p>

          {/* Footer avec auteur et CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600">AI</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Expert</p>
                <p className="text-xs text-neutral-500">Rédaction</p>
              </div>
            </div>

            <Link
              href={href}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors group/btn"
            >
              Lire la suite
              <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
