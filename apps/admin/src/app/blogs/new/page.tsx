'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NICHE_SUGGESTIONS = [
  'Tech / Gadgets',
  'Maison / Décoration',
  'Cuisine / Électroménager',
  'Sport / Fitness',
  'Gaming',
  'Beauté / Cosmétiques',
  'Jardin / Extérieur',
  'Bébé / Puériculture',
  'Auto / Moto',
  'Animaux',
];

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

export default function NewBlogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    niche: '',
    description: '',
    primary_color: '#3B82F6',
    amazon_affiliate_id: '',
    domain: '',
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const blog = await response.json();
      router.push(`/blogs/${blog.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Link href="/blogs" className="hover:text-neutral-900">
            Blogs
          </Link>
          <span>/</span>
          <span className="text-neutral-900">Nouveau blog</span>
        </nav>
        <h1 className="text-2xl font-semibold text-neutral-900">Créer un blog</h1>
        <p className="text-neutral-500 mt-1">
          Configurez votre nouveau blog d'affiliation
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-6">
          {/* Name */}
          <div>
            <label className="form-label">
              Nom du blog <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Tech Gadgets Review"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="form-label">
              Slug (identifiant) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="tech-gadgets-review"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Utilisé pour l'URL et la configuration. Ne peut pas être modifié.
            </p>
          </div>

          {/* Niche */}
          <div>
            <label className="form-label">
              Niche <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Tech / Gadgets"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              required
              list="niche-suggestions"
            />
            <datalist id="niche-suggestions">
              {NICHE_SUGGESTIONS.map((niche) => (
                <option key={niche} value={niche} />
              ))}
            </datalist>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Description du blog pour le SEO..."
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
                    title={color.name}
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
            <p className="text-xs text-neutral-500 mt-1">
              Votre identifiant du Programme Partenaires Amazon (optionnel pour le moment)
            </p>
          </div>

          {/* Domain */}
          <div>
            <label className="form-label">Domaine personnalisé</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: tech-gadgets.com"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Optionnel. Le blog sera accessible via {formData.slug || 'slug'}.vercel.app par défaut.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
          <Link href="/blogs" className="btn btn-secondary">
            Annuler
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" />
                Création...
              </>
            ) : (
              'Créer le blog'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
