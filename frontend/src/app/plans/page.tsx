'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

const cycleLabel = (c: string) => ({ daily:'Daily', weekly:'Weekly', monthly:'Monthly', yearly:'Yearly' }[c] || c || '—');

// ── Create / Edit Modal ────────────────────────────────────────────────────
function TemplateModal({ template, plans, onClose, onSaved }: { template?: any; plans: any[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    description: template?.description || '',
    validity_days: template?.validity_days || 30,
    plan: template?.plan || (plans[0]?.id || ''),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (template?.id) {
        await api.patch(`/quotation-templates/${template.id}/`, form);
      } else {
        await api.post('/quotation-templates/', form);
      }
      onSaved(); onClose();
    } catch (err: any) {
      setError(JSON.stringify(err.response?.data || 'Error saving template'));
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{template?.id ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--on-surface-variant)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Template Name *</label>
            <input type="text" className="form-input" required placeholder="e.g. Standard Enterprise Plan" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Validity / Duration (days) *</label>
            <input type="number" className="form-input" required min={1} value={form.validity_days}
              onChange={e => setForm({ ...form, validity_days: Number(e.target.value) })} />
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>How long this quotation is valid for once sent to a customer.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Customer facing)</label>
            <textarea className="form-input" rows={2} placeholder="e.g. Save 25% with this plan" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Linked Plan (Billing Structure)</label>
            <select className="form-input" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
              <option value="">— No plan linked —</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({cycleLabel(p.billing_period)})</option>)}
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>Defines billing cycle. Products and pricing are set when applying to a customer.</p>
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '0.8rem', background: 'var(--error-container)', padding: '10px 12px', borderRadius: 6 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--surface-container)', paddingTop: 16 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : template?.id ? 'Save Changes' : 'Create Template'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Apply Modal ────────────────────────────────────────────────────────────
function ApplyModal({ template, onClose }: { template: any; onClose: () => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    api.get('/users/').then(r => setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []));
  }, []);

  const handleApply = async () => {
    if (!customerId) return alert('Select a customer');
    setLoading(true);
    try {
      const res = await api.post(`/quotation-templates/${template.id}/apply/`, { customer_id: Number(customerId) });
      setResult({ success: true, msg: `✓ Quotation ${res.data.subscription_number} created successfully!` });
    } catch (err: any) {
      setResult({ success: false, msg: 'Error: ' + JSON.stringify(err.response?.data || 'Failed') });
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 440 }}
        onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: 'var(--on-surface)' }}>Apply Template</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 20 }}>
          Create a quotation from <strong>{template.name}</strong>
          {template.plan_name && <> (Plan: {template.plan_name})</>}
        </p>

        {result ? (
          <>
            <div style={{ padding: '14px 16px', background: result.success ? '#d1fae5' : '#fee2e2', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem', color: result.success ? '#065f46' : '#991b1b' }}>
              {result.msg}
            </div>
            <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%' }}>Close</button>
          </>
        ) : (
          <>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Select Customer *</label>
              <select className="form-input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">— Choose customer —</option>
                {customers.filter(c => c.role !== 'admin').map(c => (
                  <option key={c.id} value={c.id}>{c.email}{c.first_name ? ` (${c.first_name} ${c.last_name})` : ''}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn btn-secondary">Cancel</button>
              <button onClick={handleApply} className="btn btn-primary" disabled={loading || !customerId}>
                {loading ? 'Creating...' : 'Create Quotation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
function PlansPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [applyTemplate, setApplyTemplate] = useState<any>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get('/quotation-templates/'), api.get('/plans/')]).then(([t, p]) => {
      setTemplates(Array.isArray(t.data) ? t.data : t.data.results || []);
      setPlans(Array.isArray(p.data) ? p.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const deleteTemplate = async (id: number) => {
    if (!window.confirm('Delete this template?')) return;
    try { await api.delete(`/quotation-templates/${id}/`); fetchAll(); }
    catch { alert('Failed to delete.'); }
  };

  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
  ];

  return (
    <DashboardLayout
      title="Quotation Templates"
      subtitle="Pre-built structures to quickly create standardized quotations for customers."
      actions={
        <button className="btn btn-primary" onClick={() => { setEditTemplate(null); setShowModal(true); }}>
          <span className="material-icons" style={{ fontSize: 16 }}>add</span>
          New Template
        </button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>Loading templates…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {templates.map((t, i) => (
            <div key={t.id} style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '20px 24px', background: gradients[i % gradients.length] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {t.validity_days} day validity
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditTemplate(t); setShowModal(true); }}
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 4, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => deleteTemplate(t.id)}
                      style={{ background: 'rgba(255,0,0,0.3)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 4, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{t.name}</div>
                {t.plan_name && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                    Plan: {t.plan_name} · {cycleLabel(t.plan_billing_period)}
                  </div>
                )}
                {t.description && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: 8, fontStyle: 'italic', background: 'rgba(0,0,0,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                    "{t.description}"
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: '18px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Products in template */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Products</div>
                  {t.lines?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {t.lines.map((line: any) => (
                        <div key={line.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--on-surface)' }}>{line.product_name}</span>
                          <span style={{ color: 'var(--on-surface-variant)' }}>×{line.quantity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>No products pre-defined — add on apply</span>
                  )}
                </div>

                <button className="btn btn-primary" style={{ marginTop: 'auto', justifyContent: 'center', width: '100%' }}
                  onClick={() => setApplyTemplate(t)}>
                  <span className="material-icons" style={{ fontSize: 15 }}>send</span>
                  Use This Template
                </button>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
              <span className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>description</span>
              No templates yet. Click <strong>New Template</strong> to create one.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <TemplateModal template={editTemplate} plans={plans} onClose={() => setShowModal(false)} onSaved={fetchAll} />
      )}
      {applyTemplate && (
        <ApplyModal template={applyTemplate} onClose={() => setApplyTemplate(null)} />
      )}
    </DashboardLayout>
  );
}

export default withAuth(PlansPage);
