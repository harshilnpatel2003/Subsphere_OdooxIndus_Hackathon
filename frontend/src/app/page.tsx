'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import Link from 'next/link';
import { formatINR } from '@/lib/formatters';

export default function HomePage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    api.get('/plans/').then(r => setPlans(r.data.slice(0, 3))).catch(() => {});
    api.get('/products/?limit=4').then(r => setProducts(r.data)).catch(() => {});
  }, []);
  return (
    <div>
      <PortalNav />
      <div style={{textAlign:'center',padding:'60px 20px',background:'#f5f5f5'}}>
        <h1 style={{fontSize:'2.5em'}}>SubSphere</h1>
        <p style={{fontSize:'1.2em',color:'#666'}}>Subscription Management Made Simple</p>
        <Link href="/shop" style={{display:'inline-block',marginTop:'20px',padding:'12px 30px',background:'#0070f3',color:'#fff',textDecoration:'none',borderRadius:'4px'}}>Browse Plans</Link>
      </div>
      <div style={{padding:'40px 20px',maxWidth:'1000px',margin:'0 auto'}}>
        <h2>Popular Plans</h2>
        <div style={{display:'flex',gap:'20px',marginTop:'20px',flexWrap:'wrap'}}>
          {plans.map(p => (
            <div key={p.id} style={{border:'1px solid #ddd',padding:'20px',flex:'1',minWidth:'250px'}}>
              <h3>{p.name}</h3>
              <p style={{fontSize:'1.4em',fontWeight:'bold'}}>{formatINR(p.price)}<span style={{fontSize:'0.6em',color:'#888'}}>/{p.billing_period}</span></p>
              <p>Min qty: {p.min_quantity}</p>
              <Link href="/shop" style={{display:'inline-block',marginTop:'10px',padding:'8px 16px',background:'#0070f3',color:'#fff',textDecoration:'none',borderRadius:'4px'}}>Get Started</Link>
            </div>
          ))}
          {plans.length === 0 && <p>No plans available yet.</p>}
        </div>
      </div>
      <div style={{padding:'40px 20px',maxWidth:'1000px',margin:'0 auto'}}>
        <h2>Products</h2>
        <div style={{display:'flex',gap:'20px',marginTop:'20px',flexWrap:'wrap'}}>
          {products.map(p => (
            <div key={p.id} style={{border:'1px solid #ddd',padding:'20px',flex:'1',minWidth:'200px'}}>
              <h3>{p.name}</h3>
              <span style={{background:'#eee',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em'}}>{p.product_type}</span>
              <p style={{marginTop:'10px',fontWeight:'bold'}}>{formatINR(p.sales_price)}</p>
              <Link href={`/shop/${p.id}`} style={{color:'#0070f3'}}>View Details →</Link>
            </div>
          ))}
          {products.length === 0 && <p>No products available yet.</p>}
        </div>
      </div>
    </div>
  );
}
