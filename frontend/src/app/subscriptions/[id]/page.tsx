'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/subscriptions/${id}/`)
      .then(res => setSub(res.data))
      .catch(err => {
        console.error(err);
        router.push('/subscriptions');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    try {
      await api.post(`/subscriptions/${id}/confirm/`);
      api.get(`/subscriptions/${id}/`).then(res => setSub(res.data));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error confirming subscription');
    }
  };

  const statusClass = (s: string) => {
    if (s === 'active') return 'badge-active';
    if (s === 'draft') return 'badge-draft';
    if (s === 'quotation') return 'badge-pending';
    if (s === 'closed') return 'badge-closed';
    return 'badge-confirmed';
  };

  if (loading) {
    return (
      <DashboardLayout title="Subscription Detail">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--on-surface-variant)' }}>Loading…</div>
      </DashboardLayout>
    );
  }

  if (!sub) return null;

  return (
    <DashboardLayout
      title={sub.subscription_number || `SUB-${id}`}
      subtitle={`Next billing date: ${sub.end_date || '—'}`}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {(sub.status === 'draft' || sub.status === 'quotation') && (
            <button className="btn btn-primary" onClick={handleConfirm}>
              <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>
              Confirm Subscription
            </button>
          )}
          <Link href="/subscriptions" className="btn btn-secondary">
            <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
            Back to List
          </Link>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Status Banner */}
          <div className="card" style={{
            borderLeft: `4px solid ${sub.status === 'active' ? 'var(--on-tertiary-container)' : sub.status === 'draft' ? 'var(--outline)' : 'var(--warning)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Current Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`badge ${statusClass(sub.status)}`}>{sub.status.toUpperCase()}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                  Started: {sub.start_date || '—'}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: 2 }}>Subscription ID</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'monospace' }}>
                {sub.subscription_number || `SUB-${sub.id}`}
              </div>
            </div>
          </div>

          {/* Subscription Items */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Subscription Items</h2>
            {sub.order_lines && sub.order_lines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sub.order_lines.map((line: any, index: number) => (
                  <div key={index} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid var(--surface-container)',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--on-surface)' }}>{line.product_name || `Product #${line.product}`}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Qty: {line.quantity}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>INR {line.unit_price}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>per unit</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                No line items found.
              </div>
            )}
          </div>

          {/* Subscription Logs */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Subscription Logs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {sub.invoices && sub.invoices.length > 0 ? sub.invoices.map((inv: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, padding: '12px 0',
                  borderBottom: '1px solid var(--surface-container)',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 6,
                    background: 'var(--on-tertiary-container)', flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--on-surface)' }}>
                      Invoice Generated: {inv.invoice_number}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                      {inv.issue_date} · INR {inv.total}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', padding: '8px 0' }}>
                  No activity logs yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Customer Card */}
          <div className="card">
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Customer</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>{sub.customer_name || '—'}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: 2 }}>{sub.customer_email || '—'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: 8, fontFamily: 'monospace' }}>
              ID: CUST-{String(sub.customer || sub.id).padStart(4, '0')}
            </div>
          </div>

          {/* Service Health */}
          <div className="card">
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Service Health</div>
            {[
              { label: 'Status', value: sub.status === 'active' ? 'Operational' : 'Inactive', color: sub.status === 'active' ? 'var(--on-tertiary-container)' : 'var(--on-surface-variant)' },
              { label: 'Plan', value: sub.plan_name || '—', color: 'var(--on-surface)' },
              { label: 'Billing Period', value: sub.billing_period || '—', color: 'var(--on-surface)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--surface-container)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{label}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(SubscriptionDetailPage);
