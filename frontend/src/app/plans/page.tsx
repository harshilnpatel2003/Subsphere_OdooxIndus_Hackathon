'use client';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    api.get('/plans/').then(res => setPlans(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Navbar />
      <h1>Plans</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Billing Cycle</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Features</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{p.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{p.billing_cycle}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                Pausable: {p.pausable ? 'Yes' : 'No'} | Renewable: {p.renewable ? 'Yes' : 'No'}
              </td>
            </tr>
          ))}
          {plans.length === 0 && <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>No plans found. Add them via API.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default withAuth(PlansPage);
