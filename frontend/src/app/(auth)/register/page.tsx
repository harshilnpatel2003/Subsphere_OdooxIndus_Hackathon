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
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>

      {/* Left Panel — Brand */}
      <div style={{
        flex: '0 0 44%',
        background: 'linear-gradient(160deg, var(--primary) 0%, var(--primary-container) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', bottom: -120, right: -120,
          width: 480, height: 480, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.015em' }}>SubSphere</div>
        </div>

        {/* Tagline */}
        <div>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800, color: '#fff',
            lineHeight: 1.15, letterSpacing: '-0.025em', maxWidth: 420, marginBottom: 16,
          }}>
            Join the architectural standard.
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)', maxWidth: 380, lineHeight: 1.6 }}>
            Create your account to start managing your enterprise subscription ecosystem with precision and scale.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginTop: 40 }}>
            {[['99.9%', 'Uptime'], ['4.2M', 'Transactions']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: 24 }}>
          {['Security', 'Terms', 'Privacy'].map(l => (
            <Link key={l} href="#" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{l}</Link>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48,
        background: 'var(--surface-container-lowest)',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.8125rem', color: 'var(--on-surface-variant)',
            marginBottom: 40,
          }}>
            <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
            Return Home
          </Link>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6, letterSpacing: '-0.015em' }}>
            Initialize Account
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 32 }}>
            Register your credentials to access the management portal.
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@company.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--error-container)', color: 'var(--error)',
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem', fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '13px 20px', justifyContent: 'center', marginTop: 4, fontSize: '0.9375rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing…' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: '0.8125rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--primary-container)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
