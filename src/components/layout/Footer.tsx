'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100">

      {/* ── Contenu principal ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/images/logo.png"
                alt="Logo Woppy"
                width={32}
                height={32}
                className="rounded-xl"
              />
              <span className="font-bold text-xl text-violet-600 tracking-tight"
                style={{ fontFamily: 'Sora, sans-serif' }}>
                woppy
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">
              La plateforme de jobs flexibles pour étudiants à Louvain-la-Neuve.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex gap-3 mt-5">
              <Link href="#"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-violet-100 hover:text-violet-600
                           flex items-center justify-center text-slate-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="#"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-violet-100 hover:text-violet-600
                           flex items-center justify-center text-slate-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Fonctionnalités', href: '/#features' },
                { label: 'Tarifs', href: '/#pricing' },
                { label: 'Démo', href: '/#demo' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Entreprise
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Carrières', href: '/careers' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Légal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'CGU', href: '/terms' },
                { label: 'Confidentialité', href: '/privacy' },
                { label: 'Cookies', href: '/cookies' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © 2025{currentYear > 2025 ? `–${currentYear}` : ''} Woppy. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Louvain-la-Neuve, Belgique
          </div>
        </div>
      </div>
    </footer>
  );
}