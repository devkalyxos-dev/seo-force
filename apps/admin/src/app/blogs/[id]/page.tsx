'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Blog {
  id: string;
  name: string;
  slug: string;
  niche: string;
  description: string | null;
  primary_color: string;
  domain: string | null;
  created_at: string;
}

interface AffiliateId {
  id: string;
  partner_id: string;
  affiliate_id: string;
  is_primary: boolean;
}

const COLOR_PRESETS = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Noir', value: '#171717' },
];

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [affiliateIds, setAffiliateIds] = useState<AffiliateId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    description: '',
    primary_color: '#3B82F6',
    domain: '',
    amazon_affiliate_id: '',
  });

  useEffect(() => {
    async function loadBlog() {
      try {
        const response = await fetch(`/api/blogs/${id}`);
        if (!response.ok) throw new Error('Blog non trouvé');

        const data = await response.json();
        setBlog(data.blog);
        setAffiliateIds(data.affiliateIds || []);

        const amazonId = data.affiliateIds?.find(
          (a: AffiliateId) => a.partner_id === 'amazon'
        );

        setFormData({
          name: data.blog.name,
          niche: data.blog.niche,
          description: data.blog.description || '',
          primary_color: data.blog.primary_color || '#3B82F6',
          domain: data.blog.domain || '',
          amazon_affiliate_id: amazonId?.affiliate_id || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setIsLoading(false);
      }
    }
    loadBlog();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess('Blog mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce blog ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      router.push('/blogs');
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

  if (!blog) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Blog non trouvé</h1>
        <Link href="/blogs" className="text-primary-600 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Link href="/blogs" className="hover:text-neutral-900">
            Blogs
          </Link>
          <span>/</span>
          <span className="text-neutral-900">{blog.name}</span>
        </nav>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-xl"
            style={{ backgroundColor: blog.primary_color || '#3B82F6' }}
          >
            {blog.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{blog.name}</h1>
            <p className="text-neutral-500">{blog.niche}</p>
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

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="font-semibold">Actions rapides</h2>
        </div>
        <div className="card-body flex gap-3">
          <Link
            href={`/articles/generate?blog_id=${blog.id}`}
            className="btn btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Générer un article
          </Link>
          <Link
            href={`/products/import?blog_id=${blog.id}`}
            className="btn btn-secondary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importer des produits
          </Link>
          <a
            href={`https://${blog.slug}.vercel.app`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Voir le blog
          </a>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="card-header">
          <h2 className="font-semibold">Modifier le blog</h2>
        </div>
        <div className="card-body space-y-6">
          {/* Name */}
          <div>
            <label className="form-label">Nom du blog</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Slug (read-only) */}
          <div>
            <label className="form-label">Slug</label>
            <input
              type="text"
              className="form-input bg-neutral-50"
              value={blog.slug}
              disabled
            />
            <p className="text-xs text-neutral-500 mt-1">
              Le slug ne peut pas être modifié après création
            </p>
          </div>

          {/* Niche */}
          <div>
            <label className="form-label">Niche</label>
            <input
              type="text"
              className="form-input"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Primary Color */}
          <div>
            <label className="form-label">Couleur principale</label>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.primary_color === color.value
                        ? 'border-neutral-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, primary_color: color.value })}
                  />
                ))}
              </div>
              <input
                type="color"
                className="w-8 h-8 rounded cursor-pointer"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              />
            </div>
          </div>

          {/* Amazon Affiliate ID */}
          <div>
            <label className="form-label">ID Partenaire Amazon</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: monsite-21"
              value={formData.amazon_affiliate_id}
              onChange={(e) => setFormData({ ...formData, amazon_affiliate_id: e.target.value })}
            />
          </div>

          {/* Domain */}
          <div>
            <label className="form-label">Domaine personnalisé</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: mon-blog.com"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
          <div className="flex gap-3">
            <Link href="/blogs" className="btn btn-secondary">
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

      {/* Info */}
      <div className="mt-6 text-sm text-neutral-500">
        <p>Créé le {new Date(blog.created_at).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>
  );
}
