# SEO Force - Générateur de Blogs d'Affiliation

## Vue d'ensemble

Système de génération et gestion de blogs d'affiliation Amazon par niche.

**Stack technique :**
- **Framework** : Next.js 14 (App Router)
- **Base de données** : Supabase (PostgreSQL)
- **Style** : Tailwind CSS
- **IA** : OpenAI GPT-4o-mini
- **Monorepo** : Turborepo avec workspaces npm

## Structure du Projet

```
seo-force/
├── apps/
│   ├── admin/                    # Admin centralisé (port 3001)
│   │   ├── src/
│   │   │   ├── app/              # Pages Next.js
│   │   │   ├── components/       # Composants (Sidebar)
│   │   │   └── lib/
│   │   │       ├── supabase.ts   # Client Supabase
│   │   │       └── services/     # Services métier
│   │   │           ├── aiArticleService.ts    # Génération IA
│   │   │           └── amazonScraperService.ts # Scraping Amazon
│   │   └── package.json
│   │
│   └── blog-template/            # Template de blog (à cloner par niche)
│       ├── src/
│       │   ├── app/              # Pages du blog
│       │   ├── components/       # Header, Footer, ArticleCard, ProductCard
│       │   └── lib/
│       │       ├── config.ts     # Configuration du blog
│       │       └── supabase.ts   # Client Supabase
│       └── package.json
│
├── packages/
│   └── shared/                   # Code partagé
│       └── src/
│           ├── types/            # Types TypeScript
│           ├── supabase/         # Client Supabase partagé
│           └── affiliate/        # Utilitaires liens affiliés
│
├── supabase/
│   └── schema.sql                # Schéma de base de données
│
├── package.json                  # Workspace root
└── turbo.json                    # Configuration Turborepo
```

## Commandes

```bash
# Installer les dépendances
npm install

# Développement
npm run dev              # Lance tous les apps
npm run dev:admin        # Lance seulement l'admin (port 3001)
npm run dev:blog         # Lance seulement le blog-template (port 3000)

# Build
npm run build            # Build tous les apps
```

## Base de données Supabase

### Tables principales

| Table | Description |
|-------|-------------|
| `blogs` | Configuration des blogs (nom, slug, couleur, niche) |
| `articles` | Articles générés (titre, contenu, catégorie, statut) |
| `products` | Produits Amazon importés via ASIN |
| `affiliate_partners` | Partenaires d'affiliation (Amazon, Fnac, etc.) |
| `blog_affiliate_ids` | IDs affiliés par blog et partenaire |
| `legal_pages` | Pages légales (mentions, privacy, cgv) |
| `admin_settings` | Paramètres globaux (clés API) |
| `subscribers` | Newsletter subscribers |

### Créer la base

1. Créer un projet Supabase sur https://supabase.com
2. Copier le contenu de `supabase/schema.sql`
3. L'exécuter dans l'éditeur SQL de Supabase

## Configuration

### Admin (`apps/admin/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=sk-xxx
```

### Blog Template (`apps/blog-template/.env.local`)

```env
NEXT_PUBLIC_BLOG_SLUG=tech-gadgets
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Fonctionnalités

### Admin Centralisé

- **Dashboard** : Vue d'ensemble (stats, actions rapides)
- **Blogs** : Créer/gérer les blogs
- **Articles** : Liste, génération IA
- **Produits** : Import via ASIN Amazon
- **Paramètres** : Clés API

### Blog Template

- **Homepage** : Articles récents, produits populaires
- **Catégories** : reviews, guides, comparatifs, tops
- **Articles** : Pages détaillées avec produits affiliés
- **Pages légales** : Générées automatiquement
- **Newsletter** : Formulaire d'inscription
- **SEO** : Sitemap, robots.txt, meta tags

### Génération d'Articles IA

Types supportés :
- **Review** : Test détaillé d'un produit
- **Guide** : Guide d'achat complet
- **Comparatif** : Comparaison de produits
- **TOP** : Classement des meilleurs

### Import Produits Amazon

- Scraping via ASIN ou URL Amazon
- Extraction : titre, prix, images, note, caractéristiques
- Sauvegarde en base pour réutilisation

## Déploiement

### Blog Template

1. Cloner le template pour chaque nouvelle niche
2. Configurer `.env.local` avec le bon `BLOG_SLUG`
3. Déployer sur Vercel
4. Connecter le domaine personnalisé

### Admin

1. Déployer sur Vercel
2. Configurer les variables d'environnement
3. Protéger l'accès (authentification à ajouter)

## Architecture Multi-Partenaires

Le système supporte plusieurs partenaires d'affiliation :

```typescript
// Patterns d'URL par partenaire
const PARTNER_PATTERNS = {
  amazon: 'https://amazon.fr/dp/{product_id}?tag={affiliate_id}',
  fnac: 'https://fnac.com/a{product_id}?CtpId={affiliate_id}',
  cdiscount: 'https://cdiscount.com/product/{product_id}?awc={affiliate_id}',
};
```

## Flux de Travail

### Créer un nouveau blog

1. Admin → Blogs → Nouveau
2. Configurer : nom, slug, niche, couleur, ID Amazon
3. Le système crée automatiquement les pages légales
4. Cloner le blog-template
5. Configurer l'env avec le slug
6. Déployer sur Vercel

### Générer un article

1. Admin → Articles → Générer
2. Sélectionner le blog cible
3. Choisir le type (review, guide, etc.)
4. Entrer le sujet
5. Optionnel : sélectionner des produits
6. Générer avec l'IA
7. Publier ou sauvegarder en brouillon

### Importer des produits

1. Admin → Produits → Importer
2. Sélectionner le blog
3. Entrer les ASINs ou URLs Amazon
4. Le système scrape les informations
5. Produits disponibles pour les articles

## Notes Techniques

- Le scraping Amazon utilise des headers réalistes pour éviter le blocage
- Délai entre les requêtes de scraping (1-2 secondes)
- Les liens affiliés utilisent `rel="nofollow sponsored"`
- Les pages légales incluent la mention obligatoire Amazon Partenaires
