'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { formatINR } from '@/lib/formatters';
import { openRazorpayCheckout } from '@/lib/razorpay';
import withAuth from '@/components/withAuth';

function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [invoiceId]);

  const fetchData = async () => {
    if (!invoiceId) return;
    setLoading(true);
    try {
      const [iRes, pRes] = await Promise.all([
        api.get(`/invoices/${invoiceId}/`),
        api.get(`/payments/?invoice=${invoiceId}`)
      ]);
      setInvoice(iRes.data);
      setPayments(pRes.data);
    } catch (err) {
      console.error(err);
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (actionPath: string) => {
    if (!invoice || processing) return;
    setProcessing(true);
    try {
      await api.post(`/invoices/${invoice.id}/${actionPath}/`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || `Error processing ${actionPath}`);
    } finally {
      setProcessing(false);
    }
  };

  const fetchPdf = async () => {
    try {
      const resp = await api.get(`/invoices/${invoiceId}/pdf/`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([resp.data], { type: 'text/html' }));
      window.open(url, '_blank');
    } catch (err) {
      alert('Failed to load invoice PDF');
    }
  };

  const handlePay = async () => {
    if (!invoice || processing) return;
    setProcessing(true);
    await openRazorpayCheckout(
        invoice.id,
        () => {
            setProcessing(false);
            fetchData();
        },
        () => setProcessing(false)
    );
  };

  if (loading) return <DashboardLayout title="Invoice Detail"><div style={{padding:40, color:'var(--on-surface-variant)'}}>Loading invoice...</div></DashboardLayout>;
  if (!invoice) return null;

  const statusColor = (s: string) => {
    if (s === 'paid') return 'var(--primary-container)';
    if (s === 'draft') return 'var(--surface-container-high)';
    if (s === 'cancelled') return 'var(--error-container)';
    return 'var(--secondary-container)';
  };
  const statusOnColor = (s: string) => {
    if (s === 'paid') return 'var(--on-primary-container)';
    if (s === 'draft') return 'var(--on-surface)';
    if (s === 'cancelled') return 'var(--on-error-container)';
    return 'var(--on-secondary-container)';
  };

  return (
    <DashboardLayout
      title={`Invoice ${invoice.invoice_number}`}
      subtitle={`Billing detail for customer: ${invoice.customer_email || invoice.customer_name || `CUST-${invoice.customer}`}`}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {invoice.subscription && (
            <Link href={`/subscriptions/${invoice.subscription}`} className="btn btn-secondary">
              <span className="material-icons" style={{ fontSize: 16 }}>assignment</span>
              Subscription
            </Link>
          )}

          {invoice.status === 'draft' && (
             <>
               <button className="btn btn-primary" disabled={processing} onClick={() => executeAction('confirm')}>Confirm Invoice</button>
               <button className="btn btn-secondary" disabled={processing} onClick={() => executeAction('cancel')}>Cancel</button>
             </>
          )}

          {invoice.status === 'cancelled' && (
             <button className="btn btn-primary" disabled={processing} onClick={() => executeAction('reset_to_draft')}>Reset to Draft</button>
          )}

          {(invoice.status === 'confirmed' || invoice.status === 'paid') && (
            <>
              {invoice.status === 'confirmed' && (
                <button className="btn btn-primary" disabled={processing} onClick={handlePay}>
                  <span className="material-icons" style={{ fontSize: 16 }}>payment</span> Pay Now
                </button>
              )}
              <button className="btn btn-secondary" onClick={fetchPdf}>
                <span className="material-icons" style={{ fontSize: 16 }}>preview</span> Preview / Print
              </button>
              <button className="btn btn-secondary" onClick={() => alert('Sending email logic not connected yet.')}>
                <span className="material-icons" style={{ fontSize: 16 }}>send</span> Send
              </button>
            </>
          )}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        
        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Status Bar */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--surface-container-lowest)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                 <div style={{
                     padding: '6px 12px', borderRadius: 'var(--radius-full)',
                     fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                     background: statusColor(invoice.status), color: statusOnColor(invoice.status)
                 }}>
                     {invoice.status}
                 </div>
                 <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                    Total: <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{formatINR(invoice.total)}</span>
                 </div>
             </div>
             <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                 Created on {invoice.issue_date}
             </div>
          </div>

          <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Invoice Lines</h2>
              <table className="data-table">
                  <thead>
                      <tr>
                          <th>Description</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Unit Price</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      {invoice.lines?.map((l: any) => (
                          <tr key={l.id}>
                              <td>{l.description}</td>
                              <td style={{ textAlign: 'center' }}>{l.quantity}</td>
                              <td style={{ textAlign: 'right', color: 'var(--on-surface-variant)' }}>{formatINR(l.unit_price)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(l.amount)}</td>
                          </tr>
                      ))}
                      {(!invoice.lines || invoice.lines.length === 0) && (
                          <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>No lines found.</td></tr>
                      )}
                  </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Subtotal</span>
                          <span>{formatINR(invoice.subtotal)}</span>
                      </div>
                      {parseFloat(invoice.discount_amount) > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--primary)' }}>
                              <span>Discount Applied</span>
                              <span>-{formatINR(invoice.discount_amount)}</span>
                          </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Taxes</span>
                          <span>{formatINR(invoice.tax_amount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 700, borderTop: '1px solid var(--surface-container)', paddingTop: 12, marginTop: 4 }}>
                          <span>Total</span>
                          <span>{formatINR(invoice.total)}</span>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card">
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Financial Meta</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Due Date</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{invoice.due_date || 'Due on Receipt'}</div>
                    </div>
                </div>
            </div>

            {payments.length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Payment History</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {payments.map((p, i) => (
                            <div key={i} style={{ paddingBottom: 12, borderBottom: i < payments.length - 1 ? '1px solid var(--surface-container)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>{p.method}</span>
                                    <span style={{ color: p.status === 'captured' ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{p.status}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                                    <span>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</span>
                                    <span>{formatINR(p.amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(InvoiceDetailPage);
