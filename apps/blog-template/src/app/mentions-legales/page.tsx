import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlog, getLegalPage } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et informations sur l\'éditeur du site.',
};

export default async function MentionsLegalesPage() {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const legalPage = await getLegalPage(blog.id, 'mentions');

  // Default content if no custom legal page exists
  const defaultContent = `
    <h2>Éditeur du site</h2>
    <p>Le site ${blog.domain || blog.name} est édité par le propriétaire du blog.</p>

    <h2>Hébergement</h2>
    <p>Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.</p>

    <h2>Propriété intellectuelle</h2>
    <p>L'ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>

    <h2>Programme d'affiliation</h2>
    <p>${blog.name} participe au Programme Partenaires d'Amazon EU, un programme d'affiliation conçu pour permettre à des sites de percevoir une rémunération grâce à la création de liens vers Amazon.fr.</p>

    <p>En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.</p>

    <h2>Liens affiliés</h2>
    <p>Certains liens présents sur ce site sont des liens affiliés. Cela signifie que si vous cliquez sur ces liens et effectuez un achat, nous pouvons recevoir une commission sans frais supplémentaires pour vous.</p>

    <p>Nous ne recommandons que des produits que nous avons testés ou en lesquels nous avons confiance. Notre objectif est de vous fournir des informations honnêtes et utiles pour vous aider dans vos décisions d'achat.</p>

    <h2>Responsabilité</h2>
    <p>Les informations fournies sur ce site le sont à titre indicatif. Nous nous efforçons de maintenir ces informations à jour et exactes, mais nous ne pouvons garantir leur exactitude à tout moment.</p>

    <h2>Contact</h2>
    <p>Pour toute question concernant ce site, vous pouvez nous contacter via le formulaire de contact ou par email.</p>
  `;

  const content = legalPage?.content || defaultContent;

  return (
    <div className="pt-16 md:pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <Link href="/" className="hover:text-neutral-900">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-neutral-900">Mentions légales</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-8">
          Mentions légales
        </h1>

        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <p className="text-sm text-neutral-400 mt-12">
          Dernière mise à jour : {legalPage?.updated_at
            ? new Date(legalPage.updated_at).toLocaleDateString('fr-FR')
            : new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
