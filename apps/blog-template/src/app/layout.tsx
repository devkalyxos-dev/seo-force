import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Header, Footer } from '@/components';
import { getBlog } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  return {
    title: {
      default: blog?.name || 'Blog',
      template: `%s | ${blog?.name || 'Blog'}`,
    },
    description: blog?.description || 'Découvrez nos guides, tests et comparatifs.',
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: blog?.name || 'Blog',
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  if (!blog) {
    return (
      <html lang="fr" className={`${inter.variable} ${plusJakarta.variable}`}>
        <body className="bg-white text-neutral-900 antialiased">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2">Blog non trouvé</h1>
              <p className="text-neutral-500">
                Vérifiez la configuration NEXT_PUBLIC_BLOG_SLUG
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Inject CSS variables for primary color
  const primaryColorStyles = blog.primary_color
    ? `
    :root {
      --primary-500: ${hexToRgb(blog.primary_color)};
      --primary-600: ${hexToRgb(adjustBrightness(blog.primary_color, -20))};
      --primary-700: ${hexToRgb(adjustBrightness(blog.primary_color, -40))};
    }
  `
    : '';

  return (
    <html lang="fr" className={`${inter.variable} ${plusJakarta.variable} scroll-smooth`}>
      <head>
        {primaryColorStyles && <style dangerouslySetInnerHTML={{ __html: primaryColorStyles }} />}
      </head>
      <body className="bg-white text-neutral-900 antialiased selection:bg-primary-100 selection:text-primary-900">
        <Header blog={blog} />
        <main className="pt-16">{children}</main>
        <Footer blog={blog} />
      </body>
    </html>
  );
}

// Helper functions for color manipulation
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '59 130 246'; // Default blue
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

function adjustBrightness(hex: string, percent: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = Math.max(0, Math.min(255, parseInt(result[1], 16) + percent));
  const g = Math.max(0, Math.min(255, parseInt(result[2], 16) + percent));
  const b = Math.max(0, Math.min(255, parseInt(result[3], 16) + percent));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
