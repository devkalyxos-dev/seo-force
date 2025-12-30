import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlog, getLegalPage } from '@/lib/supabase';
import { getBlogConfig, OWNER_INFO, AFFILIATE_DISCLOSURE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et informations sur l\'éditeur du site.',
};

// Replace template placeholders with actual values
function replacePlaceholders(content: string, blog: { name: string; domain?: string | null }, ownerInfo: typeof OWNER_INFO): string {
  return content
    .replace(/\{\{blog_name\}\}/g, blog.name)
    .replace(/\{\{blog_domain\}\}/g, blog.domain || blog.name)
    .replace(/\{\{owner_name\}\}/g, ownerInfo.fullName)
    .replace(/\{\{owner_email\}\}/g, ownerInfo.email)
    .replace(/\{\{owner_address\}\}/g, ownerInfo.address.full)
    .replace(/\{\{owner_siret\}\}/g, ownerInfo.siret)
    .replace(/\{\{owner_rcs\}\}/g, ownerInfo.rcs)
    // Replace old hardcoded addresses with current config value
    .replace(/2220 Route De Bories, 97160 Le Moule, Guadeloupe/g, ownerInfo.address.full);
}

export default async function MentionsLegalesPage() {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const legalPage = await getLegalPage(blog.id, 'mentions');

  // Default content with KBIS info and affiliate disclosures
  const defaultContent = `
    <h2>Éditeur du site</h2>
    <p>Le site <strong>${blog.domain || blog.name}</strong> est édité par :</p>
    <ul>
      <li><strong>Nom commercial</strong> : ${OWNER_INFO.tradeName}</li>
      <li><strong>Responsable</strong> : ${OWNER_INFO.fullName}</li>
      <li><strong>Adresse</strong> : ${OWNER_INFO.address.full}</li>
      <li><strong>SIRET</strong> : ${OWNER_INFO.siret}</li>
      <li><strong>RCS</strong> : ${OWNER_INFO.rcs}</li>
      <li><strong>Email</strong> : ${OWNER_INFO.email}</li>
    </ul>

    <h2>Activité</h2>
    <p>${OWNER_INFO.activity}</p>
    <p>Date de début d'activité : ${OWNER_INFO.activityStartDate}</p>

    <h2>Hébergement</h2>
    <p>Ce site est hébergé par <strong>${OWNER_INFO.hosting.name}</strong>, ${OWNER_INFO.hosting.address}.</p>

    <h2>Propriété intellectuelle</h2>
    <p>L'ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable de ${OWNER_INFO.tradeName}.</p>

    <h2>Programme d'affiliation Amazon</h2>
    <p><strong>${blog.name}</strong> participe au <strong>${AFFILIATE_DISCLOSURE.amazon.program}</strong>, un programme d'affiliation conçu pour permettre à des sites de percevoir une rémunération grâce à la création de liens vers Amazon.fr.</p>
    <p>${AFFILIATE_DISCLOSURE.amazon.disclosure}</p>

    <h2>Liens affiliés - Transparence</h2>
    <p>${AFFILIATE_DISCLOSURE.general}</p>
    <p>Notre objectif est de vous fournir des informations honnêtes et utiles pour vous aider dans vos décisions d'achat. Les revenus générés par l'affiliation permettent de financer ce site et de maintenir un contenu de qualité.</p>

    <h2>Responsabilité</h2>
    <p>Les informations fournies sur ce site le sont à titre indicatif. ${OWNER_INFO.tradeName} s'efforce de maintenir ces informations à jour et exactes, mais ne peut garantir leur exactitude à tout moment.</p>
    <p>Les prix affichés peuvent varier et sont fournis par nos partenaires affiliés. Nous vous conseillons de vérifier les prix directement sur les sites marchands.</p>

    <h2>Contact</h2>
    <p>Pour toute question concernant ce site, vous pouvez nous contacter :</p>
    <ul>
      <li><strong>Email</strong> : ${OWNER_INFO.email}</li>
      <li><strong>Adresse</strong> : ${OWNER_INFO.address.full}</li>
    </ul>
  `;

  // Use database content if available, otherwise use default
  // Apply placeholder replacement to handle legacy templates
  const rawContent = legalPage?.content || defaultContent;
  const content = replacePlaceholders(rawContent, blog, OWNER_INFO);

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
