// ============================================
// TYPES PARTAGÉS - SEO-FORCE
// ============================================

// ============================================
// PARTENAIRES D'AFFILIATION
// ============================================
export interface AffiliatePartner {
  id: string;
  name: string;
  baseUrl: string;
  productUrlPattern: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// BLOGS
// ============================================
export interface Blog {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  niche: string;
  description?: string;
  tagline?: string;
  logoUrl?: string;
  icon: string;
  primaryColor: string;
  ownerName?: string;
  ownerEmail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogConfig {
  name: string;
  slug: string;
  domain: string;
  tagline: string;
  icon: string;
  primaryColor: string;
  ownerName: string;
  ownerEmail: string;
  affiliateIds: Record<string, string>; // { amazon: 'techgadgets-21', fnac: 'xxx' }
}

export interface CreateBlogInput {
  name: string;
  slug: string;
  niche: string;
  domain?: string;
  description?: string;
  tagline?: string;
  icon?: string;
  primaryColor?: string;
  ownerName?: string;
  ownerEmail?: string;
  amazonAffiliateId?: string;
}

// ============================================
// IDS PARTENAIRES
// ============================================
export interface BlogAffiliateId {
  id: string;
  blogId: string;
  partnerId: string;
  affiliateId: string;
  isPrimary: boolean;
  createdAt: string;
}

// ============================================
// PRODUITS
// ============================================
export interface Product {
  id: string;
  blogId: string;
  partnerId: string;
  productId: string; // ASIN pour Amazon
  title: string;
  price?: number;
  currency: string;
  images: string[];
  features: string[];
  description?: string;
  rating?: number;
  reviewCount: number;
  productUrl?: string;
  availability?: string;
  scrapedAt?: string;
  manualOverride: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  blogId: string;
  partnerId?: string;
  productId: string;
  title: string;
  price?: number;
  images?: string[];
  features?: string[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  productUrl?: string;
}

export interface ScrapedProduct {
  asin: string;
  title: string;
  price?: string;
  currency: string;
  images: string[];
  features: string[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
}

// ============================================
// ARTICLES
// ============================================
export type ArticleStatus = 'draft' | 'published' | 'archived';
export type ArticleCategory = 'reviews' | 'guides' | 'comparatifs' | 'top';

export interface Article {
  id: string;
  blogId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  readingTime: number;
  viewCount: number;
  productIds: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleInput {
  blogId: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: ArticleCategory;
  tags?: string[];
  status?: ArticleStatus;
  seoTitle?: string;
  seoDescription?: string;
  productIds?: string[];
}

// ============================================
// GÉNÉRATION IA
// ============================================
export type ArticleType = 'review' | 'guide' | 'comparatif' | 'top';
export type ArticleTone = 'informatif' | 'engageant' | 'expert';

export interface ArticleGenerationParams {
  blogId: string;
  articleType: ArticleType;
  topic: string;
  products?: string[]; // ASINs ou IDs produits
  tone?: ArticleTone;
  topCount?: number; // Pour les TOP X
  context?: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  suggestedSlug: string;
  seoTitle: string;
  seoDescription: string;
  readingTime: number;
}

// ============================================
// PAGES LÉGALES
// ============================================
export type LegalPageType = 'mentions' | 'privacy' | 'cgv' | 'about';

export interface LegalPage {
  id: string;
  blogId: string;
  type: LegalPageType;
  title: string;
  content: string;
  updatedAt: string;
}

// ============================================
// SUBSCRIBERS
// ============================================
export interface Subscriber {
  id: string;
  blogId: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

// ============================================
// ADMIN SETTINGS
// ============================================
export interface AdminSettings {
  id: string;
  openaiApiKey?: string;
  settings: {
    unsplashApiKey?: string;
    cloudinaryCloudName?: string;
    cloudinaryApiKey?: string;
    googleSearchApiKey?: string;
    googleSearchCx?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API RESPONSES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// NEWS (Actualités IA)
// ============================================
export type NewsCategory = 'economie' | 'juridique' | 'tendances' | 'tech' | 'lifestyle' | 'createurs';

export interface News {
  id: string;
  blogId: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain?: string;
  sourcePublishedAt?: string;
  category?: NewsCategory;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsInput {
  blogId: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain?: string;
  sourcePublishedAt?: string;
  category?: NewsCategory;
  tags?: string[];
}

export interface ScrapedNewsItem {
  title: string;
  url: string;
  source: string;
  snippet: string;
  publishedAt?: string;
}

export interface GeneratedNewsSummary {
  title: string;
  slug: string;
  summary: string;
  category: NewsCategory;
  tags: string[];
  imageKeyword?: string;
}

export interface GenerateNewsParams {
  blogId: string;
  niche: string;
  maxItems?: number;
}
