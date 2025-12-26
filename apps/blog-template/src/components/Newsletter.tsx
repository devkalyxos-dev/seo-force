'use client';

import { useState } from 'react';
import { MailOpenIcon, MailIcon } from './Icons';

interface NewsletterProps {
  blogId?: string;
}

export function Newsletter({ blogId }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus('loading');

    try {
      // TODO: Implement newsletter subscription via API
      // const response = await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, blogId }),
      // });

      // Simulate success for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus('success');
      setMessage('Merci ! Vous êtes maintenant inscrit(e) à notre newsletter.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <section id="subscribe" className="py-24 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mx-auto mb-6 text-primary-600">
          <MailOpenIcon className="w-5 h-5" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
          Restez informé(e)
        </h2>
        <p className="text-neutral-500 mb-8 max-w-lg mx-auto leading-relaxed">
          Recevez nos derniers guides, tests et bons plans directement dans votre boîte mail. Pas de spam, promis.
        </p>

        {status === 'success' ? (
          <div className="bg-green-50 text-green-700 px-6 py-4 rounded-lg inline-block">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative flex items-center">
            <div className="absolute left-3 text-neutral-400">
              <MailIcon className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              disabled={status === 'loading'}
              className="w-full bg-white border border-neutral-200 rounded-lg py-3.5 pl-10 pr-32 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent shadow-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="absolute right-1.5 bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-neutral-800 transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Envoi...' : "S'inscrire"}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-600 text-sm mt-4">{message}</p>
        )}

        <p className="text-xs text-neutral-400 mt-4">
          En vous inscrivant, vous acceptez notre{' '}
          <a href="/politique-confidentialite" className="underline hover:text-neutral-600">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </section>
  );
}
