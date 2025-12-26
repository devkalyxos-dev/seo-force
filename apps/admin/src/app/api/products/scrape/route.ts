import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { scrapeAmazonProduct, extractAsinFromUrl } from '@/lib/services/amazonScraperService';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { asins, blog_id } = body;

  if (!asins || !Array.isArray(asins) || asins.length === 0) {
    return NextResponse.json(
      { error: 'Au moins un ASIN est requis' },
      { status: 400 }
    );
  }

  if (!blog_id) {
    return NextResponse.json(
      { error: 'blog_id est requis' },
      { status: 400 }
    );
  }

  const results: {
    success: Array<{ asin: string; product: any }>;
    failed: Array<{ asin: string; error: string }>;
  } = {
    success: [],
    failed: [],
  };

  // Process each ASIN
  for (const input of asins) {
    // Extract ASIN from URL or use directly
    const asin = extractAsinFromUrl(input) || input.toUpperCase();

    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      results.failed.push({ asin: input, error: 'ASIN invalide' });
      continue;
    }

    try {
      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('*')
        .eq('blog_id', blog_id)
        .eq('product_id', asin)
        .single();

      if (existing) {
        results.success.push({ asin, product: existing });
        continue;
      }

      // Scrape product from Amazon
      const scrapedProduct = await scrapeAmazonProduct(asin);

      if (!scrapedProduct) {
        results.failed.push({ asin, error: 'Impossible de récupérer le produit' });
        continue;
      }

      // Save to database
      const { data: savedProduct, error: saveError } = await supabase
        .from('products')
        .insert({
          blog_id,
          partner_id: 'amazon',
          product_id: asin,
          title: scrapedProduct.title,
          price: scrapedProduct.price,
          currency: scrapedProduct.currency,
          images: scrapedProduct.images,
          features: scrapedProduct.features,
          description: scrapedProduct.description,
          rating: scrapedProduct.rating,
          review_count: scrapedProduct.reviewCount,
          scraped_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        results.failed.push({ asin, error: saveError.message });
      } else {
        results.success.push({ asin, product: savedProduct });
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      results.failed.push({
        asin,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  return NextResponse.json(results);
}
