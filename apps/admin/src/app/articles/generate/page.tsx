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

export default function GenerateArticlePage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
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
              <label className="form-label">
                Type d'article <span className="text-red-500">*</span>
              </label>
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
                Sujet / Mot-clé principal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: écouteurs sans fil Sony WH-1000XM5"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
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
              disabled={isLoading || !formData.blog_id || !formData.subject}
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
