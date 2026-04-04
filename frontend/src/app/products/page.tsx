'use client';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products/').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Navbar />
      <h1>Products</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Type</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Sales Price</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Internal Notes</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{p.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{p.product_type}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{p.sales_price}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{p.internal_notes || '-'}</td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No products found. Add them via API.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default withAuth(ProductsPage);
