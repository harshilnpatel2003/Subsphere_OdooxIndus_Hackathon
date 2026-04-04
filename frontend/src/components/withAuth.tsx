'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';

export default function withAuth(WrappedComponent: any) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = Cookies.get('access');
        if (!token) {
          router.push('/login');
          return;
        }

        const adminRoutes = ['/dashboard', '/plans', '/subscriptions', '/products', '/invoices', '/reports', '/users', '/profile'];
        const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

        if (isAdminRoute) {
          try {
            const res = await api.get('/users/me/');
            const role = res.data.role;
            if (role === 'admin' || role === 'internal_user') {
              setIsAuthorized(true);
            } else {
              router.push('/');
              return;
            }
          } catch (err) {
            router.push('/login');
          }
        } else {
          setIsAuthorized(true);
        }
        setLoading(false);
      };

      checkAuth();
    }, [router, pathname]);

    if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading authorization...</div>;
    if (!isAuthorized) return null; // Redirecting..

    return <WrappedComponent {...props} />;
  };
}
