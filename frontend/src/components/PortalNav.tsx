'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCartCount } from '@/lib/cart';
import Cookies from 'js-cookie';

export default function PortalNav() {
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => { setCount(getCartCount()); setLoggedIn(!!Cookies.get('access')); }, []);
  return (
    <nav style={{padding:'10px 20px',background:'#222',color:'#fff',display:'flex',gap:'20px',alignItems:'center'}}>
      <Link href="/" style={{color:'#fff',fontWeight:'bold',fontSize:'1.2em',textDecoration:'none'}}>SubSphere</Link>
      <Link href="/shop" style={{color:'#ccc',textDecoration:'none'}}>Shop</Link>
      <Link href="/orders" style={{color:'#ccc',textDecoration:'none'}}>My Orders</Link>
      <Link href="/account" style={{color:'#ccc',textDecoration:'none'}}>Account</Link>
      <Link href="/cart" style={{color:'#ccc',textDecoration:'none'}}>Cart ({count})</Link>
      <div style={{marginLeft:'auto'}}>
        {loggedIn ? <Link href="/dashboard" style={{color:'#ccc',textDecoration:'none'}}>Admin</Link> : <Link href="/login" style={{color:'#ccc',textDecoration:'none'}}>Login</Link>}
      </div>
    </nav>
  );
}
