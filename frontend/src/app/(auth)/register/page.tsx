'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/', { name, email, password });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Provisioning request failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Left Panel — Brand (Reused from Login) */}
      <div style={{
        flex: '0 0 42%',
        background: 'linear-gradient(165deg, var(--primary) 0%, var(--primary-container) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', bottom: -100, right: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -50, left: -50,
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(255,255,254,0.02)',
          pointerEvents: 'none',
        }} />

        {/* Brand Link (Placeholder or Generic) */}
        <Link href="/" style={{
            fontSize: '1.5rem', fontWeight: 900, color: '#fff', 
            letterSpacing: '-0.5px', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '10px'
        }}>
            Architecture Portal
        </Link>

        {/* Content */}
        <div>
          <h1 className="display-sm" style={{ color: '#fff', maxWidth: '440px', lineHeight: 1.1 }}>
            Join the ecosystem of elite architectural precision.
          </h1>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '20px', maxWidth: '400px', lineHeight: 1.6 }}>
            Request provisioning to access the ledger, manage enterprise subscriptions, and scale your financial operations.
          </p>

          <div style={{ display: 'flex', gap: '48px', marginTop: '48px' }}>
            {[
                { label: 'Latency', value: '<50ms' },
                { label: 'Availability', value: 'Enterprise' }
            ].map((stat, i) => (
                <div key={i}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{stat.label}</div>
                </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '24px' }}>
            {['Security', 'Terms', 'Privacy'].map(link => (
                <Link key={link} href="#" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{link}</Link>
            ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px',
        background: 'var(--surface-container-lowest)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Link href="/" className="label-md" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', marginBottom: '40px', textDecoration: 'none' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span>
            Return to Marketplace
          </Link>

          <h2 className="headline-md">Provisioning Request</h2>
          <p className="body-md text-muted" style={{ marginTop: '4px', marginBottom: '40px' }}>Join the architectural network to begin managing your subscription catalog.</p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
                <label className="form-label">Full Name / Organization</label>
                <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Architectural Ledger Co."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Primary Enterprise Email</label>
                <input 
                    type="email" 
                    className="form-input" 
                    placeholder="architect@company.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">System Access Password</label>
                <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            {error && (
                <div className="badge-error" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '18px' }}>error_outline</span>
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 700, marginTop: '12px', boxShadow: 'var(--shadow-md)' }}
            >
                {loading ? 'Requesting Access...' : 'Submit Provisioning Request'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p className="body-md text-muted">
                Already have access? {' '}
                <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Authorize Identity</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
