'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatDate, formatSubNumber } from '@/lib/formatters';
import withAuth from '@/components/withAuth';
import Link from 'next/link';

function OrdersPage() {
  const [activeSubs, setActiveSubs] = useState<any[]>([]);
  const [historySubs, setHistorySubs] = useState<any[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const [aRes, hRes] = await Promise.all([
        api.get('/subscriptions/?customer=me&status=active'),
        api.get('/subscriptions/?customer=me&status=closed')
      ]);
      setActiveSubs(aRes.data);
      setHistorySubs(hRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
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
      setMsg(`✓ Subscription ${action === 'close' ? 'cancelled' : action + 'ed'} successfully`);
      setTimeout(() => setMsg(''), 3000);
      fetchSubscriptions();
    } catch (err: any) {
      alert('Action failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;

  const currentSubs = tab === 'active' ? activeSubs : historySubs;

  return (
    <div>
      <PortalNav />
      <div style={{padding:'20px', maxWidth:'1000px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>My Subscriptions</h1>
          <Link href="/shop" style={{padding:'10px 20px', background:'#0070f3', color:'#fff', borderRadius:'4px', textDecoration:'none', fontWeight:'bold'}}>+ New Subscription</Link>
        </div>
        
        {msg && <p style={{color:'green', fontWeight:'bold', marginBottom:'20px'}}>{msg}</p>}

        <div style={{marginTop:'30px', display:'flex', borderBottom:'1px solid #ddd'}}>
          <button 
            onClick={() => setTab('active')}
            style={{
              padding:'10px 20px', 
              border:'none', 
              background:'none', 
              cursor:'pointer', 
              borderBottom: tab === 'active' ? '3px solid #0070f3' : 'none',
              color: tab === 'active' ? '#0070f3' : '#666',
              fontWeight: 'bold'
            }}
          >
            Active ({activeSubs.length})
          </button>
          <button 
            onClick={() => setTab('history')}
            style={{
              padding:'10px 20px', 
              border:'none', 
              background:'none', 
              cursor:'pointer', 
              borderBottom: tab === 'history' ? '3px solid #0070f3' : 'none',
              color: tab === 'history' ? '#0070f3' : '#666',
              fontWeight: 'bold',
              marginLeft: '10px'
            }}
          >
            History ({historySubs.length})
          </button>
        </div>

        <div style={{marginTop:'20px'}}>
          {currentSubs.length === 0 ? (
            <p style={{padding:'40px', textAlign:'center', color:'#888'}}>No subscriptions found in this section.</p>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f9f9f9', borderBottom:'1px solid #ddd'}}>
                  <th style={{padding:'12px', textAlign:'left'}}>Subscription #</th>
                  <th style={{padding:'12px', textAlign:'left'}}>Plan</th>
                  <th style={{padding:'12px', textAlign:'left'}}>Start Date</th>
                  <th style={{padding:'12px', textAlign:'left'}}>Status</th>
                  <th style={{padding:'12px', textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubs.map(s => (
                  <tr key={s.id} style={{borderBottom:'1px solid #eee'}}>
                    <td style={{padding:'12px'}}><strong>{formatSubNumber(s)}</strong></td>
                    <td style={{padding:'12px'}}>{s.plan_name || 'Individual Items'}</td>
                    <td style={{padding:'12px'}}>{formatDate(s.start_date)}</td>
                    <td style={{padding:'12px'}}><span style={{
                      padding:'3px 8px', borderRadius:'10px', fontSize:'0.8em', fontWeight:'bold', textTransform:'uppercase',
                      background: s.status === 'active' ? '#d4edda' : '#eee',
                      color: s.status === 'active' ? '#155724' : '#666'
                    }}>{s.status}</span></td>
                    <td style={{padding:'12px', textAlign:'center'}}>
                      <Link href={`/orders/${s.id}`} style={{color:'#0070f3', marginRight:'15px', fontWeight:'bold'}}>View</Link>
                      {s.status === 'active' && (
                        <>
                          <button onClick={() => handleAction(s.id, 'renew')} style={{color:'#28a745', border:'none', background:'none', cursor:'pointer', marginRight:'15px', fontWeight:'bold'}}>Renew</button>
                          <button onClick={() => handleAction(s.id, 'close')} style={{color:'red', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>Cancel</button>
                        </>
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
