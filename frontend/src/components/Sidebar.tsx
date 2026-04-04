'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const navItems = [
  { href: '/dashboard',     icon: 'dashboard',      label: 'Dashboard' },
  { href: '/plans',         icon: 'description',    label: 'Templates' },
  { href: '/subscriptions', icon: 'subscriptions',  label: 'Subscriptions' },
  { href: '/products',      icon: 'auto_stories',   label: 'Catalog' },
  { href: '/invoices',      icon: 'receipt_long',   label: 'Invoices' },
  { href: '/reports',       icon: 'assessment',     label: 'Reports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    Cookies.remove('access');
    Cookies.remove('refresh');
    router.push('/login');
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-container) 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
          SubSphere
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginTop: 2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Enterprise Ledger
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'background 0.15s ease, color 0.15s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span className="material-icons" style={{ fontSize: 18, color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 12px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          href="#"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '2px',
          }}
        >
          <span className="material-icons" style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>help_outline</span>
          Support
        </Link>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem',
            background: 'transparent', border: 'none', width: '100%', cursor: 'pointer',
          }}
        >
          <span className="material-icons" style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>logout</span>
          Sign Out
        </button>

        {/* User pill */}
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--secondary-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--on-secondary-container)',
            flexShrink: 0,
          }}>A</div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>Alex Sterling</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>FinOps Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
