'use client';

import Link from 'next/link';
import { ArrowLeft, GraduationCap, Building2, Shield, Star, CheckCircle, MapPin } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white flex">

      {/* ══════════ PANNEAU GAUCHE — branding ══════════ */}
      <div className="hidden lg:flex lg:w-[52%] bg-violet-600 flex-col relative overflow-hidden">

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Gradient overlay bas */}
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-violet-800/60 to-transparent" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="font-bold text-white text-base" style={{ fontFamily: 'Sora, sans-serif' }}>W</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>woppy</span>
          </Link>
        </div>

        {/* Central content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 pb-16">
          <div className="mb-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white/90
                          text-xs font-semibold px-3.5 py-1.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            142 missions disponibles aujourd'hui
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            Retrouvez vos missions<br />et vos candidatures
          </h2>

          <p className="text-violet-200 text-base leading-relaxed mb-10 max-w-sm">
            Connectez-vous pour accéder à votre espace, postuler aux missions disponibles et suivre vos paiements.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mb-10">
            {[
              { value: '1 200+', label: 'Utilisateurs' },
              { value: '4.8/5', label: 'Note moyenne' },
              { value: '210+', label: 'Jobs réalisés' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{s.value}</div>
                <div className="text-violet-300 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 max-w-sm">
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={13} className="text-amber-300 fill-amber-300" />
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              "En un weekend, j'ai gagné 80€ en aidant deux familles. L'app est claire et le paiement arrive vite."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-400 flex items-center justify-center text-white text-xs font-bold">LM</div>
              <div>
                <div className="text-white text-xs font-semibold">Lucas M.</div>
                <div className="text-violet-300 text-[11px]">Étudiant en droit · LLN</div>
              </div>
              <CheckCircle size={14} className="text-green-400 ml-auto" />
            </div>
          </div>
        </div>

        {/* Bottom location tag */}
        <div className="relative z-10 px-12 pb-8">
          <div className="flex items-center gap-1.5 text-violet-300 text-xs">
            <MapPin size={12} />
            Louvain-la-Neuve & alentours, Belgique
          </div>
        </div>
      </div>

      {/* ══════════ PANNEAU DROIT — formulaire ══════════ */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>W</span>
            </div>
            <span className="font-bold text-slate-900 text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>woppy</span>
          </Link>

          {/* Back link (desktop) */}
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-slate-500
                       hover:text-violet-600 transition-colors"
          >
            <ArrowLeft size={15} />
            Retour à l'accueil
          </Link>

          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            Pas encore de compte ?
            <Link href="/auth/register" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              S'inscrire
            </Link>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-[400px]">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1.5 tracking-tight"
                style={{ fontFamily: 'Sora, sans-serif' }}>
                Bon retour sur Woppy
              </h1>
              <p className="text-sm text-slate-500">
                Connectez-vous pour accéder à votre espace.
              </p>
            </div>

            {/* Role tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold
                                 bg-white text-violet-700 rounded-lg py-2.5 shadow-sm transition-all">
                <GraduationCap size={15} /> Étudiant
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium
                                 text-slate-500 hover:text-slate-700 rounded-lg py-2.5 transition-all">
                <Building2 size={15} /> Particulier
              </button>
            </div>

            {/* The actual form component */}
            <LoginForm />

            {/* Trust line */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Shield size={12} className="text-violet-400" />
              Connexion sécurisée · Données chiffrées
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">© {currentYear} Woppy. Tous droits réservés.</p>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/terms" className="hover:text-violet-600 transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-violet-600 transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>

    </div>
  );
}