'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatDate, formatSubNumber } from '@/lib/formatters';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const subId = searchParams.get('sub');
  const [sub, setSub] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subId) return;
    
    Promise.all([
      api.get(`/subscriptions/${subId}/`),
      api.get(`/invoices/?subscription=${subId}`)
    ]).then(([sRes, iRes]) => {
      setSub(sRes.data);
      setInvoices(iRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [subId]);

  if (loading) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;
  if (!sub) return <div><PortalNav /><div style={{padding:'20px'}}>Order not found.</div></div>;

  const invoice = invoices[0]; // Most recent invoice

  return (
    <div>
      <PortalNav />
      <div style={{padding:'40px 20px', maxWidth:'600px', margin:'0 auto', textAlign:'center'}}>
        <h1 style={{color:'green', fontSize:'3em'}}>✓ Payment Successful</h1>
        <p style={{fontSize:'1.2em', color:'#666'}}>Your subscription is now active.</p>
        
        <div style={{marginTop:'40px', padding:'20px', border:'1px solid #ddd', borderRadius:'8px', textAlign:'left'}}>
          <h3>Subscription Details</h3>
          <p><strong>Number:</strong> {formatSubNumber(sub)}</p>
          <p><strong>Plan:</strong> {sub.plan_name || 'Individual Items'}</p>
          <p><strong>Start Date:</strong> {formatDate(sub.start_date)}</p>
          <p><strong>Status:</strong> <span style={{color:'green', textTransform:'uppercase', fontWeight:'bold'}}>{sub.status}</span></p>
          
          {invoice && (
            <div style={{marginTop:'20px', padding:'15px', background:'#f9f9f9', borderRadius:'4px'}}>
              <p><strong>Invoice:</strong> {invoice.invoice_number}</p>
              <p><strong>Amount Paid:</strong> INR {invoice.total}</p>
              <Link href={`/invoices/${invoice.id}`} style={{color:'#0070f3', textDecoration:'underline'}}>View Invoice Details</Link>
            </div>
          )}
        </div>
        
        <div style={{marginTop:'40px', display:'flex', gap:'20px', justifyContent:'center'}}>
          <Link href="/orders" style={{padding:'12px 25px', background:'#0070f3', color:'#fff', textDecoration:'none', borderRadius:'4px', fontWeight:'bold'}}>View My Orders</Link>
          <Link href="/shop" style={{padding:'12px 25px', border:'1px solid #0070f3', color:'#0070f3', textDecoration:'none', borderRadius:'4px', fontWeight:'bold'}}>Back to Shop</Link>
        </div>
      </div>
    </div>
  );
}
