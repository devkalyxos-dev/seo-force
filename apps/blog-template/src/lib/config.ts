import type { BlogConfig } from '@seo-force/shared';

// Owner information from KBIS - Used for legal pages
export const OWNER_INFO = {
  // Identité
  fullName: 'SEYMOUR Lionel Jillian',
  tradeName: 'LS Distribution',

  // RCS / SIRET
  rcs: '942 960 105 R.C.S. Pointe à Pitre',
  siret: '942 960 105 00018', // RCS + établissement

  // Adresse
  address: {
    street: '2220 Route De Bories',
    city: 'Le Moule',
    postalCode: '97160',
    country: 'France (Guadeloupe)',
    full: 'Le Moule, Guadeloupe',
  },

  // Contact
  email: 'contact@ls-distribution.fr', // À configurer

  // Activité
  activity: 'Commerce de détail sur internet de tous types de produits physiques et numériques non réglementés. Prestations de services marketing, apport d\'affaires et mise en relation commerciale. Gestion de portails web et vente d\'espaces publicitaires.',
  activityStartDate: '07/04/2025',

  // Hébergeur
  hosting: {
    name: 'Vercel Inc.',
    address: '340 S Lemon Ave #4133, Walnut, CA 91789, USA',
  },
} as const;

// Affiliate disclosure - Required by Amazon and other partners
export const AFFILIATE_DISCLOSURE = {
  amazon: {
    program: 'Programme Partenaires d\'Amazon EU',
    disclosure: 'En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises. Les liens vers Amazon.fr contiennent un identifiant d\'affiliation.',
    privacyUrl: 'https://www.amazon.fr/gp/help/customer/display.html?nodeId=201909010',
  },
  general: 'Certains liens présents sur ce site sont des liens affiliés. Cela signifie que si vous cliquez sur ces liens et effectuez un achat, nous pouvons recevoir une commission sans frais supplémentaires pour vous. Nous ne recommandons que des produits que nous avons testés ou en lesquels nous avons confiance.',
} as const;

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
