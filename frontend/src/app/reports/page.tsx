'use client';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function ReportsPage() {
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    api.get('/reports/summary/').then(res => setReports(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Navbar />
      <h1>Reports Dashboard</h1>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', backgroundColor: '#fafafa' }}>
      {reports ? (
        <ul style={{ fontSize: '1.2em', lineHeight: '2' }}>
            <li><strong>Active Subscriptions:</strong> {reports.active_subscriptions}</li>
            <li><strong>Total Revenue:</strong> INR {reports.total_revenue}</li>
            <li><strong>Outstanding Invoices:</strong> {reports.outstanding_invoices}</li>
            <li><strong>Overdue Amount:</strong> INR {reports.overdue_amount}</li>
        </ul>
      ) : (
        <p>Loading...</p>
      )}
      </div>
    </div>
  );
}

export default withAuth(ReportsPage);
