'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] flex flex-col">
      {/* Navigation minimale */}
      <nav className="p-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Retour à l'accueil</span>
        </Link>
      </nav>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <LoginForm />
      </div>

      {/* Footer minimaliste */}
      <footer className="p-6 text-center text-sm text-gray-500">
        <p>© 2025 Woppy. Tous droits réservés.</p>
      </footer>
    </div>
  );
}