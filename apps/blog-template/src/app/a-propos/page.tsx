import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlog, getLegalPage } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';
import { CheckIcon } from '@/components';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez notre mission et notre équipe.',
};

export default async function AProposPage() {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return null;
  }

  const legalPage = await getLegalPage(blog.id, 'about');

  // Default content if no custom about page exists
  const hasCustomContent = !!legalPage?.content;

  return (
    <div className="pt-16 md:pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <Link href="/" className="hover:text-neutral-900">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-neutral-900">À propos</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-8">
          À propos de {blog.name}
        </h1>

        {hasCustomContent ? (
          <div
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: legalPage.content }}
          />
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Notre mission
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                {blog.name} a été créé avec une mission claire : vous aider à faire les
                meilleurs choix lors de vos achats. Nous testons, comparons et analysons
                les produits pour vous fournir des informations fiables et objectives.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Ce que nous offrons
              </h2>
              <ul className="space-y-3">
                {[
                  'Des tests détaillés et honnêtes',
                  'Des guides d\'achat complets',
                  'Des comparatifs objectifs',
                  'Les meilleurs prix du marché',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Notre approche
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Nous croyons en la transparence. C'est pourquoi nous vous informons
                que certains liens sur notre site sont des liens affiliés. Lorsque
                vous effectuez un achat via ces liens, nous pouvons recevoir une
                commission, sans frais supplémentaires pour vous.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Cette rémunération nous permet de maintenir ce site et de continuer
                à vous fournir du contenu de qualité gratuitement. Nous ne
                recommandons que des produits que nous jugeons dignes d'intérêt.
              </p>
            </section>

            <section className="bg-neutral-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                Programme Partenaires Amazon
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {blog.name} participe au Programme Partenaires d'Amazon EU, un
                programme d'affiliation conçu pour permettre à des sites de percevoir
                une rémunération grâce à la création de liens vers Amazon.fr. En tant
                que Partenaire Amazon, nous réalisons un bénéfice sur les achats
                remplissant les conditions requises.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Contact
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                Vous avez des questions, des suggestions ou souhaitez collaborer
                avec nous ? N'hésitez pas à nous contacter. Nous serons ravis
                d'échanger avec vous.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
