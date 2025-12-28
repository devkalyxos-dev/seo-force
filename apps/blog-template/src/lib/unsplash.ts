/**
 * Unsplash Background Images Utility
 *
 * Provides curated abstract/design background images from Unsplash
 * to add visual uniqueness between different blog sites.
 */

// Curated list of abstract/design Unsplash images (free to use)
// These are high-quality, abstract/geometric/gradient images
const ABSTRACT_BACKGROUNDS = [
  // Gradients & Abstract
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80', // Purple gradient
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80', // Colorful gradient
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80', // Pink purple gradient
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80', // Blue gradient
  'https://images.unsplash.com/photo-1557682260-96773eb01377?w=1920&q=80', // Orange gradient
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1920&q=80', // Abstract waves
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80', // Gradient mesh
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1920&q=80', // Neon abstract

  // Geometric & Patterns
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80', // Geometric shapes
  'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1920&q=80', // Red geometric
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80', // Blue geometric
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=1920&q=80', // Abstract lines

  // Textures & Minimalist
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', // Mountain minimal
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', // Mountains blue
  'https://images.unsplash.com/photo-1494475673543-6a6a27143fc8?w=1920&q=80', // Abstract light
  'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=1920&q=80', // Soft gradient
];

// Tech-specific backgrounds for tech blogs
const TECH_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80', // Circuit board
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80', // Matrix code
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80', // Tech abstract
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80', // Digital globe
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=80', // Code screen
  'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1920&q=80', // Cyber abstract
];

// Dark/moody backgrounds for newsletter sections
const DARK_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80', // Dark gradient
  'https://images.unsplash.com/photo-1557264337-e8a93017fe92?w=1920&q=80', // Dark abstract
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&q=80', // Dark mountains
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920&q=80', // Night sky
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80', // Space nebula
];

/**
 * Simple hash function for deterministic selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get a background image based on blog slug (deterministic)
 */
export function getHeroBackground(blogSlug: string, niche?: string): string {
  const backgrounds = niche === 'tech' ? TECH_BACKGROUNDS : ABSTRACT_BACKGROUNDS;
  const index = hashString(blogSlug) % backgrounds.length;
  return backgrounds[index];
}

/**
 * Get a secondary background image (different from hero)
 */
export function getSecondaryBackground(blogSlug: string): string {
  const index = hashString(blogSlug + '-secondary') % ABSTRACT_BACKGROUNDS.length;
  return ABSTRACT_BACKGROUNDS[index];
}

/**
 * Get a dark background for newsletter/CTA sections
 */
export function getDarkBackground(blogSlug: string): string {
  const index = hashString(blogSlug + '-dark') % DARK_BACKGROUNDS.length;
  return DARK_BACKGROUNDS[index];
}

/**
 * Get multiple unique backgrounds for a blog
 */
export function getBlogBackgrounds(blogSlug: string, niche?: string) {
  return {
    hero: getHeroBackground(blogSlug, niche),
    secondary: getSecondaryBackground(blogSlug),
    dark: getDarkBackground(blogSlug),
  };
}

/**
 * CSS helper for background with overlay
 */
export function getBackgroundStyle(imageUrl: string, overlayOpacity: number = 0.85) {
  return {
    backgroundImage: `linear-gradient(rgba(255,255,255,${overlayOpacity}), rgba(255,255,255,${overlayOpacity})), url('${imageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}

/**
 * CSS helper for dark background with overlay
 */
export function getDarkBackgroundStyle(imageUrl: string, overlayOpacity: number = 0.7) {
  return {
    backgroundImage: `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), url('${imageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}
