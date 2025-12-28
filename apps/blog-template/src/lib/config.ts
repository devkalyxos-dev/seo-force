import type { BlogConfig } from '@seo-force/shared';

// Get blog configuration from environment variables
export function getBlogConfig(): BlogConfig {
  const slug = process.env.NEXT_PUBLIC_BLOG_SLUG;

  if (!slug) {
    throw new Error('NEXT_PUBLIC_BLOG_SLUG is not defined');
  }

  return {
    slug,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

// Categories available for the blog
export const CATEGORIES = [
  { slug: 'reviews', label: 'Reviews', description: 'Tests et avis détaillés' },
  { slug: 'guides', label: 'Guides', description: 'Guides d\'achat complets' },
  { slug: 'comparatifs', label: 'Comparatifs', description: 'Comparaisons de produits' },
  { slug: 'tops', label: 'TOP', description: 'Classements des meilleurs produits' },
] as const;

export type Category = typeof CATEGORIES[number]['slug'];

// Navigation links
export const NAV_LINKS = [
  { href: '/reviews', label: 'Reviews' },
  { href: '/guides', label: 'Guides' },
  { href: '/comparatifs', label: 'Comparatifs' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/produits', label: 'Produits' },
] as const;

// Footer links
export const FOOTER_LINKS = {
  content: [
    { href: '/', label: 'Derniers articles' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/guides', label: 'Guides' },
    { href: '/comparatifs', label: 'Comparatifs' },
    { href: '/actualites', label: 'Actualités' },
    { href: '/produits', label: 'Produits' },
  ],
  legal: [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/politique-confidentialite', label: 'Confidentialité' },
    { href: '/a-propos', label: 'À propos' },
  ],
} as const;

// Social links (to be configured per blog)
export const SOCIAL_LINKS = {
  twitter: '',
  instagram: '',
  youtube: '',
} as const;
