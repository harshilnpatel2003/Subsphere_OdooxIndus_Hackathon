'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product_type: 'service',
    sales_price: '',
    cost_price: '0.00',
    notes: '',
    is_recurring: false,
    photo: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('product_type', formData.product_type);
    data.append('sales_price', formData.sales_price || '0');
    data.append('cost_price', formData.cost_price || '0');
    data.append('notes', formData.notes);
    data.append('is_recurring', String(formData.is_recurring));
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      await api.post('/products/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      router.push('/products');
    } catch (err: any) {
      alert(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create product');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Add New Product"
      subtitle="Create a new physical or service product for your catalog."
      actions={
        <Link href="/products" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          Cancel
        </Link>
      }
    >
      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Enterprise SSL Certificate"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Type</label>
              <select
                className="form-input"
                value={formData.product_type}
                onChange={e => setFormData({ ...formData, product_type: e.target.value })}
              >
                <option value="service">Service (Digital)</option>
                <option value="physical">Physical Item</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Sales Price (INR) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                required
                value={formData.sales_price}
                onChange={e => setFormData({ ...formData, sales_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price (INR)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.cost_price}
                onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, border: '1px dashed var(--on-surface-variant)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {formData.photo ? (
                  <img src={URL.createObjectURL(formData.photo)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span className="material-icons" style={{ color: 'var(--on-surface-variant)' }}>add_a_photo</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Billing Model</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 16px', background: 'var(--surface-container-lowest)', border: '1px solid var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={e => setFormData({ ...formData, is_recurring: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>Recurring Billing</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Check if this product is billed on a regular cycle (e.g. Monthly)</div>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Internal Notes</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any operational notes..."
            />
          </div>

          <div style={{ borderTop: '1px solid var(--surface-container)', paddingTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(NewProductPage);
