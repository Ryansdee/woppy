'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cookie = Cookies.get('woppy_user');
    const isPublic =
      pathname === '/' ||
      pathname.startsWith('/auth/login') ||
      pathname.startsWith('/auth/register');

    if (cookie && isPublic) {
      router.replace('/dashboard');
    }
  }, [pathname, router]);

  return null;
}
