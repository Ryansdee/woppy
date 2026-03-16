'use client';

import Link from 'next/link';
import { ArrowLeft, Cookie, Settings, Eye, BarChart, Shield, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const summaryCards = [
  {
    icon: <Shield size={15} />,
    title: 'Cookies essentiels',
    desc: 'Indispensables au fonctionnement — toujours actifs.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: <BarChart size={15} />,
    title: 'Cookies analytiques',
    desc: 'Statistiques anonymisées pour améliorer la plateforme.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: <Settings size={15} />,
    title: 'Vous contrôlez',
    desc: 'Gérez ou retirez votre consentement à tout moment.',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
];

const cookieTypes = [
  {
    icon: <Shield size={16} />,
    title: 'Cookies strictement nécessaires',
    badge: 'Toujours actifs',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Ces cookies sont indispensables au fonctionnement de la Plateforme. Sans eux, des fonctionnalités essentielles comme la connexion ou la sécurité ne seraient pas disponibles.',
    examples: [
      { name: 'session_token', detail: 'Maintient votre connexion active (expire à la fermeture du navigateur)' },
      { name: 'csrf_token', detail: 'Protection contre les attaques CSRF — 24 heures' },
      { name: 'cookie_consent', detail: 'Mémorise vos préférences de cookies — 1 an' },
    ],
  },
  {
    icon: <Settings size={16} />,
    title: 'Cookies fonctionnels',
    badge: 'Recommandés · Désactivables',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: "Ces cookies améliorent l'expérience en mémorisant vos préférences d'affichage et vos dernières actions sur la Plateforme.",
    examples: [
      { name: 'user_preferences', detail: 'Sauvegarde vos préférences de filtres et d\'affichage — 6 mois' },
      { name: 'recent_searches', detail: 'Mémorise vos dernières recherches — 30 jours' },
      { name: 'tour_completed', detail: 'Indique si vous avez terminé l\'onboarding — permanent' },
    ],
  },
  {
    icon: <BarChart size={16} />,
    title: 'Cookies analytiques',
    badge: 'Optionnels · Désactivables',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    desc: 'Ces cookies nous aident à comprendre comment la Plateforme est utilisée, grâce à des données anonymisées et agrégées. Aucune donnée n\'est utilisée pour vous identifier personnellement.',
    examples: [
      { name: '_ga / _gid', detail: 'Google Analytics — mesure d\'audience anonymisée (2 ans / 24h)' },
    ],
    note: 'Les données analytiques sont strictement anonymisées. Elles ne permettent jamais de vous identifier.',
  },
  {
    icon: <Eye size={16} />,
    title: 'Cookies marketing',
    badge: 'Non utilisés actuellement',
    badgeColor: 'bg-slate-100 text-slate-500 border-slate-200',
    desc: 'Woppy n\'utilise actuellement aucun cookie publicitaire ou de remarketing. Cette catégorie ne sera activée qu\'avec votre consentement explicite et en cas de besoin futur.',
    examples: [],
    note: 'En accord avec notre positionnement de plateforme collaborative, nous ne revendons pas vos données et ne ciblons pas d\'audience publicitaire.',
    noteColor: 'bg-amber-50 border-amber-200 text-amber-700',
  },
];

const sections = [
  {
    n: "01",
    title: "Qu'est-ce qu'un cookie ?",
    content: (
      <>
        <p>Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lors de votre visite sur un site web. Les cookies permettent au site de mémoriser vos actions et préférences sur une période donnée.</p>
        <p className="mt-3">Les cookies ne contiennent pas de code exécutable et ne peuvent pas accéder aux données de votre appareil. Ils facilitent votre navigation et améliorent votre expérience.</p>
        <div className="mt-4 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-violet-700 mb-1">À noter</p>
          <p className="text-xs text-violet-700 leading-relaxed">Cette politique couvre également les technologies similaires : stockage local (localStorage / sessionStorage) utilisé pour les sessions et préférences d'interface.</p>
        </div>
      </>
    ),
  },
  {
    n: "02",
    title: "Pourquoi utilisons-nous des cookies ?",
    content: (
      <>
        <p>Woppy utilise des cookies pour :</p>
        <ul className="mt-3 space-y-1.5">
          {[
            "Assurer le bon fonctionnement de la Plateforme et la sécurité des sessions",
            "Maintenir votre connexion active entre les pages",
            "Mémoriser vos préférences d'affichage et de filtres",
            "Analyser l'utilisation du site de façon anonymisée afin de l'améliorer",
          ].map(i => (
            <li key={i} className="flex items-start gap-2.5">
              <ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">{i}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-600">Nous n'utilisons pas de cookies à des fins publicitaires, de remarketing ou de profilage commercial.</p>
      </>
    ),
  },
  {
    n: "03",
    title: "Types de cookies utilisés",
    content: (
      <div className="space-y-4">
        {cookieTypes.map(ct => (
          <div key={ct.title} className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  {ct.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Sora, system-ui' }}>{ct.title}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${ct.badgeColor}`}>{ct.badge}</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">{ct.desc}</p>
              {ct.examples.length > 0 && (
                <div className="space-y-1.5">
                  {ct.examples.map(ex => (
                    <div key={ex.name} className="flex items-start gap-2.5 text-xs text-slate-500">
                      <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] shrink-0">{ex.name}</code>
                      <span>{ex.detail}</span>
                    </div>
                  ))}
                </div>
              )}
              {ct.note && (
                <div className={`px-3 py-2.5 rounded-xl border text-xs leading-relaxed ${ct.noteColor || 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                  {ct.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "04",
    title: "Cookies tiers",
    content: (
      <>
        <p>Certains cookies sont déposés par nos sous-traitants techniques :</p>
        <div className="mt-3 space-y-2">
          {[
            { name: "Google Firebase", role: "Gestion de l'authentification et stockage des données", link: "https://firebase.google.com/support/privacy", linkLabel: "firebase.google.com/support/privacy" },
            { name: "Google Analytics", role: "Mesure d'audience anonymisée (si activé)", link: "https://policies.google.com/privacy", linkLabel: "policies.google.com/privacy" },
            { name: "Stripe", role: "Traitement des paiements sécurisés", link: "https://stripe.com/privacy", linkLabel: "stripe.com/privacy" },
          ].map(p => (
            <div key={p.name} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.role}</p>
                </div>
                <a href={p.link} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-violet-600 hover:underline shrink-0">{p.linkLabel}</a>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">Ces partenaires sont soumis à des engagements contractuels de confidentialité conformes au RGPD.</p>
      </>
    ),
  },
  {
    n: "05",
    title: "Gérer vos préférences",
    content: (
      <>
        <p className="font-semibold text-slate-800 text-sm mb-2">Via votre navigateur</p>
        <p className="text-sm text-slate-600 mb-3">Vous pouvez gérer ou supprimer les cookies directement depuis les paramètres de votre navigateur :</p>
        <div className="space-y-1.5">
          {[
            { browser: "Chrome", path: "Paramètres → Confidentialité et sécurité → Cookies" },
            { browser: "Firefox", path: "Options → Vie privée et sécurité → Cookies" },
            { browser: "Safari", path: "Préférences → Confidentialité → Cookies" },
            { browser: "Edge", path: "Paramètres → Cookies et autorisations de site" },
          ].map(b => (
            <div key={b.browser} className="flex items-start gap-2.5 text-sm text-slate-600">
              <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] shrink-0">{b.browser}</code>
              <span className="text-slate-500">{b.path}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700 leading-relaxed">Le blocage des cookies essentiels peut affecter le fonctionnement de Woppy, notamment la connexion à votre compte.</p>
        </div>
      </>
    ),
  },
  {
    n: "06",
    title: "Durée de conservation",
    content: (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Durée</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ["Cookies de session", "Supprimés à la fermeture du navigateur"],
              ["Cookies essentiels", "24 heures à 1 an"],
              ["Cookies fonctionnels", "30 jours à 1 an"],
              ["Cookies analytiques", "24 heures à 2 ans"],
              ["Cookies marketing", "Non utilisés actuellement"],
            ].map(([type, duration]) => (
              <tr key={type} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-slate-800 font-medium">{type}</td>
                <td className="px-4 py-3 text-slate-500">{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    n: "07",
    title: "Mises à jour de cette politique",
    content: (
      <p>Nous pouvons mettre à jour cette Politique des Cookies pour refléter les évolutions de nos pratiques ou de la législation. La date de dernière mise à jour est indiquée en haut de cette page. Toute modification significative fera l'objet d'une notification.</p>
    ),
  },
  {
    n: "08",
    title: "Contact",
    content: (
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { label: "Données & cookies", value: "privacy@woppy.be", href: "mailto:privacy@woppy.be" },
          { label: "Support général", value: "support@woppy.be", href: "mailto:support@woppy.be" },
        ].map(item => (
          <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <a href={item.href} className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">{item.value}</a>
          </div>
        ))}
        <div className="sm:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Autorité de contrôle belge</p>
          <p className="text-sm font-semibold text-slate-800">Autorité de Protection des Données (APD)</p>
          <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer"
            className="text-xs text-violet-600 hover:underline">autoriteprotectiondonnees.be</a>
        </div>
      </div>
    ),
  },
];

export default function CookiesPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');`}</style>

      <main className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Navbar ── */}
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="Logo Woppy" width={28} height={28} className="rounded-xl" />
              <span className="font-bold text-lg text-violet-600" style={{ fontFamily: 'Sora, system-ui' }}>woppy</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors font-medium">
              <ArrowLeft size={15} /> Retour à l'accueil
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="pt-24 pb-10 px-6 bg-slate-50 border-b border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Cookie className="text-white" size={24} />
            </div>
            <h1 className="font-bold text-3xl text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'Sora, system-ui' }}>
              Politique des Cookies
            </h1>
            <p className="text-slate-500 text-sm mb-1">Woppy — Plateforme d'économie collaborative</p>
            <p className="text-xs text-slate-400">Dernière mise à jour : 25 octobre 2025</p>
          </div>
        </section>

        {/* ── Summary cards ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">En bref</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {summaryCards.map(card => (
                <div key={card.title} className={`flex items-start gap-3 border rounded-xl p-4 ${card.color}`}>
                  <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-0.5">{card.title}</p>
                    <p className="text-[11px] leading-relaxed opacity-80">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TOC ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sommaire</p>
            <div className="grid sm:grid-cols-2 gap-1">
              {sections.map(s => (
                <a key={s.n} href={`#section-${s.n}`}
                  className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-violet-600 py-1.5 transition-colors group">
                  <span className="text-[11px] font-bold text-slate-300 group-hover:text-violet-300 w-6 shrink-0">{s.n}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="py-10 px-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {sections.map(s => (
              <div key={s.n} id={`section-${s.n}`}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden scroll-mt-20">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
                  <span className="text-[11px] font-bold text-violet-400 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full shrink-0">
                    {s.n}
                  </span>
                  <h2 className="font-bold text-sm text-slate-900" style={{ fontFamily: 'Sora, system-ui' }}>
                    {s.title}
                  </h2>
                </div>
                <div className="px-6 py-5 text-sm text-slate-600 leading-relaxed">
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}