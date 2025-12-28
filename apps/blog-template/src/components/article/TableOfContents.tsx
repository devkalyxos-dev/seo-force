'use client';

import { useState, useEffect } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  useEffect(() => {
    // Parse headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      items.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      });
    });

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length < 3) return null;

  return (
    <nav className="bg-neutral-50 rounded-xl p-5 mb-8">
      <h4 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Sommaire
      </h4>
      <ul className="space-y-1.5">
        {tocItems.map((item) => (
          <li
            key={item.id}
            className={item.level === 3 ? 'pl-4' : ''}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`block text-sm py-1 transition-colors ${
                activeId === item.id
                  ? 'text-primary-600 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface StickyTocProps {
  content: string;
}

export function StickyToc({ content }: StickyTocProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      items.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      });
    });

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length < 3) return null;

  return (
    <div className="hidden xl:block">
      <div className="sticky top-24">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Sommaire
        </h4>
        <ul className="space-y-1 border-l border-neutral-200">
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`block text-sm py-1.5 pl-4 -ml-px border-l-2 transition-colors ${
                  activeId === item.id
                    ? 'border-primary-600 text-primary-600 font-medium'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                } ${item.level === 3 ? 'pl-6 text-xs' : ''}`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
