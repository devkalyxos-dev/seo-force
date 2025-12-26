import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';

async function getBlogs() {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('blogs')
    .select('*, articles(count)')
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Blogs</h1>
          <p className="text-neutral-500 mt-1">
            Gérez vos blogs d'affiliation
          </p>
        </div>
        <Link href="/blogs/new" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau blog
        </Link>
      </div>

      {/* Blogs Grid */}
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                    style={{ backgroundColor: blog.primary_color || '#3B82F6' }}
                  >
                    {blog.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">
                      {blog.name}
                    </h3>
                    <p className="text-sm text-neutral-500 truncate">{blog.niche}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Articles</span>
                    <span className="font-medium">{blog.articles?.[0]?.count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-neutral-500">Slug</span>
                    <span className="badge badge-info">{blog.slug}</span>
                  </div>
                  {blog.domain && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-neutral-500">Domaine</span>
                      <span className="text-neutral-900 truncate max-w-[150px]">
                        {blog.domain}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Aucun blog créé
            </h3>
            <p className="text-neutral-500 mb-6">
              Créez votre premier blog d'affiliation pour commencer.
            </p>
            <Link href="/blogs/new" className="btn btn-primary">
              Créer un blog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
