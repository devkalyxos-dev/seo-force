import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';

async function getArticles() {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('articles')
    .select('*, blogs(name, slug)')
    .order('created_at', { ascending: false });

  return data || [];
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Articles</h1>
          <p className="text-neutral-500 mt-1">
            Gérez tous vos articles d'affiliation
          </p>
        </div>
        <Link href="/articles/generate" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Générer un article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-medium">
            Tous
          </button>
          <button className="px-3 py-1.5 rounded-full bg-white text-neutral-600 text-xs font-medium border border-neutral-200 hover:bg-neutral-50">
            Publiés
          </button>
          <button className="px-3 py-1.5 rounded-full bg-white text-neutral-600 text-xs font-medium border border-neutral-200 hover:bg-neutral-50">
            Brouillons
          </button>
        </div>
      </div>

      {/* Articles Table */}
      {articles.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Blog</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Date</th>
                <th className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <div className="min-w-0">
                      <Link
                        href={`/articles/${article.id}`}
                        className="font-medium text-neutral-900 hover:text-primary-600 line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                        {article.excerpt || 'Pas de description'}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {article.blogs?.name || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm capitalize">{article.category}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        article.status === 'published'
                          ? 'badge-success'
                          : 'badge-warning'
                      }`}
                    >
                      {article.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="text-sm text-neutral-500">
                    {formatDate(article.published_at || article.created_at)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/articles/${article.id}`}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      {article.blogs?.slug && article.status === 'published' && (
                        <a
                          href={`https://${article.blogs.slug}.vercel.app/${article.category}/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-neutral-600"
                          title="Voir sur le blog"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Aucun article
            </h3>
            <p className="text-neutral-500 mb-6">
              Générez votre premier article avec l'IA.
            </p>
            <Link href="/articles/generate" className="btn btn-primary">
              Générer un article
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
