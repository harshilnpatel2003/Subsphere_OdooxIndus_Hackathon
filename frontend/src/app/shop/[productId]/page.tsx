'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatINR } from '@/lib/formatters';
import { addToCart } from '@/lib/cart';
import CartSidebar from '@/components/CartSidebar';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    
    Promise.all([
      api.get(`/products/${productId}/`),
      api.get(`/products/${productId}/variants/`),
      api.get('/plans/'),
      api.get('/taxes/')
    ]).then(([prodRes, varRes, planRes, taxRes]) => {
      setProduct(prodRes.data);
      setVariants(varRes.data);
      setPlans(planRes.data);
      setTaxes(taxRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

    const handleToggle = () => setIsCartOpen(prev => !prev);
    window.addEventListener('toggle-cart', handleToggle);
    return () => window.removeEventListener('toggle-cart', handleToggle);
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const unitPrice = parseFloat(product.sales_price);
    const extraPrice = selectedVariant ? parseFloat(selectedVariant.extra_price) : 0;
    const finalUnitPrice = unitPrice + extraPrice;
    
    addToCart({
      productId: String(product.id),
      productName: product.name,
      planId: selectedPlan ? String(selectedPlan.id) : null,
      planName: selectedPlan ? selectedPlan.name : null,
      billingPeriod: selectedPlan ? selectedPlan.billing_period : null,
      quantity: quantity,
      unitPrice: finalUnitPrice,
      taxId: taxes.length > 0 ? String(taxes[0].id) : null, 
      variantId: selectedVariant ? String(selectedVariant.id) : null,
      productPhoto: product.photo,
    });
    
    setIsCartOpen(true);
  };

  if (loading) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;
  if (!product) return <div><PortalNav /><div style={{padding:'20px'}}>Product not found.</div></div>;

  const currentPrice = parseFloat(product.sales_price) + (selectedVariant ? parseFloat(selectedVariant.extra_price) : 0);

  return (
    <div style={{ background: 'var(--surface-container-lowest)', minHeight: '100vh' }}>
      <PortalNav />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <div style={{padding:'40px 20px', maxWidth:'1200px', margin:'0 auto'}}>
        <Link href="/shop" style={{color:'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
            Back to Marketplace
        </Link>
        
        <div style={{marginTop:'32px', display:'grid', gridTemplateColumns: '1fr 400px', gap:'60px'}}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{width:'320px', flexShrink: 0}}>
                    <div style={{width:'100%', aspectRatio:'1/1', background:'white', borderRadius:'16px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--surface-container-high)', boxShadow: 'var(--shadow-sm)'}}>
                    {product.photo ? (
                        <img src={product.photo} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    ) : (
                        <span className="material-icons" style={{fontSize: 80, color:'#ddd'}}>image</span>
                    )}
                    </div>
                </div>
                <div style={{flex: 1}}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <span style={{background:'var(--secondary-container)', padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight: 700, color: 'var(--on-secondary-container)'}}>{product.product_type}</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--on-surface)' }}>{product.name}</h1>
                    <p style={{marginTop:'24px', fontSize:'1.1rem', color: 'var(--on-surface-variant)', lineHeight: 1.6}}>{product.notes || 'No description provided.'}</p>
                </div>
            </div>

            <div style={{ padding: '32px', background: 'white', borderRadius: '24px', border: '1px solid var(--surface-container-high)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Customization</h3>
              
              {variants.length > 0 && (
                <div style={{marginBottom:'32px'}}>
                  <label style={{display:'block', marginBottom:'8px', fontWeight: 700, fontSize: '0.9rem'}}>Surface / Finish</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {variants.map(v => (
                        <button 
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            style={{
                                padding: '12px 24px', borderRadius: '12px', border: '2px solid',
                                borderColor: selectedVariant?.id === v.id ? 'var(--primary)' : 'var(--surface-container-high)',
                                background: selectedVariant?.id === v.id ? 'var(--primary-container)' : 'white',
                                color: selectedVariant?.id === v.id ? 'var(--on-primary-container)' : 'var(--on-surface)',
                                cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.85rem'
                            }}
                        >
                            {v.value} (+{formatINR(v.extra_price)})
                        </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{marginBottom:'32px'}}>
                <label style={{display:'block', marginBottom:'8px', fontWeight: 700, fontSize: '0.9rem'}}>Commercial Plan</label>
                <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap:'12px'}}>
                  {plans.map(p => (
                    <div key={p.id} onClick={() => setSelectedPlan(p)} style={{
                      padding:'20px', 
                      border:'2px solid', 
                      borderRadius:'16px',
                      cursor:'pointer',
                      background: selectedPlan?.id === p.id ? 'var(--secondary-container)' : 'white',
                      borderColor: selectedPlan?.id === p.id ? 'var(--secondary)' : 'var(--surface-container-high)',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>{formatINR(p.price)} / {p.billing_period}</div>
                    </div>
                  ))}
                  <div onClick={() => setSelectedPlan(null)} style={{
                      padding:'20px', 
                      border:'2px solid', 
                      borderRadius:'16px',
                      cursor:'pointer',
                      background: !selectedPlan ? 'var(--secondary-container)' : 'white',
                      borderColor: !selectedPlan ? 'var(--secondary)' : 'var(--surface-container-high)',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Standard Purchase</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>One-time payment</div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{display:'block', marginBottom:'8px', fontWeight: 700, fontSize: '0.9rem'}}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', width: '40px', textAlign: 'center' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <div style={{padding:'32px', border:'1px solid var(--surface-container-high)', borderRadius:'24px', background: 'white', position:'sticky', top:'100px', boxShadow: 'var(--shadow-lg)'}}>
              <h2 style={{marginTop:0, fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px'}}>Commitment Summary</h2>
              
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Base Price:</span>
                <span style={{ fontWeight: 600 }}>{formatINR(parseFloat(product.sales_price))}</span>
              </div>
              
              {selectedVariant && (
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Variant ({selectedVariant.value}):</span>
                    <span style={{ fontWeight: 600 }}>+{formatINR(parseFloat(selectedVariant.extra_price))}</span>
               </div>
              )}

              {taxes.length > 0 && (
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px', color:'var(--on-surface-variant)', fontSize:'0.9rem'}}>
                  <span>Standard Tax ({taxes[0].rate}%):</span>
                  <span>{formatINR(currentPrice * taxes[0].rate / 100)}</span>
                </div>
              )}
              
              <div style={{ borderTop: '1px solid var(--surface-container)', margin: '20px 0', paddingTop: '20px' }}>
                <div style={{display:'flex', justifyContent:'space-between', fontWeight: 900, fontSize:'1.75rem', color: 'var(--primary)'}}>
                    <span>Total</span>
                    <span>{formatINR(currentPrice * quantity * (taxes.length > 0 ? (1 + taxes[0].rate / 100) : 1))}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textAlign: 'right', marginTop: 4 }}>
                    {selectedPlan ? `Recurring ${selectedPlan.billing_period}` : 'One-time payment'}
                </div>
              </div>
              
              <button 
                onClick={handleAddToCart}
                style={{
                  width:'100%', 
                  padding:'18px', 
                  background:'var(--primary)', 
                  color:'white', 
                  border:'none', 
                  borderRadius:'14px', 
                  marginTop:'24px', 
                  cursor:'pointer',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span className="material-icons">shopping_bag</span>
                Begin Checkout
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>
                <span className="material-icons" style={{ fontSize: '14px' }}>verified_user</span>
                Secured by Razorpay Enterprise
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
