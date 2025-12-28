/**
 * Build Amazon affiliate URL with tracking tag
 */
export function buildAmazonAffiliateUrl(asin: string, affiliateId: string): string {
  return `https://www.amazon.fr/dp/${asin}?tag=${affiliateId}`;
}

/**
 * Build affiliate URL for any partner
 */
export function buildAffiliateUrl(
  productId: string,
  affiliateId: string,
  partner: 'amazon' | 'fnac' | 'cdiscount' = 'amazon'
): string {
  const patterns: Record<string, string> = {
    amazon: `https://www.amazon.fr/dp/${productId}?tag=${affiliateId}`,
    fnac: `https://www.fnac.com/a${productId}?CtpId=${affiliateId}`,
    cdiscount: `https://www.cdiscount.com/product/${productId}?awc=${affiliateId}`,
  };

  return patterns[partner] || patterns.amazon;
}
