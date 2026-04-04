'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/reports/summary/').then(res => setReports(res.data)).catch(console.error);
    api.get('/subscriptions/').then(res => setSubs(res.data)).catch(console.error);
  }, []);

  const recentSubs = subs.slice(0, 4);

  return (
    <DashboardLayout
      title="Executive Overview"
      subtitle="Real-time ledger state for current fiscal reporting period"
    >
      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Subscriptions', value: reports?.total_active ?? '—', icon: 'subscriptions', change: '+402 new since last week' },
          { label: 'Monthly Revenue', value: reports?.mrr ? `$${Number(reports.mrr).toLocaleString()}` : '—', icon: 'trending_up', change: '' },
          { label: 'Outstanding Invoices', value: reports?.outstanding_invoices ?? '—', icon: 'receipt_long', change: 'Awaiting payment' },
          { label: 'Churn Rate', value: reports?.churn_rate ? `${reports.churn_rate}%` : '—', icon: 'monitor_heart', change: '' },
        ].map(({ label, value, icon, change }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="stat-card__label">{label}</span>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary-container)', opacity: 0.7 }}>{icon}</span>
            </div>
            <div className="stat-card__value">{value}</div>
            {change && <div className="stat-card__change" style={{ fontSize: '0.75rem', color: 'var(--on-tertiary-container)' }}>{change}</div>}
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Revenue Mix Placeholder + New Subs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Chart Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>Revenue Mix by Tier</h2>
              <span style={{
                fontSize: '0.75rem', color: 'var(--on-surface-variant)',
                background: 'var(--surface-container)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
              }}>Q3 FY 2024</span>
            </div>
            {/* Stacked bar placeholder */}
            <div style={{ height: 128, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Enterprise', width: '52%', color: 'var(--primary-container)' },
                { label: 'Growth', width: '30%', color: 'var(--secondary-container)' },
                { label: 'Startup', width: '18%', color: 'var(--surface-container-highest)' },
              ].map(({ label, width, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', width: 72, flexShrink: 0 }}>{label}</div>
                  <div style={{ flex: 1, height: 28, borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', overflow: 'hidden' }}>
                    <div style={{ width, height: '100%', background: color, borderRadius: 'var(--radius-md)', transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 600, width: 36 }}>{width}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>New Subscriptions This Month</h2>
            {recentSubs.length === 0 ? (
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No subscriptions yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recentSubs.map((s: any) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid var(--surface-container)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--secondary-container)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'var(--on-secondary-container)', flexShrink: 0,
                      }}>
                        {(s.subscription_number || s.id).toString()[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                          {s.subscription_number || `SUB-${s.id}`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                          {s.start_date}
                        </div>
                      </div>
                    </div>
                    <span className={`badge badge-${s.status}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              icon: 'event',
              title: 'Upcoming Audit',
              body: 'Prepare tax compliance report for EMEA region',
              color: 'var(--primary-fixed)',
              iconColor: 'var(--primary-container)',
            },
            {
              icon: 'warning_amber',
              title: 'Churn Risk Alert',
              body: '3 subscriptions show decreased activity (>-25%) in the last 14 days.',
              color: 'var(--warning-container)',
              iconColor: 'var(--warning)',
            },
            {
              icon: 'speed',
              title: 'System Health',
              body: 'Gateway Latency: 142ms · Transaction Success Rate: 99.8%',
              color: 'var(--tertiary-container)',
              iconColor: 'var(--on-tertiary-container)',
            },
          ].map(({ icon, title, body, color, iconColor }) => (
            <div key={title} style={{
              background: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
              borderLeft: `3px solid ${iconColor}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span className="material-icons" style={{ fontSize: 20, color: iconColor, marginTop: 2 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(Dashboard);
