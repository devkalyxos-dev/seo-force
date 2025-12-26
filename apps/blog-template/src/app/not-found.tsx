import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-8xl font-bold text-neutral-200 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          Page non trouvée
        </h1>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/reviews"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 font-medium px-6 py-3 rounded-lg border border-neutral-200 transition-colors"
          >
            Voir nos reviews
          </Link>
        </div>
      </div>
    </div>
  );
}
