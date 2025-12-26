'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: string;
  blog_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  status: 'draft' | 'published';
  tags: string[];
  reading_time: number | null;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  blogs?: { name: string; slug: string };
}

const CATEGORIES = [
  { value: 'reviews', label: 'Reviews' },
  { value: 'guides', label: 'Guides' },
  { value: 'comparatifs', label: 'Comparatifs' },
  { value: 'tops', label: 'TOP' },
];

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'reviews',
    status: 'draft' as 'draft' | 'published',
    tags: '',
    featured_image: '',
    seo_title: '',
    seo_description: '',
  });

  useEffect(() => {
    async function loadArticle() {
      try {
        const response = await fetch(`/api/articles/${id}`);
        if (!response.ok) throw new Error('Article non trouvé');

        const data = await response.json();
        setArticle(data);

        setFormData({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || '',
          content: data.content,
          category: data.category,
          status: data.status,
          tags: data.tags?.join(', ') || '',
          featured_image: data.featured_image || '',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setIsLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess('Article mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          published_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }

      setFormData({ ...formData, status: 'published' });
      setArticle({ ...article!, status: 'published' });
      setSuccess('Article publié avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }

      router.push('/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Article non trouvé</h1>
        <Link href="/articles" className="text-primary-600 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Link href="/articles" className="hover:text-neutral-900">
            Articles
          </Link>
          <span>/</span>
          <span className="text-neutral-900 line-clamp-1">{article.title}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 line-clamp-1">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge badge-info">{article.blogs?.name}</span>
              <span
                className={`badge ${
                  article.status === 'published' ? 'badge-success' : 'badge-warning'
                }`}
              >
                {article.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {article.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="btn btn-success"
                disabled={isSaving}
              >
                Publier
              </button>
            )}
            {article.status === 'published' && article.blogs?.slug && (
              <a
                href={`https://${article.blogs.slug}.vercel.app/${article.category}/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Voir sur le blog
              </a>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
          onClick={() => setActiveTab('content')}
        >
          Contenu
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'seo'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
          onClick={() => setActiveTab('seo')}
        >
          SEO
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'content' && (
          <div className="card">
            <div className="card-body space-y-6">
              {/* Title */}
              <div>
                <label className="form-label">Titre</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Catégorie</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Excerpt */}
              <div>
                <label className="form-label">Extrait</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>

              {/* Content */}
              <div>
                <label className="form-label">Contenu (HTML)</label>
                <textarea
                  className="form-textarea font-mono text-sm"
                  rows={20}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="form-label">Image à la une (URL)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="card">
            <div className="card-body space-y-6">
              {/* SEO Title */}
              <div>
                <label className="form-label">Titre SEO</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.seo_title.length}/60 caractères recommandés
                </p>
              </div>

              {/* SEO Description */}
              <div>
                <label className="form-label">Meta description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.seo_description.length}/155 caractères recommandés
                </p>
              </div>

              {/* Preview */}
              <div>
                <label className="form-label">Aperçu Google</label>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                  <p className="text-blue-700 text-lg hover:underline cursor-pointer">
                    {formData.seo_title || formData.title}
                  </p>
                  <p className="text-green-700 text-sm">
                    {article.blogs?.slug}.vercel.app › {formData.category} › {formData.slug}
                  </p>
                  <p className="text-neutral-600 text-sm mt-1">
                    {formData.seo_description || formData.excerpt || 'Aucune description'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
          <div className="flex gap-3">
            <Link href="/articles" className="btn btn-secondary">
              Annuler
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="spinner" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
