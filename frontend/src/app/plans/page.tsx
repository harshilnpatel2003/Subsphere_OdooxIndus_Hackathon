'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

const cycleLabel = (c: string) => ({ daily:'Daily', weekly:'Weekly', monthly:'Monthly', yearly:'Yearly' }[c] || c || '—');

// ── Inline Confirm Modal ───────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onCancel}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 380 }}
        onClick={e => e.stopPropagation()}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--on-surface)', marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn btn-primary" style={{ background: 'var(--error)' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit Modal ────────────────────────────────────────────────────
function TemplateModal({ template, plans, terms, onClose, onSaved }: { template?: any; plans: any[]; terms: any[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    description: template?.description || '',
    validity_days: template?.validity_days || 30,
    plan: template?.plan || (plans[0]?.id || ''),
    payment_terms: template?.payment_terms || '',
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

          <div className="form-group">
            <label className="form-label">Initial Payment Terms</label>
            <select className="form-input" value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })}>
              <option value="">— No specific terms —</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name} (Net {t.due_days})</option>)}
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>Automatically apply this payment schedule to new subscriptions.</p>
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

// ── Payment Term Modal ──────────────────────────────────────────────────────
function PaymentTermModal({ term, onClose, onSaved }: { term?: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: term?.name || '',
    due_days: term?.due_days || 0,
    is_first_payment_discount: term?.is_first_payment_discount || false,
    discount_percentage: term?.discount_percentage || '0.00',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (term?.id) {
        await api.patch(`/payment-terms/${term.id}/`, form);
      } else {
        await api.post('/payment-terms/', form);
      }
      onSaved(); onClose();
    } catch (err: any) {
      setError(JSON.stringify(err.response?.data || 'Error saving term'));
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 440 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{term?.id ? 'Edit Payment Term' : 'New Payment Term'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--on-surface-variant)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Term Name *</label>
            <input type="text" className="form-input" required placeholder="e.g. Net 30, Early Bird 10%" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Due Days *</label>
            <input type="number" className="form-input" required min={0} value={form.due_days}
              onChange={e => setForm({ ...form, due_days: Number(e.target.value) })} />
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>Days from order date until invoice becomes due.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-container-low)', padding: '12px 16px', borderRadius: 12 }}>
            <input type="checkbox" checked={form.is_first_payment_discount} 
              onChange={e => setForm({ ...form, is_first_payment_discount: e.target.checked })} />
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Apply First Payment Discount?</label>
          </div>

          {form.is_first_payment_discount && (
            <div className="form-group">
              <label className="form-label">Discount Percentage (%)</label>
              <input type="number" step="0.01" className="form-input" required min={0} max={100} value={form.discount_percentage}
                onChange={e => setForm({ ...form, discount_percentage: e.target.value })} />
            </div>
          )}

          {error && <div style={{ color: 'var(--error)', fontSize: '0.8rem', background: 'var(--error-container)', padding: '10px 12px', borderRadius: 6 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--surface-container)', paddingTop: 16 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : term?.id ? 'Save Changes' : 'Create Term'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Plan Modal ──────────────────────────────────────────────────────────
function PlanModal({ plan, onClose, onSaved }: { plan?: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: plan?.name || '',
    price: plan?.price || '0.00',
    billing_period: plan?.billing_period || 'monthly',
    min_quantity: plan?.min_quantity || 1,
    auto_close: plan?.auto_close || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (plan?.id) {
        await api.patch(`/plans/${plan.id}/`, form);
      } else {
        await api.post('/plans/', form);
      }
      onSaved(); onClose();
    } catch (err: any) {
      setError(JSON.stringify(err.response?.data || 'Error saving plan'));
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 440 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{plan?.id ? 'Edit Default Plan' : 'New Default Plan'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--on-surface-variant)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Plan Name *</label>
            <input type="text" className="form-input" required placeholder="e.g. Premium Monthly" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input type="number" step="0.01" className="form-input" required min={0} value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Billing Cycle *</label>
              <select className="form-input" value={form.billing_period} onChange={e => setForm({ ...form, billing_period: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-container-low)', padding: '12px 16px', borderRadius: 12 }}>
            <input type="checkbox" checked={form.auto_close} 
              onChange={e => setForm({ ...form, auto_close: e.target.checked })} />
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Auto-close after duration?</label>
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '0.8rem', background: 'var(--error-container)', padding: '10px 12px', borderRadius: 6 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--surface-container)', paddingTop: 16 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : plan?.id ? 'Save Changes' : 'Create Plan'}</button>
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
  const [activeTab, setActiveTab] = useState<'templates' | 'terms' | 'plans' | 'quotations'>('templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [editTerm, setEditTerm] = useState<any>(null);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [applyTemplate, setApplyTemplate] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchAll = () => {
    setLoading(true);
    const endpoints = [
      api.get('/quotation-templates/'),
      api.get('/plans/'),
      api.get('/payment-terms/')
    ];
    Promise.all(endpoints).then(([t, p, te]) => {
      setTemplates(Array.isArray(t.data) ? t.data : t.data.results || []);
      setPlans(Array.isArray(p.data) ? p.data : []);
      setTerms(Array.isArray(te.data) ? te.data : te.data.results || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const fetchQuotations = () => {
    Promise.all([
      api.get('/subscriptions/?status=quotation'),
      api.get('/subscriptions/?status=quotation_sent'),
    ]).then(([q, qs]) => {
      const all = [
        ...(Array.isArray(q.data) ? q.data : q.data.results || []),
        ...(Array.isArray(qs.data) ? qs.data : qs.data.results || []),
      ];
      // Sort newest first
      all.sort((a, b) => b.id - a.id);
      setQuotations(all);
    }).catch(() => {});
  };

  useEffect(() => { fetchAll(); fetchQuotations(); }, []);

  const askConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ message, onConfirm });
  };

  const deleteTemplate = async (id: number) => {
    askConfirm('Delete this template? This cannot be undone.', async () => {
      setConfirmModal(null);
      try { await api.delete(`/quotation-templates/${id}/`); fetchAll(); }
      catch { setDeleteError('Failed to delete template. It may be in use.'); }
    });
  };

  const deleteTerm = async (id: number) => {
    askConfirm('Delete this payment term?', async () => {
      setConfirmModal(null);
      try { await api.delete(`/payment-terms/${id}/`); fetchAll(); }
      catch { setDeleteError('Failed to delete term. It may be in use.'); }
    });
  };

  const deletePlan = async (id: number) => {
    askConfirm('Delete this plan and billing structure?', async () => {
      setConfirmModal(null);
      try { await api.delete(`/plans/${id}/`); fetchAll(); }
      catch { setDeleteError('Failed to delete plan. It may be in use.'); }
    });
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
      title="Plans & Structures"
      subtitle="Define how your subscriptions are billed and structured."
      actions={
        activeTab !== 'quotations' ? (
          <button className="btn btn-primary" onClick={() => {
            if (activeTab === 'templates') { setEditTemplate(null); setShowModal(true); }
            else if (activeTab === 'terms') { setEditTerm(null); setShowTermModal(true); }
            else { setEditPlan(null); setShowPlanModal(true); }
          }}>
            <span className="material-icons" style={{ fontSize: 16 }}>add</span>
            {activeTab === 'templates' ? 'New Template' : activeTab === 'terms' ? 'New Term' : 'New Plan'}
          </button>
        ) : undefined
      }
    >
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--surface-container)', marginBottom: 24 }}>
        {[
          { id: 'templates', label: 'Quotation Templates', icon: 'description' },
          { id: 'terms', label: 'Initial Payment Terms', icon: 'payments' },
          { id: 'plans', label: 'Default (Linked) Payment Terms', icon: 'swap_calls' },
          { id: 'quotations', label: 'Sent Quotations', icon: 'send' },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); if (tab.id === 'quotations') fetchQuotations(); }}
            style={{
              padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: -1
            }}>
            <span className="material-icons" style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Delete / operation error */}
      {deleteError && (
        <div style={{ background: 'var(--error-container)', color: 'var(--error)', padding: '10px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          {deleteError}
          <button onClick={() => setDeleteError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>Loading structures…</div>
      )}

      {/* Templates Tab */}
      {!loading && activeTab === 'templates' && (
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
                {(t.plan_name || t.payment_terms_name) && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {t.plan_name && <span>Plan: {t.plan_name} · {cycleLabel(t.plan_billing_period)}</span>}
                    {t.payment_terms_name && <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Term: {t.payment_terms_name}</span>}
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

      {/* Terms Tab */}
      {!loading && activeTab === 'terms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {terms.map((t, i) => (
            <div key={t.id} style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--surface-container-high)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons">receipt_long</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditTerm(t); setShowTermModal(true); }} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>Edit</button>
                  <button onClick={() => deleteTerm(t.id)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: 'var(--error)' }}>Delete</button>
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--on-surface)', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: 20 }}>Net {t.due_days} days due</div>

              <div style={{ marginTop: 'auto', background: 'var(--surface-container)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Structure</span>
                  {t.is_first_payment_discount && <span style={{ fontSize: '0.7rem', background: 'var(--secondary)', color: 'white', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>DISCOUNTED</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>First Payment</span>
                    <span style={{ fontWeight: 700, color: t.is_first_payment_discount ? 'var(--primary)' : 'inherit' }}>
                      {t.is_first_payment_discount ? `-${t.discount_percentage}% Off` : 'Standard Price'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Subsequent</span>
                    <span style={{ fontWeight: 700 }}>Standard Price</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {terms.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
              <span className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>payments</span>
              No payment terms yet. Click <strong>New Term</strong> to create one.
            </div>
          )}
        </div>
      )}

      {/* Plans Tab */}
      {!loading && activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {plans.map((p, i) => (
            <div key={p.id} style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--surface-container-high)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--secondary-container)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons">swap_calls</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditPlan(p); setShowPlanModal(true); }} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>Edit</button>
                  <button onClick={() => deletePlan(p.id)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: 'var(--error)' }}>Delete</button>
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--on-surface)', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: 20 }}>Starts billing cycle for members</div>

              <div style={{ marginTop: 'auto', background: 'var(--surface-container)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Legacy Structure</span>
                  <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>RECURRING</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: '4px 0' }}>
                    <span>${p.price}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, alignSelf: 'flex-end', marginBottom: 3 }}>/ {cycleLabel(p.billing_period)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                    <span>Min Member</span>
                    <span>{p.min_quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
              <span className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>swap_calls</span>
              No plans yet. Click <strong>New Plan</strong> to create one.
            </div>
          )}
        </div>
      )}

      {/* Sent Quotations Tab */}
      {!loading && activeTab === 'quotations' && (
        <div>
          {quotations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
              <span className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>send</span>
              No quotations sent yet. Use <strong>Use This Template</strong> to send one.
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map(q => (
                    <tr key={q.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{q.subscription_number || `SUB-${q.id}`}</td>
                      <td>{q.customer_name || q.customer_email || `Customer #${q.customer}`}</td>
                      <td style={{ color: 'var(--on-surface-variant)' }}>{q.plan_name || '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                          background: q.status === 'quotation_sent' ? 'var(--primary-container)' : 'var(--surface-container)',
                          color: q.status === 'quotation_sent' ? 'var(--primary)' : 'var(--on-surface-variant)'
                        }}>
                          {q.status === 'quotation_sent' ? 'Sent' : 'Draft Quotation'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>{q.start_date || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <a href={`/subscriptions/${q.id}`} className="btn btn-secondary btn-sm">View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <TemplateModal template={editTemplate} plans={plans} terms={terms} onClose={() => setShowModal(false)} onSaved={fetchAll} />
      )}
      {showTermModal && (
        <PaymentTermModal term={editTerm} onClose={() => setShowTermModal(false)} onSaved={fetchAll} />
      )}
      {showPlanModal && (
        <PlanModal plan={editPlan} onClose={() => setShowPlanModal(false)} onSaved={fetchAll} />
      )}
      {applyTemplate && (
        <ApplyModal template={applyTemplate} onClose={() => setApplyTemplate(null)} />
      )}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default withAuth(PlansPage);
