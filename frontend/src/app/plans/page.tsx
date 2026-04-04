'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import withAuth from '@/components/withAuth';
import DashboardLayout from '@/components/DashboardLayout';

function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/plans/')
      .then(res => setPlans(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cycleLabel = (c: string) => {
    const map: Record<string, string> = {
      monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual', yearly: 'Yearly',
    };
    return map[c] || c || '—';
  };

  const tierColor = (index: number) => {
    const colors = [
      { bg: 'var(--primary-container)', text: 'var(--on-primary)' },
      { bg: 'var(--secondary-container)', text: 'var(--on-secondary-container)' },
      { bg: 'var(--surface-container-high)', text: 'var(--on-surface-variant)' },
    ];
    return colors[index % colors.length];
  };

  return (
    <DashboardLayout
      title="Quotation Templates"
      subtitle="Manage and deploy standardized pricing structures across your subscription ecosystem with precision."
      actions={
        <button className="btn btn-primary">
          <span className="material-icons" style={{ fontSize: 16 }}>add</span>
          New Template
        </button>
      }
    >
      {/* Master Templates section label */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">Master Templates</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>Loading templates…</div>
      ) : (
        <>
          {/* Plan Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
            {plans.map((plan, index) => {
              const tc = tierColor(index);
              return (
                <div key={plan.id} style={{
                  background: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {/* Plan header */}
                  <div style={{
                    padding: '20px 24px',
                    background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)`,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {cycleLabel(plan.billing_cycle)}
                      </span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.7rem' }}>
                        {plan.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{plan.name}</div>
                  </div>

                  {/* Plan body */}
                  <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { icon: 'pause_circle', label: 'Pausable', value: plan.pausable ? 'Yes' : 'No', enabled: plan.pausable },
                        { icon: 'autorenew', label: 'Auto-Renew', value: plan.renewable ? 'Yes' : 'No', enabled: plan.renewable },
                        { icon: 'schedule', label: 'Billing Period', value: cycleLabel(plan.billing_period || plan.billing_cycle), enabled: true },
                      ].map(({ icon, label, value, enabled }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-icons" style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>{icon}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{label}</span>
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: enabled ? 'var(--on-tertiary-container)' : 'var(--on-surface-variant)' }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button className="btn btn-secondary" style={{ marginTop: 'auto', justifyContent: 'center', width: '100%' }}>
                      Use This Template
                    </button>
                  </div>
                </div>
              );
            })}

            {plans.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
                No templates found. Create plans via the API.
              </div>
            )}
          </div>

          {/* AI Assist CTA */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            borderRadius: 'var(--radius-xl)', padding: '28px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Need a specialized setup?
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', maxWidth: 480, lineHeight: 1.5 }}>
                Our AI-assisted template generator can help you build custom quotation models based on historical subscription data and churn analysis.
              </div>
            </div>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', flexShrink: 0 }}>
              <span className="material-icons" style={{ fontSize: 16 }}>auto_awesome</span>
              Generate Template
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default withAuth(PlansPage);
