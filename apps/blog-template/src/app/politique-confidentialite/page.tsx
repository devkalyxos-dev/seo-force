import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlog, getLegalPage } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et protection des données personnelles.',
};

export default async function PolitiqueConfidentialitePage() {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const legalPage = await getLegalPage(blog.id, 'privacy');

  // Default content if no custom privacy page exists
  const defaultContent = `
    <h2>Introduction</h2>
    <p>${blog.name} s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.</p>

    <h2>Données collectées</h2>
    <p>Nous pouvons collecter les types de données suivants :</p>
    <ul>
      <li><strong>Données de navigation</strong> : adresse IP, type de navigateur, pages visitées, durée de visite</li>
      <li><strong>Données de contact</strong> : adresse email (si vous vous inscrivez à notre newsletter)</li>
      <li><strong>Cookies</strong> : petits fichiers stockés sur votre appareil pour améliorer votre expérience</li>
    </ul>

    <h2>Utilisation des données</h2>
    <p>Vos données sont utilisées pour :</p>
    <ul>
      <li>Améliorer le contenu et l'expérience utilisateur du site</li>
      <li>Envoyer notre newsletter (avec votre consentement)</li>
      <li>Analyser le trafic et les tendances du site</li>
      <li>Se conformer aux obligations légales</li>
    </ul>

    <h2>Cookies</h2>
    <p>Notre site utilise des cookies pour :</p>
    <ul>
      <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement du site</li>
      <li><strong>Cookies analytiques</strong> : nous aident à comprendre comment vous utilisez le site (Google Analytics)</li>
      <li><strong>Cookies publicitaires</strong> : utilisés par nos partenaires affiliés pour le suivi des conversions</li>
    </ul>
    <p>Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.</p>

    <h2>Programme d'affiliation Amazon</h2>
    <p>${blog.name} participe au Programme Partenaires d'Amazon EU. Les liens vers Amazon.fr contiennent un identifiant d'affiliation qui nous permet de percevoir une commission sur les ventes.</p>
    <p>Amazon peut collecter des données lorsque vous cliquez sur ces liens. Pour plus d'informations, consultez la <a href="https://www.amazon.fr/gp/help/customer/display.html?nodeId=201909010" target="_blank" rel="noopener">politique de confidentialité d'Amazon</a>.</p>

    <h2>Partage des données</h2>
    <p>Nous ne vendons pas vos données personnelles. Nous pouvons partager des données avec :</p>
    <ul>
      <li>Nos prestataires techniques (hébergement, analyse)</li>
      <li>Les autorités en cas d'obligation légale</li>
    </ul>

    <h2>Sécurité</h2>
    <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.</p>

    <h2>Vos droits</h2>
    <p>Conformément au RGPD, vous disposez des droits suivants :</p>
    <ul>
      <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
      <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
      <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
      <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
      <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
    </ul>
    <p>Pour exercer ces droits, contactez-nous via notre formulaire de contact.</p>

    <h2>Conservation des données</h2>
    <p>Nous conservons vos données personnelles pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, sauf obligation légale contraire.</p>

    <h2>Modifications</h2>
    <p>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page.</p>

    <h2>Contact</h2>
    <p>Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via le formulaire de contact du site.</p>
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
          <span className="text-neutral-900">Politique de confidentialité</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-8">
          Politique de confidentialité
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
