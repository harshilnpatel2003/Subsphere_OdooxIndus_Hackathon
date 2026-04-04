'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

// ── Edit Modal ────────────────────────────────────────────────────────────
function SubscriptionEditModal({ sub, onClose, onSaved }: { sub: any; onClose: () => void; onSaved: () => void }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [form, setForm] = useState({
    plan: sub.plan || '',
    payment_terms: sub.payment_terms || '',
    notes: sub.notes || '',
    lines: (sub.lines || []).map((l: any) => ({ product: l.product, product_name: l.product_name, quantity: l.quantity, unit_price: l.unit_price, tax: l.tax })),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/plans/'), api.get('/payment-terms/')]).then(([p, t]) => {
      setPlans(Array.isArray(p.data) ? p.data : p.data.results || []);
      setTerms(Array.isArray(t.data) ? t.data : t.data.results || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.patch(`/subscriptions/${sub.id}/`, form);
      onSaved(); onClose();
    } catch (err: any) {
      setError(JSON.stringify(err.response?.data || 'Error saving'));
    }
    setLoading(false);
  };

  const updateLineQty = (index: number, qty: number) => {
    const newLines = [...form.lines];
    newLines[index].quantity = qty;
    setForm({ ...form, lines: newLines });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Edit Details</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Billing Plan</label>
            <select className="form-input" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Terms</label>
            <select className="form-input" value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })}>
              <option value="">— None —</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Instructions</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div>
            <label className="form-label">Quantities</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.lines.map((l: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.85rem' }}>{l.product_name}</span>
                  <input type="number" className="form-input" style={{ width: 80, padding: '4px 8px' }} min={1} value={l.quantity} onChange={e => updateLineQty(i, Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ color: 'var(--error)', background: 'var(--error-container)', padding: 12, borderRadius: 8, fontSize: '0.85rem' }}>{error}</div>}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update Subscription'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/subscriptions/${id}/`);
      setSub(res.data);
    } catch (err) {
      console.error(err);
      router.push('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (actionPath: string) => {
    if (processing) return;
    setProcessing(true);
    try {
      const res = await api.post(`/subscriptions/${id}/${actionPath}/`);
      if (actionPath === 'create_invoice' && res.data.invoice_id) {
        router.push(`/invoices/${res.data.invoice_id}`);
      } else if (actionPath === 'upsell' && res.data.subscription_id) {
        router.push(`/subscriptions/${res.data.subscription_id}`);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || `Error during ${actionPath}`);
    } finally {
      setProcessing(false);
    }
  };

  const statusClass = (s: string) => {
    if (s === 'active') return 'badge-active';
    if (s === 'draft') return 'badge-draft';
    if (s === 'quotation') return 'badge-pending';
    if (s === 'quotation_sent') return 'badge-pending';
    if (s === 'closed' || s === 'cancelled') return 'badge-closed';
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
          {/* Draft/Quotation Phase Actions */}
          {(sub.status === 'draft' || sub.status === 'quotation') && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" disabled={processing} onClick={() => setShowEdit(true)}>
                <span className="material-icons" style={{ fontSize: 16 }}>edit</span> Edit
              </button>
              {sub.status === 'quotation' && (
                <button className="btn btn-primary" disabled={processing} onClick={() => executeAction('send_quotation')}>
                  <span className="material-icons" style={{ fontSize: 16 }}>send</span> Send Quotation
                </button>
              )}
            </div>
          )}

          {(sub.status === 'draft' || sub.status === 'quotation' || sub.status === 'quotation_sent') && (
            <button className="btn btn-primary" disabled={processing} onClick={() => executeAction('confirm')}>
              <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span> Confirm Order
            </button>
          )}

          {/* Active Phase Actions */}
          {(sub.status === 'active' || sub.status === 'confirmed') && (
            <>
              <button className="btn btn-primary" disabled={processing} onClick={() => executeAction('create_invoice')}>
                <span className="material-icons" style={{ fontSize: 16 }}>receipt</span> Create Invoice
              </button>
              <button className="btn btn-secondary" disabled={processing} onClick={() => executeAction('upsell')}>
                <span className="material-icons" style={{ fontSize: 16 }}>arrow_upward</span> Upsell / Upgrade
              </button>
              <button className="btn btn-secondary" disabled={processing} onClick={() => executeAction('renew')}>
                <span className="material-icons" style={{ fontSize: 16 }}>autorenew</span> Renew
              </button>
            </>
          )}

          {/* Destructive Actions */}
          {sub.status !== 'cancelled' && sub.status !== 'closed' && (
             <button className="btn btn-secondary" style={{ color: 'var(--error)' }} disabled={processing} onClick={() => executeAction('cancel')}>
               <span className="material-icons" style={{ fontSize: 16 }}>cancel</span> Cancel Subscription
             </button>
          )}

          <Link href="/subscriptions" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span> Back to List
          </Link>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status Banner */}
          <div className="card" style={{
            borderLeft: `4px solid ${sub.status === 'active' ? 'var(--on-tertiary-container)' : sub.status === 'draft' ? 'var(--outline)' : sub.status === 'error' || sub.status === 'cancelled' ? 'var(--error)' : 'var(--warning)'}`,
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
              <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: 2 }}>Order ID</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'monospace' }}>
                {sub.subscription_number || `SUB-${sub.id}`}
              </div>
            </div>
          </div>

          {/* Detailed Info */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 700, marginBottom: 8 }}>Customer</div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{sub.customer_name || `ID: ${sub.customer}`}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 700, marginBottom: 8 }}>Linked Plan</div>
              <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{sub.plan_name || 'Standard'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 700, marginBottom: 8 }}>Payment Terms</div>
              <div style={{ fontWeight: 600 }}>{sub.payment_terms_name || '—'}</div>
            </div>
            {sub.notes && (
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 700, marginBottom: 8 }}>Internal Notes</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--on-surface)', background: 'var(--surface-container-low)', padding: 12, borderRadius: 8 }}>{sub.notes}</div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Order Items</h2>
            {sub.lines && sub.lines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sub.lines.map((line: any, index: number) => (
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
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Service Health</div>
            {[
              { label: 'Status', value: sub.status === 'active' ? 'Operational' : sub.status, color: sub.status === 'active' ? 'var(--on-tertiary-container)' : 'var(--on-surface-variant)' },
              { label: 'Expiration', value: sub.expiration_date || 'None', color: 'var(--on-surface)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--surface-container)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{label}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="card">
             <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Related Invoices</h2>
             {/* If invoices are serialized inside subscription get request, we could show them here. But for now we use a generic link since API payload doesn't return invoices perfectly nested yet in this specific route without custom serializer injection. */}
             <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                 Invoices generated against this order are tracked in your ledger dynamically. You can review them in the main ledger dashboard.
             </div>
             <Link href={`/invoices?subscription=${sub.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none' }}>
                 View Financial Ledger
             </Link>
          </div>
        </div>
      </div>

      {showEdit && (
        <SubscriptionEditModal sub={sub} onClose={() => setShowEdit(false)} onSaved={fetchData} />
      )}
    </DashboardLayout>
  );
}

export default withAuth(SubscriptionDetailPage);
