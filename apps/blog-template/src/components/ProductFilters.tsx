'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@seo-force/shared';
import { ProductCard } from './ProductCard';

interface ProductFiltersProps {
  products: Product[];
  affiliateId: string;
}

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'rating';
type PriceRange = 'all' | 'budget' | 'mid' | 'premium';

export function ProductFilters({ products, affiliateId }: ProductFiltersProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.features?.some((f) => f.toLowerCase().includes(query))
      );
    }

    // Filter by price range
    if (priceRange !== 'all') {
      result = result.filter((p) => {
        if (!p.price) return false;
        switch (priceRange) {
          case 'budget':
            return p.price < 100;
          case 'mid':
            return p.price >= 100 && p.price < 200;
          case 'premium':
            return p.price >= 200;
          default:
            return true;
        }
      });
    }

    // Filter by minimum rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating && p.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'recent':
      default:
        // Keep default order (most recent first)
        break;
    }

    return result;
  }, [products, sortBy, priceRange, minRating, searchQuery]);

  const priceStats = useMemo(() => {
    return {
      budget: products.filter((p) => p.price && p.price < 100).length,
      mid: products.filter((p) => p.price && p.price >= 100 && p.price < 200).length,
      premium: products.filter((p) => p.price && p.price >= 200).length,
    };
  }, [products]);

  const resetFilters = () => {
    setSortBy('recent');
    setPriceRange('all');
    setMinRating(0);
    setSearchQuery('');
  };

  const hasActiveFilters = sortBy !== 'recent' || priceRange !== 'all' || minRating > 0 || searchQuery.trim();

  return (
    <div>
      {/* Filters Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Rechercher
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom du produit..."
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>

          {/* Price Range */}
          <div className="w-full lg:w-48">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Gamme de prix
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as PriceRange)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 bg-white"
            >
              <option value="all">Tous les prix</option>
              <option value="budget">Moins de 100€ ({priceStats.budget})</option>
              <option value="mid">100€ - 200€ ({priceStats.mid})</option>
              <option value="premium">Plus de 200€ ({priceStats.premium})</option>
            </select>
          </div>

          {/* Min Rating */}
          <div className="w-full lg:w-40">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Note minimum
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 bg-white"
            >
              <option value={0}>Toutes les notes</option>
              <option value={4.5}>4.5+ stars</option>
              <option value={4}>4+ stars</option>
              <option value={3.5}>3.5+ stars</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full lg:w-48">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 bg-white"
            >
              <option value="recent">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Meilleures notes</option>
            </select>
          </div>
        </div>

        {/* Active Filters & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-500">Filtres actifs:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-primary-900">×</button>
                </span>
              )}
              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                  {priceRange === 'budget' && '< 100€'}
                  {priceRange === 'mid' && '100-200€'}
                  {priceRange === 'premium' && '> 200€'}
                  <button onClick={() => setPriceRange('all')} className="hover:text-primary-900">×</button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                  {minRating}+ stars
                  <button onClick={() => setMinRating(0)} className="hover:text-primary-900">×</button>
                </span>
              )}
              {sortBy !== 'recent' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                  {sortBy === 'price-asc' && 'Prix ↑'}
                  {sortBy === 'price-desc' && 'Prix ↓'}
                  {sortBy === 'rating' && 'Notes ↓'}
                </span>
              )}
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-neutral-500 hover:text-neutral-700 underline"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-500">
          {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? 's' : ''} trouvé{filteredAndSortedProducts.length > 1 ? 's' : ''}
          {hasActiveFilters && ` sur ${products.length}`}
        </p>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              affiliateId={affiliateId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-neutral-50 rounded-xl">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-neutral-500 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <button
            onClick={resetFilters}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
