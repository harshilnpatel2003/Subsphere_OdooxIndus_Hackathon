'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { formatINR } from '@/lib/formatters';

// ── SVG Pie Chart ──────────────────────────────────────────────────────────
function PieChart({ data, colors, size = 180 }: { data: { label: string; value: number }[]; colors: string[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>No data</div>;

  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    startAngle += angle;
    return { path, color: colors[i % colors.length], label: d.label, value: d.value, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="var(--surface)" strokeWidth={2}>
            <title>{s.label}: {s.pct}%</title>
          </path>
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{s.label}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface)', marginLeft: 'auto', paddingLeft: 12 }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Palette ────────────────────────────────────────────────────────────────
const PALETTE = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  active: '#10b981', draft: '#6366f1', confirmed: '#06b6d4',
  cancelled: '#ef4444', closed: '#9f1239', quotation: '#f59e0b', quotation_sent: '#f97316',
};

function ReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary/'),
      api.get('/subscriptions/'),
    ]).then(([r, s]) => {
      setReports(r.data);
      setSubs(Array.isArray(s.data) ? s.data : s.data.results || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const revenue = reports?.total_revenue || 0;
  const cost    = reports?.total_cost    || 0;
  const profit  = reports?.total_profit  || 0;

  const revenueBreakdownData = [
    { label: 'Profit',  value: Math.max(profit, 0) },
    { label: 'Cost',    value: cost },
  ].filter(d => d.value > 0);

  const planData = (reports?.revenue_by_plan || []).map((d: any) => ({ label: d.label, value: d.amount }));
  const statusData = (reports?.subscription_status_breakdown || []).map((d: any) => ({
    label: d.label.charAt(0).toUpperCase() + d.label.slice(1),
    value: d.count,
  }));
  const statusColors = (reports?.subscription_status_breakdown || []).map((d: any) => STATUS_COLORS[d.label] || '#64748b');

  const recentSubs = subs.slice(0, 5);

  return (
    <DashboardLayout
      title="Reports Dashboard"
      subtitle="Performance overview — revenue, profit, subscriptions & billing health."
    >
      {loading ? (
        <p style={{ color: 'var(--on-surface-variant)' }}>Loading reports...</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Active Subscriptions', value: reports?.active_subscriptions ?? '—', icon: 'subscriptions' },
              { label: 'Total Revenue',         value: formatINR(revenue),                  icon: 'trending_up' },
              { label: 'Total Cost',            value: formatINR(cost),                     icon: 'account_balance_wallet' },
              { label: 'Gross Profit',          value: formatINR(profit),                   icon: 'savings', color: profit >= 0 ? '#10b981' : '#ef4444' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="stat-card__label">{label}</span>
                  <span className="material-icons" style={{ fontSize: 18, color: color || 'var(--primary-container)', opacity: 0.8 }}>{icon}</span>
                </div>
                <div className="stat-card__value" style={{ color: color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Row 1: Revenue vs Cost vs Profit pie | Subscriptions by Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 20 }}>Revenue Breakdown</h2>
              <PieChart
                data={revenueBreakdownData.length ? revenueBreakdownData : [{ label: 'No revenue', value: 1 }]}
                colors={['#10b981', '#ef4444']}
              />
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Revenue', val: formatINR(revenue), color: '#6366f1' },
                  { label: 'Cost',    val: formatINR(cost),    color: '#ef4444' },
                  { label: 'Profit',  val: formatINR(profit),  color: '#10b981' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'var(--surface-container-lowest)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 20 }}>Subscriptions by Status</h2>
              <PieChart data={statusData} colors={statusColors} />
              {statusData.length === 0 && <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No subscription data.</p>}
            </div>
          </div>

          {/* Row 2: Revenue by Plan pie | Recent Subscriptions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 20 }}>Revenue by Plan</h2>
              <PieChart data={planData} colors={PALETTE} size={200} />

              {/* Bar breakdown */}
              {planData.length > 0 && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {planData.map((d: any, i: number) => {
                    const pct = revenue > 0 ? Math.round((d.value / revenue) * 100) : 0;
                    return (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 90, fontSize: '0.78rem', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                        <div style={{ flex: 1, height: 20, borderRadius: 99, background: 'var(--surface-container)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: PALETTE[i % PALETTE.length], borderRadius: 99 }} />
                        </div>
                        <span style={{ width: 36, fontSize: '0.78rem', fontWeight: 700, color: 'var(--on-surface)', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 16 }}>Recent Subscriptions</h2>
              {recentSubs.length === 0 ? (
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No subscriptions yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {recentSubs.map((s: any) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--surface-container)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: STATUS_COLORS[s.status] || '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(s.subscription_number || String(s.id))[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{s.subscription_number || `SUB-${s.id}`}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{s.start_date}</div>
                      </div>
                      <span className={`badge badge-${s.status}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default withAuth(ReportsPage);
