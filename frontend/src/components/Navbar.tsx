import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px', display: 'flex', gap: '15px' }}>
      <Link href="/dashboard" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>Dashboard</Link>
      <Link href="/products" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>Products</Link>
      <Link href="/plans" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>Plans</Link>
      <Link href="/subscriptions" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>Subscriptions</Link>
      <Link href="/invoices" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>Invoices</Link>
      <Link href="/reports" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>Reports</Link>
    </nav>
  );
}
