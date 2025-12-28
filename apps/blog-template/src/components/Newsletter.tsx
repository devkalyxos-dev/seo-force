'use client';

import { useState } from 'react';
import { MailOpenIcon, MailIcon } from './Icons';

interface NewsletterProps {
  blogId?: string;
  backgroundImage?: string;
}

export function Newsletter({ blogId, backgroundImage }: NewsletterProps) {
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

  // Background style with Unsplash image or fallback
  const sectionStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(17,24,39,0.85), rgba(17,24,39,0.92)), url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  const hasBackground = !!backgroundImage;

  return (
    <section
      id="subscribe"
      className={`py-24 relative overflow-hidden ${hasBackground ? 'text-white' : 'bg-neutral-50'}`}
      style={sectionStyle}
    >
      {/* Subtle pattern overlay for depth */}
      {hasBackground && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-primary-800/10 pointer-events-none" />
      )}

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className={`w-12 h-12 rounded-xl shadow-lg flex items-center justify-center mx-auto mb-6 ${hasBackground ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white' : 'bg-white border border-neutral-100 text-primary-600'}`}>
          <MailOpenIcon className="w-5 h-5" />
        </div>
        <h2 className={`text-3xl font-semibold tracking-tight mb-4 ${hasBackground ? 'text-white' : 'text-neutral-900'}`}>
          Restez informé(e)
        </h2>
        <p className={`mb-8 max-w-lg mx-auto leading-relaxed ${hasBackground ? 'text-neutral-300' : 'text-neutral-500'}`}>
          Recevez nos derniers guides, tests et bons plans directement dans votre boîte mail. Pas de spam, promis.
        </p>

        {status === 'success' ? (
          <div className={`px-6 py-4 rounded-lg inline-block ${hasBackground ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative flex items-center">
            <div className={`absolute left-3 ${hasBackground ? 'text-neutral-400' : 'text-neutral-400'}`}>
              <MailIcon className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              disabled={status === 'loading'}
              className={`w-full rounded-lg py-3.5 pl-10 pr-32 text-sm focus:outline-none focus:ring-2 shadow-lg disabled:opacity-50 ${hasBackground ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-neutral-400 focus:ring-white/30 focus:border-white/30' : 'bg-white border border-neutral-200 focus:ring-neutral-900 focus:border-transparent'}`}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`absolute right-1.5 text-xs font-semibold px-4 py-2 rounded-md transition-all disabled:opacity-50 ${hasBackground ? 'bg-white text-neutral-900 hover:bg-neutral-100' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
            >
              {status === 'loading' ? 'Envoi...' : "S'inscrire"}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className={`text-sm mt-4 ${hasBackground ? 'text-red-400' : 'text-red-600'}`}>{message}</p>
        )}

        <p className={`text-xs mt-4 ${hasBackground ? 'text-neutral-400' : 'text-neutral-400'}`}>
          En vous inscrivant, vous acceptez notre{' '}
          <a href="/politique-confidentialite" className={`underline ${hasBackground ? 'hover:text-white' : 'hover:text-neutral-600'}`}>
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </section>
  );
}
