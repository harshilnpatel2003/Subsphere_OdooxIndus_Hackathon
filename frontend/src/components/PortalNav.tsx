'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCartCount } from '@/lib/cart';
import Cookies from 'js-cookie';

export default function PortalNav() {
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

  return (
    <nav style={{
        padding:'16px 40px', background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)', 
        borderBottom:'1px solid var(--surface-container)', color:'var(--on-surface)', 
        display:'flex', gap:'32px', alignItems:'center', position: 'sticky', top: 0, zIndex: 900
    }}>
      <Link href="/" style={{color:'var(--primary)', fontWeight: 900, fontSize:'1.5rem', textDecoration:'none', letterSpacing: '-0.5px'}}>SubSphere</Link>
      <div style={{ display: 'flex', gap: '24px', marginLeft: '24px' }}>
        <Link href="/shop" style={{color:'var(--on-surface)', textDecoration:'none', fontWeight: 600, fontSize: '0.9rem'}}>Marketplace</Link>
        <Link href="/orders" style={{color:'var(--on-surface-variant)', textDecoration:'none', fontWeight: 500, fontSize: '0.9rem'}}>My Orders</Link>
      </div>
      
      <div style={{marginLeft:'auto', display: 'flex', alignItems: 'center', gap: '20px'}}>
        {/* <button 
            onClick={toggleCart}
            style={{ 
                background:'none', border:'none', cursor:'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem'
            }}
        >
            <div style={{ position: 'relative' }}>
                <span className="material-icons">shopping_bag</span>
                {count > 0 && (
                    <span style={{
                        position: 'absolute', top: -6, right: -6, background: 'var(--error)', color: 'white',
                        fontSize: '10px', borderRadius: '50%', width: 16, height: 16, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                    }}>{count}</span>
                )}
            </div>
            Cart
        </button> */}

        {loggedIn ? (
            <Link href="/dashboard" style={{
                background: 'var(--secondary-container)', color: 'var(--on-secondary-container)',
                padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem'
            }}>Admin Portal</Link>
        ) : (
            <Link href="/login" style={{color:'var(--primary)', textDecoration:'none', fontWeight: 700}}>Login</Link>
        )}
      </div>
    </nav>
  );
}
