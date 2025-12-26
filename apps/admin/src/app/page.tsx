import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';

async function getStats() {
  const supabase = getSupabaseAdmin();

  const [blogsResult, articlesResult, productsResult] = await Promise.all([
    supabase.from('blogs').select('id', { count: 'exact' }),
    supabase.from('articles').select('id, status', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
  ]);

  const publishedArticles = articlesResult.data?.filter(a => a.status === 'published').length || 0;
  const draftArticles = articlesResult.data?.filter(a => a.status === 'draft').length || 0;

  return {
    totalBlogs: blogsResult.count || 0,
    totalArticles: articlesResult.count || 0,
    publishedArticles,
    draftArticles,
    totalProducts: productsResult.count || 0,
  };
}

async function getRecentBlogs() {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentBlogs = await getRecentBlogs();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">
          Vue d'ensemble de vos blogs d'affiliation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Blogs</p>
              <p className="text-3xl font-semibold mt-1">{stats.totalBlogs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Articles publiés</p>
              <p className="text-3xl font-semibold mt-1">{stats.publishedArticles}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Brouillons</p>
              <p className="text-3xl font-semibold mt-1">{stats.draftArticles}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Produits</p>
              <p className="text-3xl font-semibold mt-1">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Actions rapides</h2>
          </div>
          <div className="card-body grid grid-cols-2 gap-4">
            <Link
              href="/blogs/new"
              className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Nouveau blog</span>
            </Link>
            <Link
              href="/articles/generate"
              className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">Générer article</span>
            </Link>
            <Link
              href="/products/import"
              className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-sm font-medium">Importer ASIN</span>
            </Link>
            <Link
              href="/articles"
              className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-8 h-8 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Voir articles</span>
            </Link>
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">Blogs récents</h2>
            <Link href="/blogs" className="text-sm text-neutral-500 hover:text-neutral-900">
              Voir tout →
            </Link>
          </div>
          <div className="card-body">
            {recentBlogs.length > 0 ? (
              <div className="space-y-4">
                {recentBlogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: blog.primary_color || '#3B82F6' }}
                    >
                      {blog.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{blog.name}</p>
                      <p className="text-sm text-neutral-500 truncate">{blog.niche}</p>
                    </div>
                    <span className="badge badge-info">{blog.slug}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">Aucun blog pour le moment</p>
                <Link href="/blogs/new" className="btn btn-primary">
                  Créer votre premier blog
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
