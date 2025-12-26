'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Blog {
  id: string;
  name: string;
  slug: string;
}

interface ScrapedProduct {
  asin: string;
  product: {
    id: string;
    title: string;
    price: number | null;
    images: string[];
    rating: number | null;
  };
}

export default function ImportProductsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState('');
  const [asinInput, setAsinInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<{
    success: ScrapedProduct[];
    failed: Array<{ asin: string; error: string }>;
  } | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
        if (data.length > 0) {
          setSelectedBlog(data[0].id);
        }
      }
    }
    loadBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog || !asinInput.trim()) return;

    setIsLoading(true);
    setError('');
    setResults(null);

    // Parse ASINs (one per line or comma-separated)
    const asins = asinInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (asins.length === 0) {
      setError('Veuillez entrer au moins un ASIN ou URL Amazon');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/products/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blog_id: selectedBlog,
          asins,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'import');
      }

      const data = await response.json();
      setResults(data);
      setAsinInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Link href="/products" className="hover:text-neutral-900">
            Produits
          </Link>
          <span>/</span>
          <span className="text-neutral-900">Importer via ASIN</span>
        </nav>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Importer des produits Amazon
        </h1>
        <p className="text-neutral-500 mt-1">
          Ajoutez des produits à partir de leurs ASINs ou URLs Amazon
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="mb-6 space-y-4">
          {results.success.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">
                {results.success.length} produit(s) importé(s) avec succès
              </h3>
              <ul className="space-y-2">
                {results.success.map((item) => (
                  <li key={item.asin} className="flex items-center gap-3 text-sm">
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <span className="text-green-700 truncate flex-1">
                      {item.product.title}
                    </span>
                    <span className="text-green-600 font-medium">
                      {item.product.price}€
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.failed.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">
                {results.failed.length} échec(s)
              </h3>
              <ul className="space-y-1 text-sm text-red-700">
                {results.failed.map((item, index) => (
                  <li key={index}>
                    <span className="font-mono">{item.asin}</span>: {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-6">
          {/* Blog Selection */}
          <div>
            <label className="form-label">
              Blog cible <span className="text-red-500">*</span>
            </label>
            <select
              className="form-select"
              value={selectedBlog}
              onChange={(e) => setSelectedBlog(e.target.value)}
              required
            >
              <option value="">Sélectionner un blog</option>
              {blogs.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  {blog.name}
                </option>
              ))}
            </select>
          </div>

          {/* ASIN Input */}
          <div>
            <label className="form-label">
              ASINs ou URLs Amazon <span className="text-red-500">*</span>
            </label>
            <textarea
              className="form-textarea font-mono text-sm"
              rows={6}
              placeholder={`Entrez un ASIN ou une URL par ligne :

B084TSLMC6
B09XXXXXX
https://amazon.fr/dp/B08XXXXX
...`}
              value={asinInput}
              onChange={(e) => setAsinInput(e.target.value)}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Vous pouvez entrer des ASINs (ex: B084TSLMC6) ou des URLs Amazon complètes.
              Un par ligne ou séparés par des virgules.
            </p>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              Comment ça marche ?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Le système récupère automatiquement les informations du produit sur Amazon</li>
              <li>• Titre, prix, images, note et caractéristiques sont extraits</li>
              <li>• Les produits sont sauvegardés dans votre base de données</li>
              <li>• Vous pourrez ensuite les utiliser dans vos articles générés par IA</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
          <Link href="/products" className="btn btn-secondary">
            Annuler
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !selectedBlog || !asinInput.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Import en cours...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Importer les produits
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
