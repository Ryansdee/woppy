'use client';

import Link from 'next/link';
import { ArrowLeft, GraduationCap, Building2, Shield, CheckCircle, MapPin, Briefcase, Users, CreditCard } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white flex">

      {/* ══════════ PANNEAU GAUCHE — branding ══════════ */}
      <div className="hidden lg:flex lg:w-[48%] bg-slate-950 flex-col relative overflow-hidden">

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Violet glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-800/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="font-bold text-white text-base" style={{ fontFamily: 'Sora, sans-serif' }}>W</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>woppy</span>
          </Link>
        </div>

        {/* Central content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 pb-10">

          <div className="mb-4 inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30
                          text-violet-300 text-xs font-semibold px-3.5 py-1.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Inscription gratuite · Sans CV requis
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            Rejoins des centaines<br />d'étudiants vérifiés
          </h2>

          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Crée ton profil en quelques minutes et accède aux missions locales autour de Louvain-la-Neuve.
          </p>

          {/* Feature list */}
          <div className="space-y-4 mb-10">
            {[
              { icon: <GraduationCap size={16} />, label: 'Profil étudiant vérifié manuellement', color: 'text-violet-400' },
              { icon: <Briefcase size={16} />, label: "142 missions disponibles aujourd'hui", color: 'text-violet-400' },
              /*{ icon: <CreditCard size={16} />, label: 'Paiements sécurisés via Stripe', color: 'text-violet-400' },*/
              { icon: <Users size={16} />, label: 'Communauté locale & de confiance', color: 'text-violet-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                  {item.icon}
                </div>
                <span className="text-slate-300 text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Two profiles card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <GraduationCap size={20} className="text-violet-400 mb-2" />
              <div className="text-white text-sm font-bold mb-1">Étudiant</div>
              <div className="text-slate-400 text-xs leading-relaxed">Postule aux missions et gagne jusqu'à 18€/h</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <Building2 size={20} className="text-violet-400 mb-2" />
              <div className="text-white text-sm font-bold mb-1">Particulier</div>
              <div className="text-slate-400 text-xs leading-relaxed">Trouve de l'aide pour tes missions du quotidien</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-12 pb-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <MapPin size={11} />
            Louvain-la-Neuve & alentours
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Shield size={11} />
            Données chiffrées
          </div>
        </div>
      </div>

      {/* ══════════ PANNEAU DROIT — formulaire ══════════ */}
      <div className="flex-1 flex flex-col min-w-0">

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
            Déjà un compte ?
            <Link href="/auth/login"
              className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Se connecter
            </Link>
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-start px-8 py-10 min-h-full">
            <div className="w-full max-w-[560px]">

              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900 mb-1.5 tracking-tight"
                  style={{ fontFamily: 'Sora, sans-serif' }}>
                  Créer mon compte
                </h1>
                <p className="text-sm text-slate-500">
                  Gratuit · Vérifié manuellement · Prêt en 2 minutes.
                </p>
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { icon: <CheckCircle size={12} />, label: 'Sans CV' },
                  { icon: <Shield size={12} />, label: 'Vérification manuelle' },
                  /*{ icon: <CreditCard size={12} />, label: 'Paiement Stripe' },*/
                ].map(chip => (
                  <div key={chip.label}
                    className="flex items-center gap-1.5 bg-violet-50 border border-violet-100
                               text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {chip.icon} {chip.label}
                  </div>
                ))}
              </div>

              {/* The actual form wizard */}
              <RegisterForm />

              {/* Trust line */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Shield size={12} className="text-violet-400" />
                Inscription sécurisée · Aucune carte bancaire requise
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between shrink-0">
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