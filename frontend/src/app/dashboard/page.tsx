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

  const colors = [
    'var(--primary-container)', 
    'var(--secondary-container)', 
    'var(--tertiary-container)', 
    'var(--surface-container-highest)'
  ];

  const renderRevenueMix = () => {
    if (!reports?.revenue_by_plan || reports.revenue_by_plan.length === 0) {
      return (
        <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
          Not enough payment data.
        </div>
      );
    }
    const mixData = reports.revenue_by_plan;
    return mixData.map((item: any, i: number) => {
      const pct = (reports.total_revenue > 0) ? Math.round((item.amount / reports.total_revenue) * 100) : 0;
      return (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', width: 84, flexShrink: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {item.label}
          </div>
          <div style={{ flex: 1, height: 28, borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: colors[i % colors.length], borderRadius: 'var(--radius-md)', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface)', fontWeight: 600, width: 36 }}>{pct}%</div>
        </div>
      );
    });
  };

  const dynamicAlerts = [];
  if (reports?.overdue_amount > 0) {
    dynamicAlerts.push({
      icon: 'warning_amber',
      title: 'Overdue Payments',
      body: `You have INR ${Number(reports.overdue_amount).toLocaleString()} accumulated in overdue invoices.`,
      color: 'var(--warning-container)',
      iconColor: 'var(--warning)',
    });
  }
  if (reports?.new_subscriptions_this_month > 0) {
    dynamicAlerts.push({
      icon: 'trending_up',
      title: 'Growth Accelerating',
      body: `${reports.new_subscriptions_this_month} new subscriptions successfully confirmed this month.`,
      color: 'var(--tertiary-container)',
      iconColor: 'var(--on-tertiary-container)',
    });
  }
  if (reports?.outstanding_invoices > 0) {
    dynamicAlerts.push({
      icon: 'receipt_long',
      title: 'Invoices Awaiting Payment',
      body: `${reports.outstanding_invoices} confirmed invoices are awaiting checkout by customers.`,
      color: 'var(--primary-fixed)',
      iconColor: 'var(--primary-container)',
    });
  }
  if (dynamicAlerts.length === 0) {
    dynamicAlerts.push({
      icon: 'check_circle',
      title: 'All clear',
      body: 'No immediate action items found. Systems performant.',
      color: 'var(--secondary-container)',
      iconColor: 'var(--on-secondary-container)',
    });
  }

  return (
    <DashboardLayout
      title="Executive Overview"
      subtitle="Real-time ledger state for current fiscal reporting period"
    >
      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Subscriptions', value: reports?.active_subscriptions ?? '—', icon: 'subscriptions', change: reports ? `${reports.new_subscriptions_this_month} new this month` : '' },
          { label: 'Total Revenue', value: reports?.total_revenue ? `INR ${Number(reports.total_revenue).toLocaleString()}` : '—', icon: 'trending_up', change: reports ? `INR ${reports.payments_this_month} collected recently` : '' },
          { label: 'Outstanding Invoices', value: reports?.outstanding_invoices ?? '—', icon: 'receipt_long', change: reports?.outstanding_invoices > 0 ? 'Awaiting payment' : 'Up to date' },
          { label: 'Overdue Balance', value: reports?.overdue_amount ? `INR ${Number(reports.overdue_amount).toLocaleString()}` : '—', icon: 'account_balance_wallet', change: '' },
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
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>Revenue Mix</h2>
              <span style={{
                fontSize: '0.75rem', color: 'var(--on-surface-variant)',
                background: 'var(--surface-container)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
              }}>All-Time Breakdown</span>
            </div>
            {/* Dynamic rendering */}
            <div style={{ height: 128, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
              {renderRevenueMix()}
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Newest Subscriptions</h2>
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
                        {(s.subscription_number || String(s.id))[0].toUpperCase()}
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
          {dynamicAlerts.map(({ icon, title, body, color, iconColor }) => (
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
