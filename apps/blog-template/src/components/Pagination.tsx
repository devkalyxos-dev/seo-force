import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export function Pagination({ currentPage, totalPages, baseUrl = '/' }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Génère l'URL pour une page donnée
  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl;
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`;
  };

  // Génère les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2; // Nombre de pages autour de la page courante

    // Toujours afficher la première page
    pages.push(1);

    // Calculer la plage autour de la page courante
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Ajouter ellipsis avant la plage si nécessaire
    if (rangeStart > 2) {
      pages.push('ellipsis');
    }

    // Ajouter les pages dans la plage
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Ajouter ellipsis après la plage si nécessaire
    if (rangeEnd < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Toujours afficher la dernière page si > 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Pagination"
    >
      {/* Bouton Précédent */}
      {hasPrevious ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-lg cursor-not-allowed">
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </span>
      )}

      {/* Numéros de page */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-neutral-500"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;

          return (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 hover:border-primary-300'
              }`}
              aria-current={isCurrentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Bouton Suivant */}
      {hasNext ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition-colors"
          aria-label="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-lg cursor-not-allowed">
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRightIcon className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
