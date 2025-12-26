import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  asin: string;
  title: string;
  price: number | null;
  currency: string;
  images: string[];
  rating: number | null;
  reviewCount: number | null;
  features: string[];
  description: string;
  availability: string;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function scrapeAmazonProduct(asin: string): Promise<ScrapedProduct | null> {
  const url = `https://www.amazon.fr/dp/${asin}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch Amazon page: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('#productTitle').text().trim() ||
      $('#title').text().trim() ||
      $('h1.a-size-large').text().trim();

    if (!title) {
      console.error('Could not find product title');
      return null;
    }

    // Extract price
    let price: number | null = null;
    const priceWhole = $('.a-price-whole').first().text().replace(/[^\d]/g, '');
    const priceFraction = $('.a-price-fraction').first().text().replace(/[^\d]/g, '');
    if (priceWhole) {
      price = parseFloat(`${priceWhole}.${priceFraction || '00'}`);
    }

    // Extract images
    const images: string[] = [];
    $('#altImages img, #imageBlock img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-old-hires');
      if (src && src.includes('images') && !src.includes('sprite')) {
        // Get high-res version
        const highRes = src.replace(/\._.*_\./, '.');
        if (!images.includes(highRes)) {
          images.push(highRes);
        }
      }
    });

    // Also try to get the main image
    const mainImage = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
    if (mainImage && !images.includes(mainImage)) {
      images.unshift(mainImage);
    }

    // Extract rating
    let rating: number | null = null;
    const ratingText = $('#acrPopover').attr('title') || $('.a-icon-star span').first().text();
    const ratingMatch = ratingText?.match(/(\d+[.,]\d+)/);
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1].replace(',', '.'));
    }

    // Extract review count
    let reviewCount: number | null = null;
    const reviewText = $('#acrCustomerReviewText').text() || $('#reviewsMedley .a-size-base').first().text();
    const reviewMatch = reviewText?.match(/(\d+[\s\d]*)/);
    if (reviewMatch) {
      reviewCount = parseInt(reviewMatch[1].replace(/\s/g, ''), 10);
    }

    // Extract features (bullet points)
    const features: string[] = [];
    $('#feature-bullets li span.a-list-item').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !text.includes('Cliquez') && text.length > 5) {
        features.push(text);
      }
    });

    // Extract description
    let description = '';
    $('#productDescription p').each((_, el) => {
      description += $(el).text().trim() + '\n';
    });
    if (!description) {
      description = $('#aplus_feature_div').text().trim().slice(0, 500);
    }

    // Extract availability
    const availability = $('#availability span').first().text().trim() ||
      $('#outOfStock span').text().trim() ||
      'Disponibilité inconnue';

    return {
      asin,
      title,
      price,
      currency: 'EUR',
      images: images.slice(0, 5), // Limit to 5 images
      rating,
      reviewCount,
      features: features.slice(0, 10), // Limit to 10 features
      description: description.trim().slice(0, 1000),
      availability,
    };
  } catch (error) {
    console.error('Error scraping Amazon product:', error);
    return null;
  }
}

export function extractAsinFromUrl(url: string): string | null {
  // Match ASIN patterns in Amazon URLs
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /asin=([A-Z0-9]{10})/i,
    /^([A-Z0-9]{10})$/i, // Direct ASIN
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

export async function scrapeMultipleProducts(asins: string[]): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  // Process sequentially with delay to avoid rate limiting
  for (const asin of asins) {
    const product = await scrapeAmazonProduct(asin);
    if (product) {
      results.push(product);
    }
    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
  }

  return results;
}
