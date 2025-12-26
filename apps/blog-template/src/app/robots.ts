import { MetadataRoute } from 'next';
import { getBlog } from '@/lib/supabase';
import { getBlogConfig } from '@/lib/config';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = getBlogConfig();
  const blog = await getBlog(config.slug);

  const baseUrl = blog?.domain
    ? `https://${blog.domain}`
    : `https://${config.slug}.vercel.app`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
