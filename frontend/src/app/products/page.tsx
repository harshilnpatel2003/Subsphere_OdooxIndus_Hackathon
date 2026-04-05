'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

const PAGE_SIZE = 12;

function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchProducts = useCallback((pg: number, q: string) => {
    setLoading(true);
    const params: Record<string, string | number> = { page: pg, page_size: PAGE_SIZE };
    if (q.trim()) params.search = q.trim();
    api.get('/products/', { params })
      .then(res => {
        // Paginated response: { count, next, previous, results }
        setProducts(res.data.results);
        setTotalCount(res.data.count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts(page, search);
  }, [page, fetchProducts]);

  // Debounced search: reset to page 1 when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts(1, search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  const goToPage = (pg: number) => {
    if (pg < 1 || pg > totalPages || pg === page) return;
    setPage(pg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build visible page numbers with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const typeColor = (type: string) => {
    if (type === 'service') return { bg: 'var(--secondary-container)', color: 'var(--on-secondary-container)' };
    return { bg: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' };
  };

  // Compute stat values from current page
  const startItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <DashboardLayout
      title="Product Catalog"
      subtitle="Manage services and physical products across your subscription ecosystem."
      actions={
        <Link href="/products/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <span className="material-icons" style={{ fontSize: 16 }}>add</span>
          Add Product
        </Link>
      }
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Products', value: totalCount, icon: 'auto_stories' },
          { label: 'Current Page', value: `${page} / ${totalPages}`, icon: 'view_module' },
          { label: 'Showing', value: totalCount > 0 ? `${startItem}–${endItem}` : '0', icon: 'visibility' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="stat-card__label">{label}</span>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary-container)', opacity: 0.7 }}>{icon}</span>
            </div>
            <div className="stat-card__value">{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        padding: '12px 16px', background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
      }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--on-surface)' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center' }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>close</span>
          </button>
        )}
        <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
          {totalCount} product{totalCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>Loading catalog…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {products.map(p => {
            const tc = typeColor(p.product_type);
            return (
              <div key={p.id} className="card" style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                borderLeft: '3px solid var(--primary-container)', cursor: 'pointer',
                transition: 'box-shadow 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', border: '1px solid var(--surface-container-high)',
                  }}>
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="material-icons" style={{ fontSize: 24, color: 'var(--primary-container)' }}>
                        {p.product_type === 'service' ? 'cloud' : 'inventory_2'}
                      </span>
                    )}
                  </div>
                  <span className="badge" style={{ background: tc.bg, color: tc.color }}>
                    {p.product_type || 'product'}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>{p.name}</div>
                  {p.notes && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{p.notes}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--surface-container)' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'monospace' }}>
                      INR {parseFloat(p.sales_price || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      {p.is_recurring ? '/ recurring' : 'one-time'}
                    </div>
                  </div>
                  {p.is_recurring && (
                    <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Recurring</span>
                  )}
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
              No products found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <span className="pagination-bar__info">
            Showing {startItem}–{endItem} of {totalCount}
          </span>

          <div className="pagination-bar__controls">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => goToPage(1)}
              title="First page"
            >
              <span className="material-icons" style={{ fontSize: 18 }}>first_page</span>
            </button>
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              title="Previous page"
            >
              <span className="material-icons" style={{ fontSize: 18 }}>chevron_left</span>
            </button>

            {getPageNumbers().map((pg, i) =>
              pg === '...' ? (
                <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
              ) : (
                <button
                  key={pg}
                  className={`pagination-btn pagination-btn--page ${pg === page ? 'pagination-btn--active' : ''}`}
                  onClick={() => goToPage(pg as number)}
                >
                  {pg}
                </button>
              )
            )}

            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              title="Next page"
            >
              <span className="material-icons" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => goToPage(totalPages)}
              title="Last page"
            >
              <span className="material-icons" style={{ fontSize: 18 }}>last_page</span>
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(ProductsPage);
