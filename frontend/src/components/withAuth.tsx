'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function withAuth(WrappedComponent: any) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const token = Cookies.get('access');
      if (!token) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    }, [router]);

    if (!isAuthenticated) return <div>Loading...</div>;

    return <WrappedComponent {...props} />;
  };
}
