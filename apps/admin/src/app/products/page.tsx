import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseAdmin } from '@/lib/supabase';

async function getProducts() {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('products')
    .select('*, blogs(name)')
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Produits</h1>
          <p className="text-neutral-500 mt-1">
            Gérez vos produits Amazon pour les articles
          </p>
        </div>
        <Link href="/products/import" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importer via ASIN
        </Link>
      </div>

      {/* Products Table */}
      {products.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>ASIN</th>
                <th>Prix</th>
                <th>Note</th>
                <th>Blog</th>
                <th className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-neutral-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate max-w-xs">
                          {product.title}
                        </p>
                        {product.features?.length > 0 && (
                          <p className="text-xs text-neutral-500 truncate max-w-xs">
                            {product.features[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{product.product_id}</span>
                  </td>
                  <td>
                    {product.price ? (
                      <span className="font-medium">{product.price}€</span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td>
                    {product.rating ? (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-sm">{product.rating.toFixed(1)}</span>
                        {product.review_count && (
                          <span className="text-xs text-neutral-500">
                            ({product.review_count})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {product.blogs?.name || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://amazon.fr/dp/${product.product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-400 hover:text-neutral-600"
                        title="Voir sur Amazon"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Aucun produit importé
            </h3>
            <p className="text-neutral-500 mb-6">
              Importez des produits Amazon pour les utiliser dans vos articles.
            </p>
            <Link href="/products/import" className="btn btn-primary">
              Importer des produits
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
