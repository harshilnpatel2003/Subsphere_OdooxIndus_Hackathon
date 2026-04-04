'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function NewSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customer: '',
    plan: '',
    payment_terms: '',
    status: 'draft',
    expiration_date: '',
  });

  const [lines, setLines] = useState<any[]>([{ product: '', quantity: 1, unit_price: 0 }]);

  useEffect(() => {
    Promise.all([
      api.get('/users/').then(res => setCustomers(res.data)).catch(() => {}),
      api.get('/plans/').then(res => setPlans(res.data)).catch(() => {}),
      api.get('/payment-terms/').then(res => setPaymentTerms(res.data)).catch(() => {}),
      api.get('/products/').then(res => setProducts(res.data)).catch(() => {})
    ]).finally(() => setFetching(false));
  }, []);

  const handleProductChange = (index: number, val: string) => {
    const p = products.find(prod => prod.id.toString() === val);
    const newLines = [...lines];
    newLines[index].product = val;
    if (p) newLines[index].unit_price = p.sales_price || 0;
    setLines(newLines);
  };

  const handleAddLine = () => setLines([...lines, { product: '', quantity: 1, unit_price: 0 }]);
  const handleRemoveLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      customer: formData.customer,
      plan: formData.plan || null,
      payment_terms: formData.payment_terms || null,
      expiration_date: formData.expiration_date || null,
      status: formData.status, // draft or quotation
      lines: lines.filter(l => l.product).map(l => ({
        product: l.product,
        quantity: typeof l.quantity === 'string' ? parseInt(l.quantity, 10) : l.quantity,
        unit_price: typeof l.unit_price === 'string' ? parseFloat(l.unit_price) : l.unit_price,
      }))
    };

    try {
      const res = await api.post('/subscriptions/', payload);
      router.push(`/subscriptions/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create subscription');
      setLoading(false);
    }
  };

  if (fetching) return <DashboardLayout title="New Subscription"><div style={{ padding: 40 }}>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout
      title="Create New Subscription"
      subtitle="Build a subscription agreement or formal quotation for a customer."
      actions={
        <Link href="/subscriptions" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          Cancel
        </Link>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Primary Details */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Agreement Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select className="form-input" required value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}>
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Plan (Optional)</label>
                  <select className="form-input" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                    <option value="">No Plan (One-off)</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.billing_cycle})</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Order Lines</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lines.map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flex: 2 }}>
                      <select className="form-input" required value={line.product} onChange={e => handleProductChange(idx, e.target.value)}>
                        <option value="">Select product/service...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div style={{ width: 100 }}>
                      <input type="number" min="1" className="form-input" required value={line.quantity} onChange={e => {
                        const newLines = [...lines]; newLines[idx].quantity = e.target.value; setLines(newLines);
                      }} />
                    </div>
                    <div style={{ width: 120 }}>
                      <input type="number" step="0.01" className="form-input" required value={line.unit_price} onChange={e => {
                        const newLines = [...lines]; newLines[idx].unit_price = e.target.value; setLines(newLines);
                      }} />
                    </div>
                    <button type="button" onClick={() => handleRemoveLine(idx)} className="btn btn-secondary" style={{ padding: '0 12px', height: 42 }}>
                      <span className="material-icons" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAddLine} className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
                + Add Line
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Terms & State</h2>
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <select className="form-input" value={formData.payment_terms} onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}>
                  <option value="">Immediate / Generic</option>
                  {paymentTerms.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>Defines due dates and standard discounts on initial invoices.</div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Initial State</label>
                <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="draft">Draft Order</option>
                  <option value="quotation">Formal Quotation</option>
                </select>
              </div>

              {formData.status === 'quotation' && (
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Expiration Date</label>
                  <input type="date" className="form-input" value={formData.expiration_date} onChange={e => setFormData({ ...formData, expiration_date: e.target.value })} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--surface-container)', paddingTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : formData.status === 'quotation' ? 'Generate Quotation' : 'Create Draft Sub'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}

export default withAuth(NewSubscriptionPage);
