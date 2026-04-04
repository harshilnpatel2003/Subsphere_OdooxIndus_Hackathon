'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatDate, formatINR } from '@/lib/formatters';
import { openRazorpayCheckout } from '@/lib/razorpay';
import withAuth from '@/components/withAuth';
import Link from 'next/link';

function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const searchParams = useSearchParams();
  const autoPay = searchParams.get('pay');
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchData = async () => {
    if (!invoiceId) return;
    try {
      const [iRes, pRes] = await Promise.all([
        api.get(`/invoices/${invoiceId}/`),
        api.get(`/payments/?invoice=${invoiceId}`)
      ]);
      setInvoice(iRes.data);
      setPayments(pRes.data);
      setLoading(false);
      return iRes.data;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData().then((inv) => {
        if (autoPay === 'true' && inv && inv.status !== 'paid') {
            handlePay();
        }
    });
  }, [invoiceId]);

  const handlePay = async () => {
    if (!invoice || paying) return;
    setPaying(true);
    await openRazorpayCheckout(
        invoice.id,
        () => {
            setPaying(false);
            fetchData();
        },
        () => setPaying(false)
    );
  };

  if (loading) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;
  if (!invoice) return <div><PortalNav /><div style={{padding:'20px'}}>Invoice not found.</div></div>;

  return (
    <div>
      <PortalNav />
      <div style={{padding:'20px', maxWidth:'800px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <Link href="/orders" style={{color:'#0070f3'}}>← Back to Orders</Link>
            <h1 style={{marginTop:'10px'}}>Invoice {invoice.invoice_number}</h1>
          </div>
          <div style={{textAlign:'right'}}>
             <span style={{
                padding:'10px 20px', borderRadius:'25px', fontSize:'1em', fontWeight:'bold', textTransform:'uppercase',
                background: invoice.status === 'paid' ? '#d4edda' : '#f8d7da',
                color: invoice.status === 'paid' ? '#155724' : '#721c24'
              }}>{invoice.status}</span>
             <p style={{marginTop:'10px'}}><button onClick={() => window.print()} style={{padding:'8px 15px', background:'#eee', border:'1px solid #ddd', cursor:'pointer'}}>Print Invoice</button></p>
          </div>
        </div>

        <div style={{marginTop:'30px', display:'flex', gap:'40px'}}>
           <div style={{flex: 1}}>
              <p><strong>Issue Date:</strong> {formatDate(invoice.issue_date)}</p>
              <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
           </div>
           <div style={{flex: 1, textAlign:'right'}}>
              <h3>Bill To:</h3>
              <p>{invoice.customer_name || 'Customer'}</p>
              <p>{invoice.customer_email || invoice.customer}</p>
           </div>
        </div>

        <div style={{marginTop:'30px'}}>
           <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f9f9f9', borderBottom:'1px solid #ddd'}}>
                  <th style={{padding:'12px', textAlign:'left'}}>Description</th>
                  <th style={{padding:'12px', textAlign:'center'}}>Qty</th>
                  <th style={{padding:'12px', textAlign:'right'}}>Unit Price</th>
                  <th style={{padding:'12px', textAlign:'right'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines?.map((line: any) => (
                  <tr key={line.id} style={{borderBottom:'1px solid #eee'}}>
                    <td style={{padding:'12px'}}>{line.description}</td>
                    <td style={{padding:'12px', textAlign:'center'}}>{line.quantity}</td>
                    <td style={{padding:'12px', textAlign:'right'}}>{formatINR(line.unit_price)}</td>
                    <td style={{padding:'12px', textAlign:'right'}}>{formatINR(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>

        <div style={{marginTop:'30px', display:'flex', justifyContent:'flex-end'}}>
           <div style={{width:'300px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                 <span>Subtotal:</span>
                 <span>{formatINR(invoice.subtotal)}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                 <span>Tax:</span>
                 <span>{formatINR(invoice.tax_amount)}</span>
              </div>
              {parseFloat(invoice.discount_amount) > 0 && (
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', color:'green'}}>
                   <span>Discount:</span>
                   <span>-{formatINR(invoice.discount_amount)}</span>
                </div>
              )}
              <hr />
              <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px', fontWeight:'bold', fontSize:'1.4em'}}>
                 <span>Total:</span>
                 <span>{formatINR(invoice.total)}</span>
              </div>
              
              {invoice.status !== 'paid' && (
                <button 
                    onClick={handlePay}
                    disabled={paying}
                    style={{
                        width:'100%', 
                        padding:'15px', 
                        background:'#28a745', 
                        color:'#fff', 
                        border:'none', 
                        borderRadius:'4px', 
                        marginTop:'30px', 
                        cursor:'pointer',
                        fontWeight:'bold',
                        fontSize:'1.1em'
                    }}
                >
                  {paying ? 'Processing...' : `Pay ${formatINR(invoice.total)} Now`}
                </button>
              )}
           </div>
        </div>

        {payments.length > 0 && (
          <div style={{marginTop:'50px', paddingTop:'20px', borderTop:'2px solid #eee'}}>
             <h3>Payment History</h3>
             <table style={{width:'100%', borderCollapse:'collapse', marginTop:'10px'}}>
                <thead>
                   <tr style={{fontSize:'0.9em', color:'#666', borderBottom:'1px solid #ddd'}}>
                      <th style={{padding:'10px', textAlign:'left'}}>Payment ID</th>
                      <th style={{padding:'10px', textAlign:'left'}}>Method</th>
                      <th style={{padding:'10px', textAlign:'right'}}>Amount</th>
                      <th style={{padding:'10px', textAlign:'left'}}>Date</th>
                      <th style={{padding:'10px', textAlign:'center'}}>Status</th>
                   </tr>
                </thead>
                <tbody>
                   {payments.map(p => (
                     <tr key={p.id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:'10px'}}>{p.razorpay_payment_id || p.id}</td>
                        <td style={{padding:'10px'}}>{p.method}</td>
                        <td style={{padding:'10px', textAlign:'right'}}>{formatINR(p.amount)}</td>
                        <td style={{padding:'10px'}}>{formatDate(p.paid_at)}</td>
                        <td style={{padding:'10px', textAlign:'center'}}>
                           <span style={{color:'green', fontSize:'0.8em', fontWeight:'bold'}}>{p.status.toUpperCase()}</span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(InvoiceDetailPage);
