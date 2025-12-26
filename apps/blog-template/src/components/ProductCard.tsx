import Image from 'next/image';
import type { Product } from '@seo-force/shared';
import { generateAffiliateLink, formatPrice } from '@seo-force/shared';
import { StarIcon, ExternalLinkIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  affiliateId: string;
  partnerId?: string;
  variant?: 'default' | 'compact' | 'horizontal';
  rank?: number;
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <StarIcon key={`full-${i}`} className="w-3 h-3 text-yellow-400 fill-yellow-400" filled />
      ))}
      {hasHalfStar && (
        <StarIcon className="w-3 h-3 text-yellow-400" />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <StarIcon key={`empty-${i}`} className="w-3 h-3 text-neutral-300" />
      ))}
    </div>
  );
}

export function ProductCard({
  product,
  affiliateId,
  partnerId = 'amazon',
  variant = 'default',
  rank,
}: ProductCardProps) {
  const affiliateUrl = generateAffiliateLink(
    { productUrlPattern: 'https://amazon.fr/dp/{product_id}?tag={affiliate_id}' },
    product.product_id,
    affiliateId
  );

  const priceDisplay = product.price
    ? formatPrice(product.price, product.currency || 'EUR')
    : null;

  const mainImage = product.images?.[0] || null;

  if (variant === 'compact') {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="group block"
      >
        <div className="aspect-square rounded-lg overflow-hidden mb-3 relative bg-neutral-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
          )}
          {priceDisplay && (
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-[10px] px-2 py-1 rounded">
              {priceDisplay}
            </div>
          )}
        </div>
        <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {product.title}
        </h3>
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-neutral-500">
              ({product.review_count || 0} avis)
            </span>
          </div>
        )}
        <div className="mt-2 text-xs font-medium text-orange-600">
          Voir sur Amazon →
        </div>
      </a>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
        {rank && (
          <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {rank}
          </div>
        )}
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.title}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 line-clamp-2">
            {product.title}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={product.rating} />
              <span className="text-xs text-neutral-500">
                {product.rating.toFixed(1)} ({product.review_count || 0})
              </span>
            </div>
          )}
          {priceDisplay && (
            <p className="text-lg font-bold text-neutral-900 mt-2">
              {priceDisplay}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#E88B00] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Voir sur Amazon
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative bg-neutral-100">
        {rank && (
          <div className="absolute top-3 left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
            #{rank}
          </div>
        )}
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-neutral-900 line-clamp-2 mb-2">
          {product.title}
        </h3>
        {product.rating && (
          <div className="flex items-center gap-2 mb-3">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-neutral-500">
              {product.rating.toFixed(1)} ({product.review_count || 0} avis)
            </span>
          </div>
        )}
        {product.features && product.features.length > 0 && (
          <ul className="text-xs text-neutral-600 space-y-1 mb-4">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          {priceDisplay && (
            <span className="text-xl font-bold text-neutral-900">
              {priceDisplay}
            </span>
          )}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#E88B00] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Amazon
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
