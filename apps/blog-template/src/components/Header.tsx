'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Blog } from '@seo-force/shared';
import { NAV_LINKS } from '@/lib/config';
import { SearchIcon, MenuIcon, XIcon, ZapIcon } from './Icons';

interface HeaderProps {
  blog: Blog;
}

export function Header({ blog }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: blog.primary_color || '#3B82F6' }}
          >
            <ZapIcon className="w-[18px] h-[18px]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight leading-none group-hover:text-neutral-600 transition-colors">
              {blog.name.toUpperCase()}
            </span>
            <span className="text-xs text-neutral-500 font-medium tracking-wide">
              REVIEWS
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative hover:text-primary-600 transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block group">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-neutral-50 border border-neutral-200 text-xs rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 w-48 transition-all"
            />
          </div>
          <Link
            href="#subscribe"
            className="hidden sm:flex bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md hover:shadow-primary-500/25 items-center gap-2"
          >
            S'abonner
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white">
          <div className="px-6 py-4 space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-neutral-600 hover:text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-neutral-100">
              <Link
                href="#subscribe"
                className="block w-full text-center bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2.5 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                S'abonner à la newsletter
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
