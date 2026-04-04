'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function ReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/reports/summary/').then(res => setReports(res.data)).catch(console.error);
    api.get('/subscriptions/').then(res => setSubs(res.data)).catch(console.error);
  }, []);

  const recentSubs = subs.slice(0, 4);

  return (
    <DashboardLayout
      title="Reports Dashboard"
      subtitle="Performance Overview — Analytics on subscriptions, revenue, and billing health."
      actions={
        <button className="btn btn-secondary">
          <span className="material-icons" style={{ fontSize: 16 }}>download</span>
          Export Report
        </button>
      }
    >
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Subscriptions', value: reports?.active_subscriptions ?? reports?.total_active ?? '—', icon: 'subscriptions', change: '' },
          { label: 'Monthly Recurring Revenue', value: reports?.mrr ? `INR ${Number(reports.mrr).toLocaleString()}` : reports?.total_revenue ? `INR ${Number(reports.total_revenue).toLocaleString()}` : '—', icon: 'trending_up', change: '' },
          { label: 'Outstanding Invoices', value: reports?.outstanding_invoices ?? '—', icon: 'receipt_long', change: '' },
          { label: 'Overdue Amount', value: reports?.overdue_amount ? `INR ${Number(reports.overdue_amount).toLocaleString()}` : '—', icon: 'warning_amber', change: '' },
        ].map(({ label, value, icon, change }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="stat-card__label">{label}</span>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary-container)', opacity: 0.7 }}>{icon}</span>
            </div>
            <div className="stat-card__value">{value}</div>
            {change && <div className="stat-card__change">{change}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Revenue Mix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>Revenue Mix</h2>
            </div>
            <div style={{ height: 140, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Enterprise', width: '82%', color: 'var(--primary-container)', note: '82% of new MRR' },
                { label: 'Growth', width: '12%', color: 'var(--secondary-container)', note: '' },
                { label: 'Startup', width: '6%', color: 'var(--surface-container-highest)', note: '' },
              ].map(({ label, width, color, note }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', width: 72, flexShrink: 0 }}>{label}</div>
                  <div style={{ flex: 1, height: 28, borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', overflow: 'hidden' }}>
                    <div style={{ width, height: '100%', background: color, borderRadius: 'var(--radius-md)', transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 600, width: 36 }}>{width}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 20, padding: '14px 16px',
              background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontStyle: 'italic', lineHeight: 1.5,
            }}>
              &ldquo;Enterprise plans continue to drive 82% of the net new MRR growth this quarter.&rdquo;
            </div>
          </div>

          {/* All reports data */}
          {reports && (
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Full Report Data</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {Object.entries(reports).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--surface-container)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'monospace' }}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Subscribers */}
        <div>
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>New Subscriptions</h2>
            {recentSubs.length === 0 ? (
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recentSubs.map((s: any) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    borderBottom: '1px solid var(--surface-container)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--secondary-container)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'var(--on-secondary-container)', flexShrink: 0,
                    }}>
                      {(s.subscription_number || String(s.id))[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                        {s.subscription_number || `SUB-${s.id}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{s.start_date}</div>
                    </div>
                    <span className={`badge badge-${s.status}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(ReportsPage);
