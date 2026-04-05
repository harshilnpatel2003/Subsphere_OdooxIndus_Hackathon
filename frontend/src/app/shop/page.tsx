'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatINR } from '@/lib/formatters';
import { addToCart } from '@/lib/cart';
import CartSidebar from '@/components/CartSidebar';

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (type: string) => {
    setLoading(true);
    try {
        const url = type ? `/products/?type=${type}` : '/products/';
        const res = await api.get(url);
        setProducts(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts('');
    api.get('/plans/').then(r => setPlans(r.data)).catch(() => {});
    
    const handleToggle = () => setIsCartOpen(prev => !prev);
    window.addEventListener('toggle-cart', handleToggle);
    return () => window.removeEventListener('toggle-cart', handleToggle);
  }, []);

  const handleTypeChange = (val: string) => { 
    setTypeFilter(val); 
    fetchProducts(val); 
  };

  const addPlanToCart = (e: React.MouseEvent, plan: any) => {
    e.stopPropagation();
    addToCart({ 
        productId: `plan_${plan.id}`, 
        productName: plan.name, 
        planId: String(plan.id), 
        planName: plan.name, 
        billingPeriod: plan.billing_period, 
        quantity: 1, 
        unitPrice: Number(plan.price), 
        taxId: null, 
        variantId: null, 
        productPhoto: null 
    });
    setIsCartOpen(true);
  };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '100px' }}>
      <PortalNav />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
            <div>
                <h1 className="display-sm">Marketplace</h1>
                <p className="body-lg text-muted" style={{ marginTop: '4px' }}>Discover premier architectural solutions and enterprise subscriptions.</p>
            </div>
            <button 
                onClick={() => setIsCartOpen(true)}
                className="btn btn-primary"
                style={{ padding: '14px 28px', fontSize: '0.9rem', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}
            >
                <span className="material-icons">shopping_cart</span>
                View Ledger / Checkout
            </button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '48px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="label-lg" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>Filter By:</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
                { id: '', label: 'All Catalog' },
                { id: 'service', label: 'Services' },
                { id: 'physical', label: 'Equipment' }
            ].map(t => (
                <button 
                    key={t.id}
                    onClick={() => handleTypeChange(t.id)}
                    style={{
                        padding: '10px 24px', 
                        borderRadius: 'var(--radius-full)', 
                        border: typeFilter === t.id ? '1px solid var(--primary)' : '1px solid var(--outline-variant)',
                        background: typeFilter === t.id ? 'var(--primary)' : 'white',
                        color: typeFilter === t.id ? 'white' : 'var(--on-surface-variant)',
                        cursor: 'pointer', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        transition: 'all 0.2s ease',
                        boxShadow: typeFilter === t.id ? 'var(--shadow-sm)' : 'none'
                    }}
                >
                    {t.label}
                </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '60px', alignItems: 'start' }}>
            {/* Products Listing */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <h2 className="headline-sm">Product Catalog</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--on-tertiary-container)', background: 'var(--tertiary-container)', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>{products.length} Items</span>
                </div>
                
                {loading ? (
                    <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--outline)' }}>
                        <div className="material-icons" style={{ fontSize: '48px', opacity: 0.1, marginBottom: '16px' }}>architecture</div>
                        <p>Syncing product metadata...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {products.map(p => (
                        <div 
                            key={p.id} 
                            className="card"
                            style={{ 
                                padding: '16px', display: 'flex', flexDirection: 'column', 
                                border: '1px solid var(--surface-container)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                cursor: 'pointer', position: 'relative', overflow: 'hidden'
                            }} 
                            onClick={() => router.push(`/shop/${p.id}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                e.currentTarget.style.borderColor = 'var(--surface-container)';
                            }}
                        >
                            <div style={{ 
                                width: '100%', height: '220px', background: 'var(--surface-container-low)', 
                                marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-container)'
                            }}>
                                {p.photo ? (
                                    <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span className="material-icons" style={{ fontSize: 64, color: 'var(--outline-variant)' }}>auto_awesome</span>
                                )}
                            </div>
                            <div style={{ padding: '0 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                    <h3 className="title-lg" style={{ marginBottom: '4px' }}>{p.name}</h3>
                                    <span className={`badge ${p.product_type === 'service' ? 'badge-confirmed' : 'badge-draft'}`} style={{ textTransform: 'capitalize' }}>{p.product_type}</span>
                                </div>
                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="label-sm">Retail Value</span>
                                        <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>{formatINR(p.sales_price)}</span>
                                    </div>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                                        <span className="material-icons" style={{ color: 'white', fontSize: '20px' }}>arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div style={{ gridColumn: '1/-1', padding: '100px 0', textAlign: 'center' }}>
                            <span className="material-icons" style={{ fontSize: '64px', color: 'var(--outline-variant)', opacity: 0.3 }}>search_off</span>
                            <p className="body-lg text-muted" style={{ marginTop: '16px' }}>No entries match your search criteria.</p>
                        </div>
                    )}
                    </div>
                )}
            </div>

            {/* Plans List */}
            <div style={{ position: 'sticky', top: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <h2 className="headline-sm">Plans</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-fixed)', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>{plans.length} available</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {plans.map(p => (
                        <div 
                            key={p.id} 
                            className="card"
                            style={{ 
                                padding: '32px', 
                                border: '1px solid var(--surface-container)', 
                                borderTop: '4px solid var(--primary)', 
                                position: 'relative',
                                background: 'linear-gradient(to bottom, white, var(--surface-container-low))'
                            }}
                        >
                            <div className="title-lg" style={{ color: 'var(--primary)', letterSpacing: '-0.01em', marginBottom: '8px' }}>{p.name}</div>
                            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                {formatINR(p.price)}
                                <span className="label-lg" style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}> / {p.billing_period}</span>
                            </div>
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { icon: 'done', text: `Minimum commitment: ${p.min_quantity} units` },
                                    { icon: 'done', text: 'Architectural Ledger integration' },
                                    { icon: 'done', text: 'Enterprise compliance enabled' }
                                ].map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                        <span className="material-icons" style={{ fontSize: '16px', color: 'var(--on-tertiary-container)' }}>{item.icon}</span>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={(e) => addPlanToCart(e, p)}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', fontWeight: 700, fontSize: '0.95rem' }}
                            >
                                Get Started
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
