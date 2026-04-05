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

  useEffect(() => { 
    setCount(getCartCount()); 
    setLoggedIn(!!Cookies.get('access')); 
    
    // Listen for cart changes to update count
    const interval = setInterval(() => setCount(getCartCount()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('toggle-cart'));
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
      
      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '24px'}}>

        {loggedIn ? (
            <Link href="/dashboard" className="btn btn-secondary" style={{
                padding: '10px 20px', 
                borderRadius: 'var(--radius-lg)', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span className="material-icons" style={{ fontSize: 18 }}>admin_panel_settings</span>
                Admin Portal
            </Link>
        ) : (
            <Link href="/login" style={{
                color: 'var(--primary)', 
                textDecoration: 'none', 
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '8px 16px',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius-md)'
            }}>Login</Link>
        )}
      </div>
    </nav>
  );
}
