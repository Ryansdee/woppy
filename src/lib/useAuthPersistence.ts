'use client';

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Cookies from 'js-cookie';

export default function useAuthPersistence() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        Cookies.set(
          'woppy_user',
          JSON.stringify({ uid: user.uid, email: user.email }),
          { expires: 7, sameSite: 'Strict', secure: true }
        );
      } else {
        Cookies.remove('woppy_user');
      }
    });
    return () => unsub();
  }, []);
}
