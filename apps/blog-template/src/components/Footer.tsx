import Link from 'next/link';
import type { Blog } from '@seo-force/shared';
import { FOOTER_LINKS } from '@/lib/config';
import { ZapIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from './Icons';

interface FooterProps {
  blog: Blog;
}

export function Footer({ blog }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 flex items-center justify-center rounded text-white"
                style={{ backgroundColor: blog.primary_color || '#3B82F6' }}
              >
                <ZapIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-semibold tracking-tight text-neutral-900">
                {blog.name.toUpperCase()}
              </span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
              {blog.description || `Découvrez nos guides, tests et comparatifs pour faire les meilleurs choix.`}
            </p>
          </div>

          {/* Content Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Contenu</h4>
            <ul className="space-y-3 text-sm text-neutral-500">
              {FOOTER_LINKS.content.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Informations</h4>
            <ul className="space-y-3 text-sm text-neutral-500">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Social</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-neutral-400 hover:text-black transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5 shrink-0" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5 shrink-0" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-black transition-colors"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-5 h-5 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-neutral-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-neutral-400">
            <div className="space-y-2">
              <p>© {currentYear} {blog.name}. Tous droits réservés.</p>
              <p className="max-w-2xl leading-relaxed">
                {blog.name} participe au Programme Partenaires d'Amazon EU,
                un programme d'affiliation conçu pour permettre à des sites de
                percevoir une rémunération grâce à la création de liens vers Amazon.fr.
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/mentions-legales" className="hover:text-neutral-900">
                Mentions légales
              </Link>
              <Link href="/politique-confidentialite" className="hover:text-neutral-900">
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
