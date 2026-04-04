'use client';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/reports/summary/').then(res => setReports(res.data)).catch(console.error);
    api.get('/products/').then(res => setProducts(res.data)).catch(console.error);
    api.get('/subscriptions/').then(res => setSubs(res.data)).catch(console.error);
  }, []);

  const handleLogout = () => {
    Cookies.remove('access');
    Cookies.remove('refresh');
    router.push('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>SubSphere Administrative Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '5px 10px', background: 'red', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>Logout</button>
      </header>
      
      <div style={{ marginTop: '20px' }}>
         <Navbar />
      </div>

      <main style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <section style={{ flex: 1, border: '1px solid #eee', padding: '10px' }}>
          <h2>Reports Summary</h2>
          {reports ? <pre>{JSON.stringify(reports, null, 2)}</pre> : <p>Loading reports...</p>}
        </section>
        
        <section style={{ flex: 1, border: '1px solid #eee', padding: '10px' }}>
          <h2>Products Catalog</h2>
          {products.map(p => (
            <div key={p.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
              <strong>{p.name}</strong> - INR {p.sales_price}
              <br/><small>{p.product_type} | Recurring: {p.is_recurring ? 'Yes' : 'No'}</small>
            </div>
          ))}
          {products.length === 0 && <p>No products found.</p>}
        </section>

        <section style={{ flex: 1, border: '1px solid #eee', padding: '10px' }}>
          <h2>Recent Subscriptions</h2>
          {subs.map(s => (
            <div key={s.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
              <strong>{s.subscription_number}</strong>
              <br/><small>Status: {s.status}</small>
            </div>
          ))}
          {subs.length === 0 && <p>No subscriptions found.</p>}
        </section>
      </main>
      
      <footer style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p>This minimal dashboard demonstrates that the NextJS frontend can successfully interface with the Django backend APIs.</p>
        <p>Check the Swagger API Docs at <a href="http://localhost:8000/api/docs/" target="_blank">http://localhost:8000/api/docs/</a> for full endpoint tests (Invoices, Discounts, Quotations, Razorpay).</p>
      </footer>
    </div>
  );
}

export default withAuth(Dashboard);
