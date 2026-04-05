'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCartCount } from '@/lib/cart';
import Cookies from 'js-cookie';

export default function PortalNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setCount(getCartCount());
    // Initial auth check
    const token = Cookies.get('access');
    setLoggedIn(!!token);

    const interval = setInterval(() => setCount(getCartCount()), 1000);
    return () => clearInterval(interval);
  }, []);

  // CRITICAL: Close the dropdown menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    // Explicitly clear cookies with path root
    Cookies.remove('access', { path: '/' });
    Cookies.remove('refresh', { path: '/' });
    // Full reload to clear internal state and redirect
    window.location.href = '/login';
  };

  const navLinkStyle = (active: boolean) => ({
    color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
    textDecoration: 'none',
    fontWeight: active ? 700 : 500,
    fontSize: '0.875rem',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  });

  const loginButtonStyle = {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.9rem',
    padding: '8px 24px',
    border: '2px solid var(--primary)',
    borderRadius: 'var(--radius-md)'
  };

  return (
    <nav style={{
      padding: '0 40px',
      height: '72px',
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: '1px solid var(--surface-container)',
      color: 'var(--on-surface)',
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Link href="/" style={{
        color: 'var(--primary)',
        fontWeight: 900,
        fontSize: '1.5rem',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
        marginRight: '48px'
      }}>
        SubSphere
      </Link>

      <div style={{ display: 'flex', gap: '32px' }}>
        <Link href="/shop" style={navLinkStyle(pathname === '/shop')}>
          <span className="material-icons" style={{ fontSize: 18 }}>storefront</span>
          Marketplace
        </Link>
        <Link href="/orders" style={navLinkStyle(pathname === '/orders')}>
          <span className="material-icons" style={{ fontSize: 18 }}>history</span>
          My Orders
        </Link>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>

        {loggedIn ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'var(--surface-container-low)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '100px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: 'var(--on-surface)'
                }}
              >
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 24 }}>account_circle</span>
                <span className="material-icons" style={{ fontSize: 18 }}>{menuOpen ? 'expand_less' : 'expand_more'}</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '200px',
                  background: '#fff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid var(--surface-container)',
                  padding: '8px',
                  zIndex: 1000
                }}>
                  <Link href="/account" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    textDecoration: 'none',
                    color: 'var(--on-surface)',
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>person</span> My Profile
                  </Link>

                  <div style={{ height: '1px', background: 'var(--surface-container)', margin: '4px 0' }} />

                  <button
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>logout</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link href="/login" style={loginButtonStyle}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}