'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = () => {
    setLoading(true);
    api.get('/subscriptions/')
      .then(res => setSubs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/subscriptions/${id}/confirm/`);
      fetchSubs();
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

  const totalActive = subs.filter(s => s.status === 'active').length;
  const totalDraft = subs.filter(s => s.status === 'draft' || s.status === 'quotation').length;

  return (
    <DashboardLayout
      title="Subscriptions"
      subtitle="Manage recurring revenue cycles, customer lifecycle stages, and ledger-aligned subscription data."
      actions={
        <Link href="/subscriptions/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <span className="material-icons" style={{ fontSize: 16 }}>add</span>
          New Subscription
        </Link>
      }
    >
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Active', value: totalActive, icon: 'check_circle', color: 'var(--on-tertiary-container)' },
          { label: 'Draft / Quoted', value: totalDraft, icon: 'pending', color: 'var(--warning)' },
          { label: 'New This Month', value: '+15%', icon: 'trending_up', color: 'var(--on-tertiary-container)' },
          { label: 'Churn Rate', value: '0.8%', icon: 'monitor_heart', color: 'var(--on-surface-variant)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="stat-card__label">{label}</span>
              <span className="material-icons" style={{ fontSize: 18, color, opacity: 0.8 }}>{icon}</span>
            </div>
            <div className="stat-card__value">{value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        padding: '12px 16px', background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
      }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>search</span>
        <input
          type="text"
          placeholder="Search subscriptions…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: '0.875rem', color: 'var(--on-surface)',
          }}
        />
        <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
          Showing {subs.length} subscription{subs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading subscriptions…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subscription</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Plan</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/subscriptions/${s.id}`} style={{ fontWeight: 600, color: 'var(--primary-container)' }}>
                      {s.subscription_number || `SUB-${s.id}`}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${statusClass(s.status)}`}>{s.status.toUpperCase()}</span>
                  </td>
                  <td style={{ color: 'var(--on-surface-variant)' }}>{s.start_date || '—'}</td>
                  <td style={{ color: 'var(--on-surface-variant)' }}>{s.plan_name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={`/subscriptions/${s.id}`} className="btn btn-secondary btn-sm">View</Link>
                      {(s.status === 'draft' || s.status === 'quotation') && (
                        <button
                          onClick={() => handleConfirm(s.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-variant)' }}>
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAuth(SubscriptionsPage);
