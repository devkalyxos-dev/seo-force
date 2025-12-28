import Image from 'next/image';
import { Rating } from './Rating';

interface ProductSpec {
  label: string;
  value: string;
}

interface ProductInfoCardProps {
  name: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
  affiliateUrl?: string;
  specs?: ProductSpec[];
  badge?: string;
}

export function ProductInfoCard({
  name,
  image,
  price,
  originalPrice,
  rating,
  affiliateUrl,
  specs = [],
  badge,
}: ProductInfoCardProps) {
  const hasDiscount = originalPrice && price && parseFloat(originalPrice.replace(/[^0-9.,]/g, '')) > parseFloat(price.replace(/[^0-9.,]/g, ''));

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      {image && (
        <div className="relative aspect-square bg-neutral-50 p-4">
          {badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full z-10">
              {badge}
            </span>
          )}
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      )}

      <div className="p-5">
        {/* Name & Rating */}
        <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{name}</h3>
        {rating && (
          <div className="mb-3">
            <Rating score={rating} size="sm" />
          </div>
        )}

        {/* Price */}
        {price && (
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-neutral-900">{price}</span>
            {hasDiscount && originalPrice && (
              <span className="text-sm text-neutral-400 line-through">{originalPrice}</span>
            )}
          </div>
        )}

        {/* Specs */}
        {specs.length > 0 && (
          <div className="border-t border-neutral-100 pt-4 mb-4">
            <ul className="space-y-2">
              {specs.slice(0, 5).map((spec, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span className="text-neutral-500">{spec.label}</span>
                  <span className="text-neutral-900 font-medium">{spec.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        {affiliateUrl && (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="block w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white text-center font-semibold rounded-xl transition-colors"
          >
            Voir sur Amazon
          </a>
        )}
      </div>
    </div>
  );
}

interface CompactProductCardProps {
  name: string;
  image?: string;
  price?: string;
  rating?: number;
  affiliateUrl?: string;
}

export function CompactProductCard({ name, image, price, rating, affiliateUrl }: CompactProductCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
      {image && (
        <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-2"
            sizes="80px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 text-sm line-clamp-2 mb-1">{name}</h4>
        {rating && <Rating score={rating} size="sm" showLabel={false} />}
        {price && <p className="text-lg font-bold text-neutral-900 mt-1">{price}</p>}
      </div>
      {affiliateUrl && (
        <a
          href={affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Voir
        </a>
      )}
    </div>
  );
}
