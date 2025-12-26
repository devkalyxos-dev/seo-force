'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/config';

export function CategoryTabs() {
  const pathname = usePathname();

  const isActive = (slug: string) => {
    if (slug === 'latest') {
      return pathname === '/';
    }
    return pathname.startsWith(`/${slug}`);
  };

  return (
    <section className="border-b border-neutral-100 sticky top-16 z-40 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isActive('latest')
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            Derniers
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive(category.slug)
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
