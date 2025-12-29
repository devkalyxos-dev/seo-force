'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Blog {
  id: string;
  name: string;
  slug: string;
  niche: string;
}

interface Product {
  id: string;
  product_id: string;
  title: string;
  price: number | null;
  features?: string[];
}

interface ArticleWithProducts {
  category: string;
  status: string;
  product_ids: string[] | null;
}

const ARTICLE_TYPES = [
  { value: 'review', label: 'Review / Test', description: 'Test détaillé d\'un produit' },
  { value: 'guide', label: 'Guide d\'achat', description: 'Guide complet pour choisir' },
  { value: 'comparatif', label: 'Comparatif', description: 'Comparaison de produits' },
  { value: 'top', label: 'TOP / Classement', description: 'Les meilleurs produits' },
];

const TONES = [
  { value: 'professional', label: 'Professionnel' },
  { value: 'casual', label: 'Décontracté' },
  { value: 'enthusiastic', label: 'Enthousiaste' },
];

const ALL_TYPES = ['review', 'guide', 'comparatif', 'top'];

// Helper: convertit une catégorie (reviews) en type (review)
function categoryToType(category: string): string {
  if (category === 'tops') return 'top';
  return category.endsWith('s') ? category.slice(0, -1) : category;
}

export default function GenerateArticlePage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [existingArticles, setExistingArticles] = useState<ArticleWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState<any>(null);

  const [formData, setFormData] = useState({
    blog_id: '',
    type: 'review',
    subject: '',
    product_ids: [] as string[],
    keywords: '',
    tone: 'professional',
    publish: false,
  });

  // Load blogs on mount
  useEffect(() => {
    async function loadBlogs() {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, blog_id: data[0].id }));
        }
      }
    }
    loadBlogs();
  }, []);

  // Load products when blog changes
  useEffect(() => {
    async function loadProducts() {
      if (!formData.blog_id) return;

      setIsLoadingProducts(true);
      const response = await fetch(`/api/products?blog_id=${formData.blog_id}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
      setIsLoadingProducts(false);
    }
    loadProducts();
  }, [formData.blog_id]);

  // Load existing articles when blog changes
  useEffect(() => {
    async function loadExistingArticles() {
      if (!formData.blog_id) return;

      const response = await fetch(`/api/articles?blog_id=${formData.blog_id}`);
      if (response.ok) {
        const articles = await response.json();
        setExistingArticles(articles);
      }
    }
    loadExistingArticles();
  }, [formData.blog_id]);

  // Fonction de génération aléatoire complète
  const handleRandomGeneration = () => {
    if (products.length === 0) return;

    // 1. Filtrer les articles publiés uniquement
    const publishedArticles = existingArticles.filter((a) => a.status === 'published');

    // 2. Choisir un type non encore utilisé (ou tous si cycle complet)
    const usedTypes = Array.from(new Set(publishedArticles.map((a) => categoryToType(a.category))));
    const unusedTypes = ALL_TYPES.filter((t) => !usedTypes.includes(t));
    const typePool = unusedTypes.length > 0 ? unusedTypes : ALL_TYPES;
    const randomType = typePool[Math.floor(Math.random() * typePool.length)];

    // 3. Trouver les produits déjà utilisés pour CE type
    const articlesOfType = publishedArticles.filter(
      (a) => categoryToType(a.category) === randomType
    );
    const usedProductIds = articlesOfType.flatMap((a) => a.product_ids || []);

    // 4. Sélectionner un produit NON utilisé pour ce type
    const availableProducts = products.filter((p) => !usedProductIds.includes(p.id));
    const productPool = availableProducts.length > 0 ? availableProducts : products;
    const randomProduct = productPool[Math.floor(Math.random() * productPool.length)];

    // 5. Générer les mots-clés à partir du produit (features)
    const keywords = randomProduct?.features?.slice(0, 3).join(', ') || '';

    // 6. Choisir un ton aléatoire
    const randomTone = TONES[Math.floor(Math.random() * TONES.length)].value;

    // 7. Mettre à jour le formulaire
    setFormData({
      ...formData,
      type: randomType,
      product_ids: randomProduct ? [randomProduct.id] : [],
      subject: '', // Laissé vide pour génération auto
      keywords: keywords,
      tone: randomTone,
    });
  };

  // Trouver le prochain produit qui n'a pas encore ses 4 articles
  const getNextProductToProcess = (): Product | null => {
    for (const product of products) {
      const productArticles = existingArticles.filter(
        (a) => a.product_ids?.includes(product.id)
      );

      // Compter les types d'articles existants pour ce produit
      const existingTypes = new Set(
        productArticles.map((a) => categoryToType(a.category))
      );

      // Si moins de 4 types, ce produit n'est pas complet
      if (existingTypes.size < 4) {
        return product;
      }
    }

    // Tous les produits ont leurs 4 articles, recommencer depuis le début
    return products[0] || null;
  };

  // Compter les articles existants pour un produit
  const getExistingTypesForProduct = (product: Product): string[] => {
    const productArticles = existingArticles.filter(
      (a) => a.product_ids?.includes(product.id)
    );
    return Array.from(new Set(productArticles.map((a) => categoryToType(a.category))));
  };

  // Génération batch de 4 articles
  const handleGenerateBatch = async () => {
    const nextProduct = getNextProductToProcess();
    if (!nextProduct || products.length === 0) return;

    // Sélectionner 1-2 autres produits pour comparatif/top
    const otherProducts = products
      .filter((p) => p.id !== nextProduct.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1);

    setIsBatchGenerating(true);
    setBatchProgress(0);
    setBatchResults([]);
    setError('');

    try {
      const response = await fetch('/api/articles/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blog_id: formData.blog_id,
          product_id: nextProduct.id,
          other_product_ids: otherProducts.map((p) => p.id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setBatchResults(data.articles || []);

      // Recharger les articles existants
      const articlesResponse = await fetch(`/api/articles?blog_id=${formData.blog_id}`);
      if (articlesResponse.ok) {
        const articles = await articlesResponse.json();
        setExistingArticles(articles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération batch');
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const nextProductToProcess = getNextProductToProcess();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedArticle(null);

    try {
      const response = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      setGeneratedArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Link href="/articles" className="hover:text-neutral-900">
            Articles
          </Link>
          <span>/</span>
          <span className="text-neutral-900">Générer</span>
        </nav>
        <h1 className="text-2xl font-semibold text-neutral-900">Générer un article</h1>
        <p className="text-neutral-500 mt-1">
          Utilisez l'IA pour générer un article d'affiliation optimisé
        </p>
      </div>

      {/* Section Génération Batch */}
      {formData.blog_id && products.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800">Génération automatique</h3>
              {nextProductToProcess && (
                <div className="mt-1">
                  <p className="text-sm text-green-700">
                    Prochain produit : <span className="font-medium">{nextProductToProcess.title}</span>
                  </p>
                  <p className="text-xs text-green-600">
                    {4 - getExistingTypesForProduct(nextProductToProcess).length} article(s) restant(s) sur 4
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleGenerateBatch}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.blog_id || products.length === 0 || isBatchGenerating || isLoading}
            >
              {isBatchGenerating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Génération en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Générer 4 articles
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Résultats Batch */}
      {batchResults.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3">4 articles générés avec succès</h3>
          <div className="grid grid-cols-2 gap-2">
            {batchResults.map((result, index) => (
              <Link
                key={index}
                href={`/articles/${result.article.id}`}
                className="flex items-center gap-2 p-2 bg-white rounded border border-green-100 hover:border-green-300 transition-colors"
              >
                <span className="text-xs font-medium uppercase text-green-600">{result.type}</span>
                <span className="text-sm truncate">{result.article.title}</span>
              </Link>
            ))}
          </div>
          <button
            onClick={() => setBatchResults([])}
            className="mt-3 text-sm text-green-600 hover:text-green-800"
          >
            Fermer
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {generatedArticle ? (
        /* Result */
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-green-600">Article généré avec succès</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setGeneratedArticle(null)}
                className="btn btn-secondary"
              >
                Générer un autre
              </button>
              <Link
                href={`/articles/${generatedArticle.article.id}`}
                className="btn btn-primary"
              >
                Voir l'article
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{generatedArticle.article.title}</h3>
              <p className="text-neutral-500 text-sm mt-1">
                {generatedArticle.article.excerpt}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="badge badge-info">
                {generatedArticle.article.category}
              </span>
              <span className="text-neutral-500">
                {generatedArticle.article.reading_time} min de lecture
              </span>
              <span className={`badge ${generatedArticle.article.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                {generatedArticle.article.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <h4 className="font-medium text-sm text-neutral-700 mb-2">Aperçu du contenu</h4>
              <div
                className="prose prose-sm max-w-none max-h-96 overflow-y-auto bg-neutral-50 p-4 rounded-lg"
                dangerouslySetInnerHTML={{ __html: generatedArticle.article.content }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body space-y-6">
            {/* Blog Selection */}
            <div>
              <label className="form-label">
                Blog cible <span className="text-red-500">*</span>
              </label>
              <select
                className="form-select"
                value={formData.blog_id}
                onChange={(e) => setFormData({ ...formData, blog_id: e.target.value })}
                required
              >
                <option value="">Sélectionner un blog</option>
                {blogs.map((blog) => (
                  <option key={blog.id} value={blog.id}>
                    {blog.name} ({blog.niche})
                  </option>
                ))}
              </select>
            </div>

            {/* Article Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">
                  Type d'article <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRandomGeneration}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                  disabled={!formData.blog_id || products.length === 0}
                  title="Configure tout automatiquement : type, produit, mots-clés et ton"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Aléatoire
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ARTICLE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.type === type.value
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                  >
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-neutral-500">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="form-label">
                Sujet / Mot-clé principal
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: écouteurs sans fil Sony WH-1000XM5"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Optionnel si un produit est sélectionné - le sujet sera généré automatiquement
              </p>
            </div>

            {/* Products */}
            {products.length > 0 && (
              <div>
                <label className="form-label">Produits à inclure</label>
                <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-lg">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-3 p-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={formData.product_ids.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs text-neutral-500">
                          ASIN: {product.product_id}
                          {product.price && ` • ${product.price}€`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {isLoadingProducts && (
                  <p className="text-sm text-neutral-500 mt-2">Chargement des produits...</p>
                )}
              </div>
            )}

            {/* Keywords */}
            <div>
              <label className="form-label">Mots-clés secondaires</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: casque audio, réduction de bruit, Bluetooth"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Séparez les mots-clés par des virgules
              </p>
            </div>

            {/* Tone */}
            <div>
              <label className="form-label">Ton de l'article</label>
              <div className="flex gap-3">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      formData.tone === tone.value
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => setFormData({ ...formData, tone: tone.value })}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Publish option */}
            <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.publish}
                onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
                className="rounded"
              />
              <div>
                <p className="font-medium">Publier immédiatement</p>
                <p className="text-sm text-neutral-500">
                  Sinon, l'article sera sauvegardé en brouillon
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
            <Link href="/articles" className="btn btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !formData.blog_id || (!formData.subject && formData.product_ids.length === 0)}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Générer l'article
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
