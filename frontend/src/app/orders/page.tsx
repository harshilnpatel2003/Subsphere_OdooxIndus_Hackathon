'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatDate, formatSubNumber } from '@/lib/formatters';
import withAuth from '@/components/withAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tab = 'quotations' | 'active' | 'history';

function OrdersPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [activeSubs, setActiveSubs] = useState<any[]>([]);
  const [historySubs, setHistorySubs] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('quotations');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const [qRes, qs_Res, aRes, hRes, cRes] = await Promise.all([
        api.get('/subscriptions/?status=quotation'),
        api.get('/subscriptions/?status=quotation_sent'),
        api.get('/subscriptions/?status=active'),
        api.get('/subscriptions/?status=closed'),
        api.get('/subscriptions/?status=cancelled'),
      ]);
      setQuotations([...qRes.data, ...qs_Res.data]);
      setActiveSubs(aRes.data);
      setHistorySubs([...hRes.data, ...cRes.data]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAction = async (id: number, action: string) => {
    if (action === 'close' && !confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await api.post(`/subscriptions/${id}/${action}/`);
      setMsg(`✓ Action completed successfully`);
      setTimeout(() => setMsg(''), 3000);
      fetchSubscriptions();
    } catch (err: any) {
      alert('Action failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const statusBadge = (s: string) => {
    const statusMap: Record<string, string> = {
      active: 'badge-active',
      quotation: 'badge-pending',
      quotation_sent: 'badge-draft',
      closed: 'badge-closed',
      cancelled: 'badge-error',
      confirmed: 'badge-confirmed',
    };
    const className = statusMap[s] || 'badge';
    return (
      <span className={`badge ${className}`}>
        {s.replace('_', ' ')}
      </span>
    );
  };

  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'quotations', label: 'Quotations', icon: 'description', count: quotations.length },
    { key: 'active', label: 'Active', icon: 'check_circle', count: activeSubs.length },
    { key: 'history', label: 'History', icon: 'archive', count: historySubs.length },
  ];

  const currentSubs = tab === 'quotations' ? quotations : tab === 'active' ? activeSubs : historySubs;

  if (loading) return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <PortalNav />
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="material-icons" style={{ fontSize: '48px', color: 'var(--primary)', opacity: 0.2 }}>architecture</div>
            <p className="body-md text-muted">Synchronizing with ledger...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '80px' }}>
      <PortalNav />
      
      <div style={{ padding: '40px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 className="display-sm">My Portfolio</h1>
            <p className="body-lg text-muted" style={{ marginTop: '4px' }}>Analyze and manage your active agreements and financial quotations.</p>
          </div>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600 }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
            New Order
          </Link>
        </div>

        {msg && (
          <div style={{ padding: '16px 20px', background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)', borderRadius: 'var(--radius-lg)', marginBottom: '32px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <span className="material-icons">check_circle</span>
            {msg}
          </div>
        )}

        {/* Stats Summary Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            <div className="stat-card">
                <span className="stat-card__label">Pending Quotations</span>
                <span className="stat-card__value">{quotations.length}</span>
                <span className="stat-card__change">Awaiting your review</span>
            </div>
            <div className="stat-card">
                <span className="stat-card__label">Active Subscriptions</span>
                <span className="stat-card__value">{activeSubs.length}</span>
                <span className="stat-card__change" style={{ color: 'var(--on-tertiary-container)' }}>Operational</span>
            </div>
            <div className="stat-card">
                <span className="stat-card__label">Closed / History</span>
                <span className="stat-card__value">{historySubs.length}</span>
                <span className="stat-card__change">Past agreements</span>
            </div>
        </div>

        {/* Browser Area */}
        <div className="card" style={{ padding: '0' }}>
            {/* Tabs Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-container)', padding: '0 24px' }}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            padding: '24px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: tab === t.key ? '3px solid var(--primary)' : '3px solid transparent',
                            color: tab === t.key ? 'var(--primary)' : 'var(--on-surface-variant)',
                            fontWeight: tab === t.key ? 700 : 500,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '20px' }}>{t.icon}</span>
                        {t.label}
                        <span style={{ fontSize: '0.8em', background: tab === t.key ? 'var(--primary-fixed)' : 'var(--surface-container)', color: tab === t.key ? 'var(--primary)' : 'var(--on-surface-variant)', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px' }}>{t.count}</span>
                    </button>
                ))}
            </div>

            <div style={{ padding: '24px' }}>
                {currentSubs.length === 0 ? (
                    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                        <div style={{ 
                            width: '80px', height: '80px', background: 'var(--surface-container-low)', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <span className="material-icons" style={{ fontSize: '40px', color: 'var(--outline-variant)' }}>folder_open</span>
                        </div>
                        <h3 className="headline-sm">No entries found</h3>
                        <p className="body-md text-muted" style={{ maxWidth: '300px', margin: '8px auto 0' }}>There are currently no {tab} to display in your ledger.</p>
                        <button onClick={() => router.push('/shop')} className="btn btn-secondary btn-sm" style={{ marginTop: '24px' }}>Visit Marketplace</button>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Reference Number</th>
                                <th>Service / Plan</th>
                                <th>Created Date</th>
                                {tab === 'quotations' && <th>Valid Until</th>}
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSubs.map(s => (
                                <tr key={s.id}>
                                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                        {formatSubNumber(s)}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{s.plan_name || 'Generic Asset'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{s.billing_period} billing</div>
                                    </td>
                                    <td className="text-muted">{formatDate(s.start_date)}</td>
                                    {tab === 'quotations' && (
                                        <td style={{ color: s.expiration_date ? 'var(--error)' : 'var(--on-surface-variant)' }}>
                                            {s.expiration_date ? formatDate(s.expiration_date) : '-'}
                                        </td>
                                    )}
                                    <td>{statusBadge(s.status)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <Link href={`/orders/${s.id}`} className="btn btn-secondary btn-sm">
                                                View Details
                                            </Link>
                                            {s.status === 'active' && (
                                                <button
                                                    onClick={() => handleAction(s.id, 'close')}
                                                    className="btn btn-danger btn-sm"
                                                >
                                                    Terminate
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrdersPage);
