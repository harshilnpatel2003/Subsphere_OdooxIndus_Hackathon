'use client';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    api.get('/invoices/').then(res => setInvoices(res.data)).catch(console.error);
  };

  const payInvoice = async (id: number) => {
    try {
        const res = await api.post(`/payments/create-order/`, { invoice_id: id });
        alert(`Razorpay Order created: ${res.data.razorpay_order_id}. Simulating payment success...`);
        await api.post(`/payments/verify/`, { invoice_id: id, razorpay_signature: 'dummy' });
        alert('Payment dummy verification successful! Invoice and Sub marked active.');
        fetchInvoices();
    } catch(err: any) {
        alert(err.response?.data?.error || 'Failed to pay invoice');
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Navbar />
      <h1>Invoices & Payments</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Invoice Num</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Status</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Total Amount</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{inv.invoice_number}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px', fontWeight: 'bold' }}>{inv.status.toUpperCase()}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>INR {inv.total}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {inv.status !== 'paid' && (
                  <button onClick={() => payInvoice(inv.id)} style={{ padding: '6px 12px', cursor: 'pointer', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px' }}>Pay with Razorpay</button>
                )}
                <a href={`http://localhost:8080/api/invoices/${inv.id}/pdf/`} target="_blank" style={{ textDecoration: 'underline', color: 'blue' }}>View HTML Invoice</a>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No invoices found. Generate them by confirming a Subscription.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default withAuth(InvoicesPage);
