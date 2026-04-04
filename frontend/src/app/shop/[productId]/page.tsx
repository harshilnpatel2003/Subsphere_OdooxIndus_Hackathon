'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatINR } from '@/lib/formatters';
import { addToCart } from '@/lib/cart';

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
  const [msg, setMsg] = useState('');
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
      taxId: taxes.length > 0 ? String(taxes[0].id) : null, // Default to first tax for demo
      variantId: selectedVariant ? String(selectedVariant.id) : null,
      productPhoto: product.photo,
    });
    
    setMsg('✓ Added to cart');
    setTimeout(() => setMsg(''), 2000);
  };

  if (loading) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;
  if (!product) return <div><PortalNav /><div style={{padding:'20px'}}>Product not found.</div></div>;

  const currentPrice = parseFloat(product.sales_price) + (selectedVariant ? parseFloat(selectedVariant.extra_price) : 0);

  return (
    <div>
      <PortalNav />
      <div style={{padding:'20px', maxWidth:'800px', margin:'0 auto'}}>
        <Link href="/shop" style={{color:'#0070f3'}}>← Back to Shop</Link>
        
        <div style={{marginTop:'20px', display:'flex', gap:'40px'}}>
          <div style={{width:'300px'}}>
            <div style={{width:'100%', aspectRatio:'1/1', background:'#f5f5f5', borderRadius:'8px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #eee'}}>
              {product.photo ? (
                <img src={product.photo} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                <span className="material-icons" style={{fontSize: 80, color:'#ccc', fontFamily:'Material Icons'}}>image</span>
              )}
            </div>
          </div>
          <div style={{flex: 1}}>
            <h1>{product.name}</h1>
            <span style={{background:'#eee', padding:'2px 8px', borderRadius:'4px', fontSize:'0.9em'}}>{product.product_type}</span>
            <p style={{marginTop:'20px', fontSize:'1.2em'}}>{product.notes || 'No description provided.'}</p>
            
            <div style={{marginTop:'30px', padding:'15px', border:'1px solid #ddd', borderRadius:'4px'}}>
              <h3>Configuration</h3>
              
              {variants.length > 0 && (
                <div style={{marginTop:'15px'}}>
                  <label style={{display:'block', marginBottom:'5px'}}>Variant:</label>
                  <select 
                    style={{padding:'8px', width:'100%'}} 
                    onChange={(e) => setSelectedVariant(variants.find(v => v.id == e.target.value))}
                  >
                    <option value="">Standard</option>
                    {variants.map(v => (
                      <option key={v.id} value={v.id}>{v.attribute}: {v.value} (+{formatINR(v.extra_price)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{marginTop:'15px'}}>
                <label style={{display:'block', marginBottom:'5px'}}>Billing Plan (Optional):</label>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {plans.map(p => (
                    <label key={p.id} style={{
                      padding:'10px', 
                      border:'1px solid #ddd', 
                      borderRadius:'4px',
                      cursor:'pointer',
                      background: selectedPlan?.id === p.id ? '#f0f7ff' : '#fff',
                      borderColor: selectedPlan?.id === p.id ? '#0070f3' : '#ddd'
                    }}>
                      <input 
                        type="radio" 
                        name="plan" 
                        style={{marginRight:'10px'}} 
                        onChange={() => setSelectedPlan(p)}
                        checked={selectedPlan?.id === p.id}
                      />
                      {p.name} - {formatINR(p.price)} / {p.billing_period}
                    </label>
                  ))}
                  <label style={{
                      padding:'10px', 
                      border:'1px solid #ddd', 
                      borderRadius:'4px',
                      cursor:'pointer',
                      background: !selectedPlan ? '#f0f7ff' : '#fff',
                      borderColor: !selectedPlan ? '#0070f3' : '#ddd'
                    }}>
                      <input 
                        type="radio" 
                        name="plan" 
                        style={{marginRight:'10px'}} 
                        onChange={() => setSelectedPlan(null)}
                        checked={!selectedPlan}
                      />
                      One-time Purchase
                  </label>
                </div>
              </div>

              <div style={{marginTop:'15px'}}>
                <label style={{display:'block', marginBottom:'5px'}}>Quantity:</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{padding:'8px', width:'60px'}}
                />
              </div>
            </div>
          </div>

          <div style={{width:'300px'}}>
            <div style={{padding:'20px', border:'1px solid #0070f3', borderRadius:'4px', position:'sticky', top:'20px'}}>
              <h2 style={{marginTop:0}}>Price Summary</h2>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <span>Unit Price:</span>
                <span>{formatINR(currentPrice)}</span>
              </div>
              {taxes.length > 0 && (
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', color:'#666', fontSize:'0.9em'}}>
                  <span>Tax ({taxes[0].name} {taxes[0].rate}%):</span>
                  <span>{formatINR(currentPrice * taxes[0].rate / 100)}</span>
                </div>
              )}
              <hr />
              <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px', fontWeight:'bold', fontSize:'1.2em'}}>
                <span>Total:</span>
                <span>{formatINR(currentPrice * quantity * (taxes.length > 0 ? (1 + taxes[0].rate / 100) : 1))}</span>
              </div>
              
              <button 
                onClick={handleAddToCart}
                style={{
                  width:'100%', 
                  padding:'12px', 
                  background:'#0070f3', 
                  color:'#fff', 
                  border:'none', 
                  borderRadius:'4px', 
                  marginTop:'20px', 
                  cursor:'pointer',
                  fontWeight:'bold'
                }}
              >
                Add to Cart
              </button>
              
              {msg && <p style={{textAlign:'center', color:'green', marginTop:'10px', fontWeight:'bold'}}>{msg}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
