'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { openRazorpayCheckout } from '@/lib/razorpay';

function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = () => {
    setLoading(true);
    api.get('/invoices/')
      .then(res => setInvoices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const payInvoice = async (id: number) => {
    setPaying(id);
    await openRazorpayCheckout(
      id,
      () => {
        fetchInvoices();
        setPaying(null);
      },
      () => setPaying(null)
    );
  };

  const statusClass = (s: string) => {
    if (s === 'paid') return 'badge-paid';
    if (s === 'pending' || s === 'issued') return 'badge-pending';
    if (s === 'overdue') return 'badge-error';
    return 'badge-draft';
  };

  const totalDue = invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + parseFloat(i.total || 0), 0);

  return (
    <DashboardLayout
      title="Invoices & Payments"
      subtitle="Manage outstanding invoices and process payments via Razorpay."
      actions={
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 16px', background: 'var(--tertiary-container)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span className="material-icons" style={{ fontSize: 16, color: 'var(--on-tertiary-container)' }}>receipt_long</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-tertiary-container)' }}>
            {totalDue > 0 ? `INR ${totalDue.toFixed(2)} outstanding` : 'All paid'}
          </span>
        </div>
      }
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Invoices', value: invoices.length, icon: 'receipt_long' },
          { label: 'Pending Payment', value: invoices.filter(i => i.status !== 'paid').length, icon: 'pending' },
          { label: 'Paid', value: invoices.filter(i => i.status === 'paid').length, icon: 'check_circle' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="stat-card__label">{label}</span>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary-container)', opacity: 0.7 }}>{icon}</span>
            </div>
            <div className="stat-card__value">{value}</div>
          </div>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading invoices…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Subscription</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Issue Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'monospace' }}>{inv.invoice_number}</div>
                  </td>
                  <td>
                    {inv.subscription ? (
                        <Link href={`/subscriptions/${inv.subscription}`} style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            {inv.subscription_number || `SUB-${inv.subscription}`}
                        </Link>
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{inv.plan_name || 'Standard'}</td>
                  <td><span className={`badge ${statusClass(inv.status)}`}>{inv.status.toUpperCase()}</span></td>
                  <td style={{ color: 'var(--on-surface-variant)' }}>{inv.issue_date || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                    INR {parseFloat(inv.total || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={async () => {
                          try {
                            const resp = await api.get(`/invoices/${inv.id}/pdf/`, { responseType: 'blob' });
                            const url = URL.createObjectURL(new Blob([resp.data], { type: 'text/html' }));
                            window.open(url, '_blank');
                          } catch (err) {
                            alert('Failed to load PDF');
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <span className="material-icons" style={{ fontSize: 14 }}>open_in_new</span>
                        PDF
                      </button>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => payInvoice(inv.id)}
                          disabled={paying === inv.id}
                          className="btn btn-primary btn-sm"
                        >
                          {paying === inv.id ? 'Processing…' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-variant)' }}>
                    No invoices found. Confirm a subscription to generate invoices.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Security Note */}
      <div style={{
        marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', background: 'var(--surface-container-low)',
        borderRadius: 'var(--radius-md)',
      }}>
        <span className="material-icons" style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>lock</span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Payments secured by Razorpay</span>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(InvoicesPage);
