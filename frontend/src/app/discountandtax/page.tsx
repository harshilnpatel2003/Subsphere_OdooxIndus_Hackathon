'use client';
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/withAuth';

// --- Types ---
interface DiscountRule {
    id?: number;
    name: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    value: number;
    min_purchase: number;
    start_date: string | null;
    end_date: string | null;
    usage_limit: number | null;
    current_usage: number;
    max_uses_per_user: number | null; // null = unlimited
}

interface TaxRule {
    id?: number;
    name: string;
    rate: string | number;
    tax_type: 'GST' | 'VAT' | 'custom';
}

// --- Shared Modal Wrapper ---
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 className="headline-sm" style={{ margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--outline)' }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function DiscountTaxConfigPage() {
    // --- 1. State ---
    const [activeTab, setActiveTab] = useState<'discounts' | 'taxes' | 'currency'>('discounts');
    const [rules, setRules] = useState<DiscountRule[]>([]);
    const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingDiscount, setEditingDiscount] = useState<Partial<DiscountRule> | null>(null);
    const [editingTax, setEditingTax] = useState<Partial<TaxRule> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- 2. Data Fetch ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [disRes, taxRes] = await Promise.all([api.get('/discounts/'), api.get('/taxes/')]);
            setRules(Array.isArray(disRes.data) ? disRes.data : disRes.data.results || []);
            setTaxRules(Array.isArray(taxRes.data) ? taxRes.data : taxRes.data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- 3. Handlers ---
    const handleSaveDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDiscount) return;
        setIsSaving(true);
        try {
            const payload = { ...editingDiscount, value: String(editingDiscount.value), min_purchase: String(editingDiscount.min_purchase) };
            if (editingDiscount.id) await api.patch(`/discounts/${editingDiscount.id}/`, payload);
            else await api.post('/discounts/', payload);
            await fetchData();
            setEditingDiscount(null);
        } catch (err) { alert('Save failed'); } finally { setIsSaving(false); }
    };

    const handleSaveTax = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTax) return;
        setIsSaving(true);
        try {
            if (editingTax.id) await api.patch(`/taxes/${editingTax.id}/`, editingTax);
            else await api.post('/taxes/', editingTax);
            await fetchData();
            setEditingTax(null);
        } catch (err) { alert('Save failed'); } finally { setIsSaving(false); }
    };

    const handleDeleteDiscount = async (id: number) => {
        if (!window.confirm('Delete this rule?')) return;
        try { await api.delete(`/discounts/${id}/`); fetchData(); } catch { alert('Delete failed'); }
    };

    const handleDeleteTax = async (id: number) => {
        if (!window.confirm('Delete this tax?')) return;
        try { await api.delete(`/taxes/${id}/`); fetchData(); } catch { alert('Delete failed'); }
    };

    const isDiscountActive = (start: string | null, end: string | null) => {
        const now = new Date().toISOString().split('T')[0];
        if (start && start > now) return false;
        if (end && end < now) return false;
        return true;
    };

    return (
        <DashboardLayout 
            title="Discount & Tax Configuration" 
            subtitle="Manage global taxation rules and promotional incentives."
            actions={
                <button className="btn btn-primary" onClick={() => {
                    if (activeTab === 'discounts') setEditingDiscount({ name: '', code: '', discount_type: 'percentage', value: 0, min_purchase: 0 });
                    else if (activeTab === 'taxes') setEditingTax({ name: '', rate: 0, tax_type: 'GST' });
                }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>add</span>
                    Create New {activeTab === 'discounts' ? 'Discount' : activeTab === 'taxes' ? 'Tax' : 'Currency'}
                </button>
            }
        >
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--surface-container)', marginBottom: 24 }}>
                {[
                    { id: 'discounts', label: 'Discount Rules', icon: 'local_offer' },
                    { id: 'taxes', label: 'Tax Settings', icon: 'payments' },
                    { id: 'currency', label: 'Currency Mappings', icon: 'currency_exchange' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
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

            {/* Content Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading...</div>
                ) : activeTab === 'discounts' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Rule</th>
                                <th>Value</th>
                                <th>Min Purchase</th>
                                <th>Limit</th>
                                <th>Validity</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 700 }}>
                                        {r.name} <div className="body-sm" style={{ color: 'var(--outline)' }}>{r.code}</div>
                                    </td>
                                    <td>{r.discount_type === 'percentage' ? `${r.value}%` : `₹${r.value}`}</td>
                                    <td>₹{Number(r.min_purchase).toLocaleString()}</td>
                                    <td>{r.max_uses_per_user || '∞'} per user</td>
                                    <td className="body-sm">{r.start_date || '—'} to {r.end_date || '—'}</td>
                                    <td>
                                        <span className={`badge ${isDiscountActive(r.start_date, r.end_date) ? 'badge-active' : 'badge-closed'}`}>
                                            {isDiscountActive(r.start_date, r.end_date) ? 'ACTIVE' : 'EXPIRED'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingDiscount(r)} style={{ marginRight: 8 }}>Edit</button>
                                        <button className="btn btn-secondary btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDeleteDiscount(r.id!)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {rules.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60 }}>No discount rules.</td></tr>}
                        </tbody>
                    </table>
                ) : activeTab === 'taxes' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tax Label</th>
                                <th>Type</th>
                                <th>Rate</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxRules.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontWeight: 700 }}>{t.name}</td>
                                    <td>{t.tax_type.toUpperCase()}</td>
                                    <td>{t.rate}%</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingTax(t)} style={{ marginRight: 8 }}>Edit</button>
                                        <button className="btn btn-secondary btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDeleteTax(t.id!)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {taxRules.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 60 }}>No tax rules.</td></tr>}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: 60, textAlign: 'center' }}>Currency mapping engine pending.</div>
                )}
            </div>

            {/* Discount Modal */}
            {editingDiscount && (
                <Modal title={editingDiscount.id ? 'Edit Discount' : 'New Discount'} onClose={() => setEditingDiscount(null)}>
                    <form onSubmit={handleSaveDiscount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group"><label className="form-label">Name</label>
                            <input className="form-input" required value={editingDiscount.name} onChange={e => setEditingDiscount({...editingDiscount, name: e.target.value})} /></div>
                        <div className="form-group"><label className="form-label">Code</label>
                            <input className="form-input" required value={editingDiscount.code} onChange={e => setEditingDiscount({...editingDiscount, code: e.target.value.toUpperCase()})} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group"><label className="form-label">Type</label>
                                <select className="form-input" value={editingDiscount.discount_type} onChange={e => setEditingDiscount({...editingDiscount, discount_type: e.target.value as any})}>
                                    <option value="percentage">Percentage</option><option value="fixed">Fixed</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Value</label>
                                <input className="form-input" type="number" required value={editingDiscount.value} onChange={e => setEditingDiscount({...editingDiscount, value: Number(e.target.value)})} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Min Purchase (₹)</label>
                            <input className="form-input" type="number" value={editingDiscount.min_purchase} onChange={e => setEditingDiscount({...editingDiscount, min_purchase: Number(e.target.value)})} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group"><label className="form-label">Start Date</label>
                                <input className="form-input" type="date" value={editingDiscount.start_date || ''} onChange={e => setEditingDiscount({...editingDiscount, start_date: e.target.value})} /></div>
                            <div className="form-group"><label className="form-label">End Date</label>
                                <input className="form-input" type="date" value={editingDiscount.end_date || ''} onChange={e => setEditingDiscount({...editingDiscount, end_date: e.target.value})} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Uses Per User</label>
                             <input className="form-input" type="number" placeholder="Leave empty for unlimited" value={editingDiscount.max_uses_per_user ?? ''} onChange={e => setEditingDiscount({...editingDiscount, max_uses_per_user: e.target.value ? Number(e.target.value) : null})} /></div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setEditingDiscount(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Discount'}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Tax Modal */}
            {editingTax && (
                <Modal title={editingTax.id ? 'Edit Tax' : 'New Tax'} onClose={() => setEditingTax(null)}>
                    <form onSubmit={handleSaveTax} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group"><label className="form-label">Tax Name</label>
                            <input className="form-input" required value={editingTax.name} onChange={e => setEditingTax({...editingTax, name: e.target.value})} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group"><label className="form-label">Category</label>
                                <select className="form-input" value={editingTax.tax_type} onChange={e => setEditingTax({...editingTax, tax_type: e.target.value as any})}>
                                    <option value="GST">GST</option><option value="VAT">VAT</option><option value="custom">Other</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Rate (%)</label>
                                <input className="form-input" type="number" step="0.01" required value={editingTax.rate} onChange={e => setEditingTax({...editingTax, rate: Number(e.target.value)})} /></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setEditingTax(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Tax'}</button>
                        </div>
                    </form>
                </Modal>
            )}

        </DashboardLayout>
    );
}

export default withAuth(DiscountTaxConfigPage);