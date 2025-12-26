-- ============================================
-- SEO-FORCE : Schéma Base de Données
-- Générateur de Blogs d'Affiliation
-- ============================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PARTENAIRES D'AFFILIATION
-- ============================================
CREATE TABLE affiliate_partners (
  id TEXT PRIMARY KEY,                           -- 'amazon', 'fnac', 'cdiscount'
  name TEXT NOT NULL,                            -- 'Amazon France'
  base_url TEXT NOT NULL,                        -- 'https://amazon.fr'
  product_url_pattern TEXT NOT NULL,             -- 'https://amazon.fr/dp/{product_id}?tag={affiliate_id}'
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Données initiales
INSERT INTO affiliate_partners (id, name, base_url, product_url_pattern, is_active) VALUES
  ('amazon', 'Amazon France', 'https://amazon.fr', 'https://amazon.fr/dp/{product_id}?tag={affiliate_id}', true);

-- ============================================
-- BLOGS
-- ============================================
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                            -- "Tech Gadgets Review"
  slug TEXT UNIQUE NOT NULL,                     -- "tech-gadgets"
  domain TEXT,                                   -- "tech-gadgets.com"
  niche TEXT NOT NULL,                           -- "tech"
  description TEXT,
  tagline TEXT,                                  -- "REVIEWS" ou "GUIDES"
  logo_url TEXT,
  icon TEXT DEFAULT 'zap',                       -- Lucide icon name
  primary_color TEXT DEFAULT '#3B82F6',
  owner_name TEXT,
  owner_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- IDS PARTENAIRES PAR BLOG
-- ============================================
CREATE TABLE blog_affiliate_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES affiliate_partners(id),
  affiliate_id TEXT NOT NULL,                    -- 'techgadgets-21' pour Amazon
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_id, partner_id)
);

-- ============================================
-- PRODUITS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES affiliate_partners(id) DEFAULT 'amazon',
  product_id TEXT NOT NULL,                      -- ASIN pour Amazon
  title TEXT NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  description TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  product_url TEXT,
  availability TEXT,
  scraped_at TIMESTAMPTZ,
  manual_override BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_id, partner_id, product_id)
);

-- ============================================
-- ARTICLES
-- ============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,                         -- HTML
  featured_image TEXT,
  category TEXT NOT NULL,                        -- 'reviews', 'guides', 'comparatifs', 'top'
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',                   -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  reading_time INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  product_ids UUID[] DEFAULT '{}',               -- Produits liés
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_id, slug)
);

-- ============================================
-- PAGES LÉGALES
-- ============================================
CREATE TABLE legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                            -- 'mentions', 'privacy', 'cgv', 'about'
  title TEXT NOT NULL,
  content TEXT NOT NULL,                         -- HTML avec variables {{blog_name}}, etc.
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_id, type)
);

-- ============================================
-- SETTINGS ADMIN
-- ============================================
CREATE TABLE admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  openai_api_key TEXT,
  settings JSONB DEFAULT '{
    "unsplash_api_key": null,
    "cloudinary_cloud_name": null,
    "cloudinary_api_key": null,
    "google_search_api_key": null,
    "google_search_cx": null
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la ligne par défaut
INSERT INTO admin_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- ============================================
-- SUBSCRIBERS (Newsletter)
-- ============================================
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_id, email)
);

