'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatDate, formatSubNumber } from '@/lib/formatters';
import withAuth from '@/components/withAuth';
import Link from 'next/link';

type Tab = 'quotations' | 'active' | 'history';

function OrdersPage() {
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
    const colors: Record<string, { bg: string; color: string }> = {
      active: { bg: '#d4edda', color: '#155724' },
      quotation: { bg: '#fff3cd', color: '#856404' },
      quotation_sent: { bg: '#cce5ff', color: '#004085' },
      closed: { bg: '#e2e3e5', color: '#383d41' },
      cancelled: { bg: '#f8d7da', color: '#721c24' },
      confirmed: { bg: '#d1ecf1', color: '#0c5460' },
    };
    const c = colors[s] || { bg: '#eee', color: '#555' };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 10, fontSize: '0.78em', fontWeight: 'bold',
        textTransform: 'uppercase', letterSpacing: '0.04em',
        background: c.bg, color: c.color,
      }}>
        {s.replace('_', ' ')}
      </span>
    );
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'quotations', label: '📋 Quotations', count: quotations.length },
    { key: 'active', label: '✅ Active', count: activeSubs.length },
    { key: 'history', label: '🗂 History', count: historySubs.length },
  ];

  const currentSubs = tab === 'quotations' ? quotations : tab === 'active' ? activeSubs : historySubs;

  if (loading) return (
    <div>
      <PortalNav />
      <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading your subscriptions…</div>
    </div>
  );

  return (
    <div>
      <PortalNav />
      <div style={{ padding: '24px 32px', maxWidth: 1024, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Subscriptions</h1>
            <p style={{ color: '#666', marginTop: 4 }}>View your active agreements and pending quotations</p>
          </div>
          <Link href="/shop" style={{
            padding: '10px 20px', background: '#0070f3', color: '#fff',
            borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem'
          }}>
            + New Order
          </Link>
        </div>

        {msg && (
          <div style={{ padding: '12px 16px', background: '#d4edda', color: '#155724', borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #eee', marginBottom: 24 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 600,
                borderBottom: tab === t.key ? '2px solid #0070f3' : '2px solid transparent',
                color: tab === t.key ? '#0070f3' : '#888',
                marginBottom: -2,
              }}
            >
              {t.label} <span style={{ opacity: 0.65, fontStyle: 'normal', fontSize: '0.8em' }}>({t.count})</span>
            </button>
          ))}
        </div>

        {/* Quotation info banner */}
        {tab === 'quotations' && quotations.length > 0 && (
          <div style={{
            padding: '14px 20px', background: '#fff3cd', border: '1px solid #ffecb5',
            borderRadius: 8, marginBottom: 20, fontSize: '0.9rem', color: '#7c5e00'
          }}>
            <strong>📣 You have {quotations.length} pending quotation{quotations.length > 1 ? 's' : ''}.</strong>
            {' '}Review the details below. Contact support to confirm or negotiate further.
          </div>
        )}

        {/* Table */}
        <div>
          {currentSubs.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{tab === 'quotations' ? '📋' : tab === 'active' ? '✅' : '🗂'}</div>
              <p style={{ fontSize: '1rem' }}>No {tab === 'quotations' ? 'quotations' : tab === 'active' ? 'active subscriptions' : 'history'} found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Reference</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Plan</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Date</th>
                  {tab === 'quotations' && <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Expires</th>}
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: '#555' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubs.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {formatSubNumber(s)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#444' }}>{s.plan_name || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#666' }}>{formatDate(s.start_date)}</td>
                    {tab === 'quotations' && (
                      <td style={{ padding: '14px 16px', color: s.expiration_date ? '#c0392b' : '#888' }}>
                        {s.expiration_date ? formatDate(s.expiration_date) : 'No expiry'}
                      </td>
                    )}
                    <td style={{ padding: '14px 16px' }}>{statusBadge(s.status)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <Link href={`/orders/${s.id}`} style={{
                        color: '#0070f3', fontWeight: 600, textDecoration: 'none',
                        padding: '6px 14px', border: '1px solid #0070f3', borderRadius: 6,
                        fontSize: '0.85rem'
                      }}>View</Link>
                      {s.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleAction(s.id, 'close')}
                          style={{
                            marginLeft: 10, color: '#c0392b', border: '1px solid #e74c3c',
                            background: 'none', cursor: 'pointer', borderRadius: 6,
                            padding: '6px 12px', fontSize: '0.85rem'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrdersPage);
