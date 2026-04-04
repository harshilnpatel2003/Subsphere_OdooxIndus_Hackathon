'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import Link from 'next/link';
import { formatINR } from '@/lib/formatters';
import { addToCart } from '@/lib/cart';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [msg, setMsg] = useState('');

  const fetchProducts = (type: string) => {
    const url = type ? `/products/?type=${type}` : '/products/';
    api.get(url).then(r => setProducts(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchProducts('');
    api.get('/plans/').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const handleTypeChange = (val: string) => { setTypeFilter(val); fetchProducts(val); };

  const addPlanToCart = (plan: any) => {
    addToCart({ productId: `plan_${plan.id}`, productName: plan.name, planId: String(plan.id), planName: plan.name, billingPeriod: plan.billing_period, quantity: 1, unitPrice: Number(plan.price), taxId: null, variantId: null, productPhoto: null });
    setMsg(`✓ ${plan.name} added to cart`);
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div>
      <PortalNav />
      <div style={{padding:'20px',maxWidth:'1000px',margin:'0 auto'}}>
        <h1>Shop</h1>
        {msg && <div style={{background:'#d4edda',padding:'10px',marginBottom:'10px',borderRadius:'4px'}}>{msg}</div>}
        <div style={{marginBottom:'20px'}}>
          <label>Filter by type: </label>
          <select value={typeFilter} onChange={e => handleTypeChange(e.target.value)} style={{padding:'5px'}}>
            <option value="">All</option>
            <option value="service">Service</option>
            <option value="physical">Physical</option>
          </select>
        </div>
        <h2>Products</h2>
        <div style={{display:'flex',gap:'15px',flexWrap:'wrap',marginTop:'10px'}}>
          {products.map(p => (
            <div key={p.id} style={{border:'1px solid #ddd',padding:'15px',width:'220px', display:'flex', flexDirection:'column'}}>
              <div style={{width:'100%', height:'150px', background:'#f5f5f5', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', borderRadius:'4px'}}>
                {p.photo ? (
                  <img src={p.photo} alt={p.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <span className="material-icons" style={{fontSize: 48, color:'#ccc'}}>image</span>
                )}
              </div>
              <h3 style={{margin:'0 0 5px'}}>{p.name}</h3>
              <span style={{background:'#eee',padding:'2px 6px',fontSize:'0.8em',borderRadius:'3px', alignSelf:'flex-start'}}>{p.product_type}</span>
              <p style={{fontWeight:'bold',margin:'10px 0 5px'}}>{formatINR(p.sales_price)}</p>
              <Link href={`/shop/${p.id}`} style={{color:'#0070f3', marginTop:'auto'}}>View Details →</Link>
            </div>
          ))}
          {products.length === 0 && <p>No products found.</p>}
        </div>
        <h2 style={{marginTop:'30px'}}>Plans</h2>
        <table style={{width:'100%',borderCollapse:'collapse',marginTop:'10px'}}>
          <thead><tr style={{background:'#f9f9f9'}}>
            <th style={{border:'1px solid #ccc',padding:'8px'}}>Plan</th>
            <th style={{border:'1px solid #ccc',padding:'8px'}}>Price</th>
            <th style={{border:'1px solid #ccc',padding:'8px'}}>Period</th>
            <th style={{border:'1px solid #ccc',padding:'8px'}}>Min Qty</th>
            <th style={{border:'1px solid #ccc',padding:'8px'}}>Actions</th>
          </tr></thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>{p.name}</td>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>{formatINR(p.price)}</td>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>{p.billing_period}</td>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>{p.min_quantity}</td>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>
                  <button onClick={() => addPlanToCart(p)} style={{padding:'5px 10px',background:'#0070f3',color:'#fff',border:'none',borderRadius:'3px',cursor:'pointer'}}>Add to Cart</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
