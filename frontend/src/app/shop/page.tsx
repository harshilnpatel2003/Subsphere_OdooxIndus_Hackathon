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

  const fetchProducts = (type: string) => {
    const url = type ? `/products/?type=${type}` : '/products/';
    api.get(url).then(r => setProducts(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchProducts('');
    api.get('/plans/').then(r => setPlans(r.data)).catch(() => {});
    
    const handleToggle = () => setIsCartOpen(prev => !prev);
    window.addEventListener('toggle-cart', handleToggle);
    return () => window.removeEventListener('toggle-cart', handleToggle);
  }, []);

  const handleTypeChange = (val: string) => { setTypeFilter(val); fetchProducts(val); };

  const addPlanToCart = (e: React.MouseEvent, plan: any) => {
    e.stopPropagation();
    addToCart({ productId: `plan_${plan.id}`, productName: plan.name, planId: String(plan.id), planName: plan.name, billingPeriod: plan.billing_period, quantity: 1, unitPrice: Number(plan.price), taxId: null, variantId: null, productPhoto: null });
    setIsCartOpen(true);
  };

  return (
    <div style={{ background: 'var(--surface-container-lowest)', minHeight: '100vh' }}>
      <PortalNav />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <div style={{padding:'40px 20px',maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--on-surface)' }}>Marketplace</h1>
                <p style={{ color: 'var(--on-surface-variant)', marginTop: 4 }}>Select products or subscription plans to begin.</p>
            </div>
            <button 
                onClick={() => setIsCartOpen(true)}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}
            >
                <span className="material-icons">shopping_cart</span>
                Checkout
            </button>
        </div>

        <div style={{marginBottom:'32px', display: 'flex', gap: '12px', alignItems: 'center'}}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>Filter:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['', 'service', 'physical'].map(t => (
                <button 
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    style={{
                        padding: '8px 20px', borderRadius: '24px', border: '1px solid var(--surface-container-high)',
                        background: typeFilter === t ? 'var(--secondary-container)' : 'white',
                        color: typeFilter === t ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
                        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s'
                    }}
                >
                    {t === '' ? 'All Products' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Recommended for you</h2>
                <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap:'24px'}}>
                {products.map(p => (
                    <div 
                        key={p.id} 
                        style={{border:'1px solid var(--surface-container-high)',padding:'20px', display:'flex', flexDirection:'column', borderRadius: '16px', background: 'white', transition: 'all 0.3s', cursor: 'pointer', boxShadow: 'var(--shadow-sm)'}} 
                        onClick={() => router.push(`/shop/${p.id}`)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{width:'100%', height:'180px', background:'var(--surface-container-lowest)', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', borderRadius:'12px', border: '1px solid var(--surface-container)'}}>
                            {p.photo ? (
                            <img src={p.photo} alt={p.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                            <span className="material-icons" style={{fontSize: 56, color:'#ddd'}}>image</span>
                            )}
                        </div>
                        <h3 style={{margin:'0 0 6px', fontSize: '1.1rem', fontWeight: 700}}>{p.name}</h3>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <span style={{background:'var(--secondary-container)',padding:'2px 10px',fontSize:'0.7rem',borderRadius:'20px', color: 'var(--on-secondary-container)', fontWeight: 600}}>{p.product_type}</span>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)'}}>{formatINR(p.sales_price)}</span>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ color: 'var(--on-primary-container)', fontSize: '18px' }}>add</span>
                            </div>
                        </div>
                    </div>
                ))}
                {products.length === 0 && <p style={{ color: 'var(--on-surface-variant)' }}>No products found.</p>}
                </div>
            </div>

            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Subscription Plans</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {plans.map(p => (
                        <div key={p.id} style={{ padding: '24px', border: '1px solid var(--surface-container-high)', borderRadius: '20px', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)' }}>{p.name}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.25rem', marginTop: '8px' }}>
                                {formatINR(p.price)}
                                <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 400 }}> / {p.billing_period}</span>
                            </div>
                            <button 
                                onClick={(e) => addPlanToCart(e, p)}
                                style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '12px', border: '2px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
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
