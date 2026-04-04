'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatDate, formatSubNumber, formatINR } from '@/lib/formatters';
import withAuth from '@/components/withAuth';
import Link from 'next/link';

function SubscriptionDetailPage() {
  const { subscriptionId } = useParams();
  const router = useRouter();
  const [sub, setSub] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchSubscriptionDetails = async () => {
    setLoading(true);
    try {
      const [sRes, iRes] = await Promise.all([
        api.get(`/subscriptions/${subscriptionId}/`),
        api.get(`/invoices/?subscription=${subscriptionId}`)
      ]);
      setSub(sRes.data);
      setInvoices(iRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subscriptionId) fetchSubscriptionDetails();
  }, [subscriptionId]);

  const handleAction = async (action: string) => {
    if (action === 'close' && !confirm('Are you sure you want to cancel this subscription?')) return;
    
    setActionMsg(`Processing ${action}...`);
    try {
      await api.post(`/subscriptions/${subscriptionId}/${action}/`);
      setActionMsg(`✓ Successfully ${action === 'close' ? 'cancelled' : action + 'ed'}`);
      setTimeout(() => setActionMsg(''), 3000);
      fetchSubscriptionDetails();
    } catch (err: any) {
      alert('Action failed: ' + (err.response?.data?.error || 'Unknown error'));
      setActionMsg('');
    }
  };

  if (loading) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;
  if (!sub) return <div><PortalNav /><div style={{padding:'20px'}}>Subscription not found.</div></div>;

  return (
    <div>
      <PortalNav />
      <div style={{padding:'20px', maxWidth:'1000px', margin:'0 auto'}}>
        <Link href="/orders" style={{color:'#0070f3'}}>← Back to My Orders</Link>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px'}}>
             <h1>{formatSubNumber(sub)}</h1>
             <span style={{
                padding:'10px 20px', borderRadius:'25px', fontSize:'1em', fontWeight:'bold', textTransform:'uppercase',
                background: sub.status === 'active' ? '#d4edda' : '#eee',
                color: sub.status === 'active' ? '#155724' : '#666'
              }}>{sub.status}</span>
        </div>

        {actionMsg && <p style={{color:'green', fontWeight:'bold', marginBottom:'20px'}}>{actionMsg}</p>}

        <div style={{marginTop:'30px', display:'flex', gap:'40px'}}>
          <div style={{flex: 2}}>
             <div style={{padding:'20px', border:'1px solid #ddd', borderRadius:'8px'}}>
                <h3 style={{marginTop:0}}>Subscription Details</h3>
                <p><strong>Plan Name:</strong> {sub.plan_name || (sub.plan ? `Plan #${sub.plan}` : 'Individual Items')}</p>
                <p><strong>Start Date:</strong> {formatDate(sub.start_date)}</p>
                <p><strong>Expiration Date:</strong> {formatDate(sub.expiration_date)}</p>
                <p><strong>Payment Terms:</strong> {sub.payment_terms || 'None'}</p>
             </div>

             <div style={{marginTop:'30px'}}>
               <h3>Service Lines</h3>
               <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#f9f9f9', borderBottom:'1px solid #ddd'}}>
                      <th style={{padding:'10px', textAlign:'left'}}>Product</th>
                      <th style={{padding:'10px', textAlign:'center'}}>Qty</th>
                      <th style={{padding:'10px', textAlign:'right'}}>Unit Price</th>
                      <th style={{padding:'10px', textAlign:'right'}}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sub.lines?.map((line: any) => (
                      <tr key={line.id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:'10px'}}>{line.product_name || `Product #${line.product}`}</td>
                        <td style={{padding:'10px', textAlign:'center'}}>{line.quantity}</td>
                        <td style={{padding:'10px', textAlign:'right'}}>{formatINR(line.unit_price)}</td>
                        <td style={{padding:'10px', textAlign:'right'}}>{formatINR(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>

          <div style={{flex: 1}}>
             {sub.status === 'active' && (
               <div style={{padding:'20px', border:'1px solid #ddd', borderRadius:'8px', background:'#f8f9fa'}}>
                  <h3 style={{marginTop:0}}>Quick Actions</h3>
                  <button onClick={() => handleAction('renew')} style={{width:'100%', padding:'10px', background:'#28a745', color:'#fff', border:'none', borderRadius:'4px', marginTop:'10px', cursor:'pointer', fontWeight:'bold'}}>Renew Subscription</button>
                  <button onClick={() => handleAction('pause')} style={{width:'100%', padding:'10px', background:'#ffc107', color:'#212529', border:'none', borderRadius:'4px', marginTop:'10px', cursor:'pointer', fontWeight:'bold'}}>Pause Service</button>
                  <button onClick={() => handleAction('close')} style={{width:'100%', padding:'10px', background:'#dc3545', color:'#fff', border:'none', borderRadius:'4px', marginTop:'10px', cursor:'pointer', fontWeight:'bold'}}>Cancel Subscription</button>
               </div>
             )}

             <div style={{marginTop:'30px', padding:'20px', border:'1px solid #ddd', borderRadius:'8px'}}>
               <h3 style={{marginTop:0}}>Associated Invoices</h3>
               {invoices.length === 0 ? <p>No invoices found.</p> : (
                 <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                   {invoices.map(inv => (
                     <div key={inv.id} style={{padding:'15px', border:'1px solid #eee', borderRadius:'4px'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <strong>{inv.invoice_number}</strong>
                          <span style={{
                            padding:'2px 8px', borderRadius:'10px', fontSize:'0.75em', fontWeight:'bold', textTransform:'uppercase',
                            background: inv.status === 'paid' ? '#d4edda' : '#f8d7da',
                            color: inv.status === 'paid' ? '#155724' : '#721c24'
                          }}>{inv.status}</span>
                        </div>
                        <p style={{fontSize:'0.9em', color:'#666', marginTop:'5px'}}>{formatDate(inv.issue_date)} • {formatINR(inv.total)}</p>
                        <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                           <Link href={`/invoices/${inv.id}`} style={{color:'#0070f3', fontSize:'0.85em', fontWeight:'bold'}}>View Details</Link>
                           {inv.status !== 'paid' && <Link href={`/invoices/${inv.id}?pay=true`} style={{color:'#28a745', fontSize:'0.85em', fontWeight:'bold'}}>Pay Now</Link>}
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SubscriptionDetailPage);