-- ============================================
-- INDEX
-- ============================================
CREATE INDEX idx_articles_blog_id ON articles(blog_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_products_blog_id ON products(blog_id);
CREATE INDEX idx_products_partner_id ON products(partner_id);
CREATE INDEX idx_legal_pages_blog_id ON legal_pages(blog_id);
CREATE INDEX idx_subscribers_blog_id ON subscribers(blog_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique des articles publiés
CREATE POLICY "Articles publiés lisibles par tous" ON articles
  FOR SELECT USING (status = 'published');

-- Politique pour lecture publique des blogs actifs
CREATE POLICY "Blogs actifs lisibles par tous" ON blogs
  FOR SELECT USING (is_active = true);

-- Politique pour lecture publique des produits actifs
CREATE POLICY "Produits actifs lisibles par tous" ON products
  FOR SELECT USING (is_active = true);

-- Politique pour lecture publique des pages légales
CREATE POLICY "Pages légales lisibles par tous" ON legal_pages
  FOR SELECT USING (true);

-- ============================================
-- FONCTIONS
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TEMPLATES PAGES LÉGALES (à insérer par défaut)
-- ============================================

-- Template Mentions Légales
CREATE OR REPLACE FUNCTION create_default_legal_pages()
RETURNS TRIGGER AS $$
BEGIN
  -- Mentions légales
  INSERT INTO legal_pages (blog_id, type, title, content) VALUES
  (NEW.id, 'mentions', 'Mentions Légales', '
<h1>Mentions Légales - {{blog_name}}</h1>

<h2>Éditeur du site</h2>
<p>Le site {{blog_domain}} est édité par {{owner_name}}.</p>
<p>Contact : {{owner_email}}</p>

<h2>Hébergement</h2>
<p>Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.</p>

<h2>Propriété intellectuelle</h2>
<p>L''ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d''auteur. Toute reproduction est interdite sans autorisation préalable.</p>

<h2>Programme d''affiliation</h2>
<p>{{blog_name}} participe au Programme Partenaires d''Amazon EU, un programme d''affiliation conçu pour permettre à des sites de percevoir une rémunération grâce à la création de liens vers Amazon.fr.</p>

<h2>Liens affiliés</h2>
<p>Ce site contient des liens affiliés. Lorsque vous effectuez un achat via ces liens, nous pouvons percevoir une commission sans frais supplémentaires pour vous.</p>
'),

  -- Politique de confidentialité
  (NEW.id, 'privacy', 'Politique de Confidentialité', '
<h1>Politique de Confidentialité - {{blog_name}}</h1>

<h2>Collecte des données</h2>
<p>{{blog_name}} collecte uniquement les données nécessaires au bon fonctionnement du site :</p>
<ul>
  <li>Adresse email (inscription newsletter)</li>
  <li>Données de navigation (cookies analytiques)</li>
</ul>

<h2>Utilisation des données</h2>
<p>Vos données sont utilisées pour :</p>
<ul>
  <li>Vous envoyer notre newsletter (si vous êtes inscrit)</li>
  <li>Améliorer l''expérience utilisateur</li>
  <li>Analyser le trafic du site</li>
</ul>

<h2>Cookies</h2>
<p>Ce site utilise des cookies pour :</p>
<ul>
  <li>Mesurer l''audience (Google Analytics)</li>
  <li>Personnaliser votre expérience</li>
  <li>Suivre les conversions affiliées</li>
</ul>

<h2>Vos droits</h2>
<p>Conformément au RGPD, vous disposez d''un droit d''accès, de rectification et de suppression de vos données. Contactez-nous à {{owner_email}}.</p>

<h2>Contact</h2>
<p>Pour toute question concernant vos données : {{owner_email}}</p>
'),

  -- À propos
  (NEW.id, 'about', 'À Propos', '
<h1>À Propos de {{blog_name}}</h1>

<p>Bienvenue sur {{blog_name}} !</p>

<p>Notre mission est de vous aider à faire les meilleurs choix d''achat grâce à nos tests approfondis, guides d''achat et comparatifs.</p>

<h2>Notre approche</h2>
<p>Chaque article est rédigé avec soin pour vous fournir des informations fiables et objectives. Nous testons les produits, analysons les avis clients et comparons les offres pour vous faire gagner du temps.</p>

<h2>Transparence</h2>
<p>Ce site contient des liens affiliés. Lorsque vous achetez via nos liens, nous percevons une commission qui nous permet de continuer à vous proposer du contenu de qualité, sans frais supplémentaires pour vous.</p>

<h2>Contact</h2>
<p>Une question ? Contactez-nous à {{owner_email}}</p>
');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer les pages légales par défaut
CREATE TRIGGER create_legal_pages_on_blog_create
  AFTER INSERT ON blogs
  FOR EACH ROW EXECUTE FUNCTION create_default_legal_pages();
