import type { AffiliatePartner, Product } from '../types';

// ============================================
// PATTERNS D'URL PAR PARTENAIRE
// ============================================
export const PARTNER_URL_PATTERNS: Record<string, string> = {
  amazon: 'https://amazon.fr/dp/{product_id}?tag={affiliate_id}',
  fnac: 'https://fnac.com/a{product_id}?CtpId={affiliate_id}',
  cdiscount: 'https://cdiscount.com/f-{product_id}.html?awc={affiliate_id}',
  aliexpress: 'https://aliexpress.com/item/{product_id}.html?aff_id={affiliate_id}',
  boulanger: 'https://boulanger.com/ref/{product_id}?affiliate={affiliate_id}',
};

/**
 * Génère un lien affilié pour un partenaire donné
 */
export function generateAffiliateLink(
  partner: AffiliatePartner | string,
  productId: string,
  affiliateId: string
): string {
  const pattern = typeof partner === 'string'
    ? PARTNER_URL_PATTERNS[partner] || PARTNER_URL_PATTERNS.amazon
    : partner.productUrlPattern;

  return pattern
    .replace('{product_id}', productId)
    .replace('{affiliate_id}', affiliateId);
}

/**
 * Génère un lien Amazon court
 */
export function generateAmazonLink(asin: string, affiliateId: string): string {
  return `https://amazon.fr/dp/${asin}?tag=${affiliateId}`;
}

/**
 * Extrait l'ASIN d'une URL Amazon
 */
export function extractAsinFromUrl(url: string): string | null {
  // Patterns Amazon :
  // https://amazon.fr/dp/B084TSLMC6
  // https://amazon.fr/gp/product/B084TSLMC6
  // https://amazon.fr/XXX/dp/B084TSLMC6/ref=xxx
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Vérifie si une chaîne est un ASIN valide
 */
export function isValidAsin(asin: string): boolean {
  return /^[A-Z0-9]{10}$/i.test(asin);
}

/**
 * Normalise un ASIN (majuscules)
 */
export function normalizeAsin(asin: string): string {
  return asin.trim().toUpperCase();
}

/**
 * Génère les attributs rel pour un lien affilié
 */
export function getAffiliateLinkRel(): string {
  return 'nofollow sponsored noopener';
}

/**
 * Génère les props pour un lien affilié React
 */
export function getAffiliateLinkProps(url: string) {
  return {
    href: url,
    target: '_blank',
    rel: getAffiliateLinkRel(),
  };
}

/**
 * Formate le prix d'un produit
 */
export function formatPrice(price: number | undefined, currency: string = 'EUR'): string {
  if (price === undefined || price === null) {
    return 'Prix non disponible';
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Génère un ProductCard data depuis un Product
 */
export function productToCardData(product: Product, affiliateId: string) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    priceFormatted: formatPrice(product.price, product.currency),
    image: product.images[0] || '/placeholder-product.jpg',
    rating: product.rating || 0,
    reviewCount: product.reviewCount,
    affiliateUrl: generateAffiliateLink(product.partnerId, product.productId, affiliateId),
    partnerId: product.partnerId,
  };
}

/**
 * Calcule la note en étoiles (0-5 arrondi à 0.5)
 */
export function roundRating(rating: number): number {
  return Math.round(rating * 2) / 2;
}

/**
 * Génère les étoiles pour l'affichage
 */
export function getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
  const rounded = roundRating(rating);
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);

  return { full, half, empty };
}
