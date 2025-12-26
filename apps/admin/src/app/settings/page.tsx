'use client';

import { useState, useEffect } from 'react';

interface Settings {
  openai_api_key: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    openai_api_key: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }

      setSuccess('Paramètres enregistrés avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Paramètres</h1>
        <p className="text-neutral-500 mt-1">
          Configurez les paramètres globaux de l'application
        </p>
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

      <form onSubmit={handleSubmit}>
        {/* OpenAI Settings */}
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="font-semibold">OpenAI</h2>
            <p className="text-sm text-neutral-500">
              Configuration pour la génération d'articles par IA
            </p>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="form-label">Clé API OpenAI</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="form-input pr-24"
                  placeholder="sk-..."
                  value={settings.openai_api_key}
                  onChange={(e) =>
                    setSettings({ ...settings, openai_api_key: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Obtenez votre clé sur{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="card">
            <div className="card-body">
              <h3 className="font-medium text-neutral-900 mb-2">
                Variables d'environnement
              </h3>
              <p className="text-sm text-neutral-500 mb-3">
                Les clés API peuvent aussi être configurées via les variables
                d'environnement du projet.
              </p>
              <code className="block text-xs bg-neutral-100 p-3 rounded overflow-x-auto">
                OPENAI_API_KEY=sk-...
              </code>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="font-medium text-neutral-900 mb-2">
                Modèle utilisé
              </h3>
              <p className="text-sm text-neutral-500 mb-3">
                La génération d'articles utilise le modèle GPT-4o-mini pour un
                bon équilibre qualité/coût.
              </p>
              <span className="badge badge-info">gpt-4o-mini</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="spinner" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les paramètres'
            )}
          </button>
        </div>
      </form>

      {/* Documentation */}
      <div className="mt-12 card">
        <div className="card-header">
          <h2 className="font-semibold">Documentation</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4 text-sm text-neutral-600">
            <div>
              <h3 className="font-medium text-neutral-900">Configuration Supabase</h3>
              <p className="mt-1">
                Les variables Supabase doivent être configurées dans le fichier{' '}
                <code className="bg-neutral-100 px-1 rounded">.env.local</code>
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Déploiement</h3>
              <p className="mt-1">
                Pour déployer un nouveau blog, clonez le template et configurez le
                <code className="bg-neutral-100 px-1 rounded">NEXT_PUBLIC_BLOG_SLUG</code>
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Programme Amazon Partenaires</h3>
              <p className="mt-1">
                Inscrivez-vous sur{' '}
                <a
                  href="https://partenaires.amazon.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  partenaires.amazon.fr
                </a>{' '}
                pour obtenir votre ID affilié
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
