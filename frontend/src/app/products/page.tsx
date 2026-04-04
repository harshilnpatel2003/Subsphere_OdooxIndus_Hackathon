'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/products/')
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_type?.toLowerCase().includes(search.toLowerCase())
  );

  const typeColor = (type: string) => {
    if (type === 'service') return { bg: 'var(--secondary-container)', color: 'var(--on-secondary-container)' };
    return { bg: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' };
  };

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
          { label: 'Total Products', value: products.length, icon: 'auto_stories' },
          { label: 'Services', value: products.filter(p => p.product_type === 'service').length, icon: 'cloud' },
          { label: 'Recurring', value: products.filter(p => p.is_recurring).length, icon: 'refresh' },
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
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>Loading catalog…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(p => {
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
                  {p.internal_notes && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{p.internal_notes}</div>
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
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
              No products found.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(ProductsPage);
