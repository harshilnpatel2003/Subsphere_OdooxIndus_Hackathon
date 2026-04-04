'use client';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = () => {
    api.get('/subscriptions/').then(res => setSubs(res.data)).catch(console.error);
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/subscriptions/${id}/confirm/`);
      alert('Subscription confirmed and Invoice Auto-generated!');
      fetchSubs();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error confirming');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Navbar />
      <h1>Subscriptions</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Number</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Status</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Dates</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subs.map(s => (
            <tr key={s.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{s.subscription_number}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px', fontWeight: 'bold' }}>{s.status.toUpperCase()}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>Start: {s.start_date}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {(s.status === 'draft' || s.status === 'quotation') && (
                  <button onClick={() => handleConfirm(s.id)} style={{ padding: '6px 12px', cursor: 'pointer', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>Confirm Sub</button>
                )}
                {s.status === 'active' && <span style={{ color: 'green' }}>Active - See Invoices</span>}
              </td>
            </tr>
          ))}
          {subs.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No subscriptions found. Create them via API.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default withAuth(SubscriptionsPage);
