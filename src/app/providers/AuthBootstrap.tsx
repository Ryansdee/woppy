'use client';

import useAuthPersistence from '@/lib/useAuthPersistence';

export default function AuthBootstrap() {
  useAuthPersistence(); // met à jour le cookie à chaque changement Firebase
  return null; // rien à afficher
}
