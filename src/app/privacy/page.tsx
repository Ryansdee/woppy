'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, ChevronRight } from 'lucide-react';

const summaryCards = [
  {
    icon: <Lock size={16} />,
    title: 'Données sécurisées',
    desc: 'Vos informations sont chiffrées en transit (HTTPS/TLS) et au repos.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: <Eye size={16} />,
    title: 'Aucune revente',
    desc: 'Woppy ne vend ni ne cède jamais vos données à des tiers commerciaux.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: <UserCheck size={16} />,
    title: 'Contrôle total',
    desc: 'Accédez, modifiez ou supprimez vos données à tout moment sur simple demande.',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
];

const sections = [
  {
    n: "01",
    title: "Introduction",
    content: (
      <>
        <p>Chez Woppy, nous respectons votre vie privée. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.</p>
        <p className="mt-3">Woppy est responsable du traitement de vos données personnelles. Pour toute question, contactez notre responsable données à <a href="mailto:privacy@woppy.be" className="text-violet-600 hover:underline">privacy@woppy.be</a>.</p>
      </>
    ),
  },
  {
    n: "02",
    title: "Données collectées",
    content: (
      <>
        <p>Nous collectons uniquement les données strictement nécessaires au fonctionnement du service :</p>
        <ul className="mt-3 space-y-2">
          {[
            { label: "Données d'inscription", detail: "nom, prénom, adresse e-mail, âge, ville. Votre mot de passe n'est jamais stocké en clair — il est géré exclusivement par Firebase Authentication (hachage sécurisé côté Google)." },
            { label: "Données de profil", detail: "photo de profil, bio, expériences, et pour les étudiants : carte d'identité étudiante transmise pour vérification manuelle uniquement." },
            { label: "Données d'utilisation", detail: "annonces publiées, candidatures, messages échangés, avis reçus et cookies de navigation." },
            { label: "Données de paiement", detail: "intégralement traitées par Stripe. Woppy ne stocke à aucun moment vos coordonnées bancaires ou numéros de carte." },
          ].map(item => (
            <li key={item.label} className="flex items-start gap-2.5">
              <ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600"><strong className="text-slate-800">{item.label} : </strong>{item.detail}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: "03",
    title: "Utilisation des données",
    content: (
      <>
        <p>Vos données sont utilisées exclusivement pour :</p>
        <ul className="mt-3 space-y-1.5">
          {[
            "Création et gestion de votre compte utilisateur",
            "Mise en relation entre Demandeurs et Prestataires",
            "Vérification manuelle des cartes étudiantes",
            "Traitement sécurisé des paiements via Stripe",
            "Envoi de notifications liées à votre activité sur la plateforme",
            "Amélioration de la Plateforme sur base d'analyses anonymisées et agrégées",
          ].map(i => (
            <li key={i} className="flex items-start gap-2.5">
              <ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">{i}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: "04",
    title: "Partage des données",
    content: (
      <>
        <p>Woppy ne vend, ne loue et ne cède jamais vos données personnelles. Nous partageons uniquement les informations nécessaires avec les sous-traitants techniques suivants :</p>
        <div className="mt-3 space-y-2">
          {[
            { name: "Stripe", role: "Traitement sécurisé des paiements" },
            { name: "Google Firebase", role: "Authentification, base de données et stockage des fichiers" },
          ].map(p => (
            <div key={p.name} className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-800">{p.name}</span>
              <span className="text-xs text-slate-500">— {p.role}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">Ces partenaires sont soumis à des engagements contractuels de confidentialité conformes au RGPD.</p>
      </>
    ),
  },
  {
    n: "05",
    title: "Sécurité des données",
    content: (
      <>
        <p>Nous mettons en place les mesures techniques suivantes pour protéger vos données :</p>
        <ul className="mt-3 space-y-1.5">
          {[
            "Chiffrement des données en transit via HTTPS / TLS",
            "Authentification gérée par Firebase Authentication — les mots de passe ne nous parviennent jamais en clair",
            "Accès à la base de données limité au personnel autorisé",
            "Règles de sécurité Firestore et Storage configurées par rôle",
            "Sauvegardes automatiques régulières",
          ].map(i => (
            <li key={i} className="flex items-start gap-2.5">
              <ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">{i}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700 leading-relaxed">Aucun système de sécurité n'est infaillible à 100 %. Nous vous recommandons d'utiliser un mot de passe fort et de ne pas le partager.</p>
        </div>
      </>
    ),
  },
  {
    n: "06",
    title: "Vos droits (RGPD)",
    content: (
      <>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679), vous disposez des droits suivants :</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {[
            { right: "Droit d'accès", detail: "Obtenir une copie de vos données" },
            { right: "Droit de rectification", detail: "Corriger des informations inexactes" },
            { right: "Droit à l'effacement", detail: "Supprimer vos données personnelles" },
            { right: "Droit à la portabilité", detail: "Recevoir vos données dans un format lisible" },
            { right: "Droit d'opposition", detail: "Vous opposer à certains traitements" },
            { right: "Retrait du consentement", detail: "À tout moment, sans frais" },
          ].map(item => (
            <div key={item.right} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-800 mb-0.5">{item.right}</p>
              <p className="text-[11px] text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Pour exercer vos droits : <a href="mailto:privacy@woppy.be" className="text-violet-600 hover:underline font-semibold">privacy@woppy.be</a>. Réponse sous 30 jours.
        </p>
      </>
    ),
  },
  {
    n: "07",
    title: "Conservation et suppression",
    content: (
      <ul className="space-y-1.5">
        {[
          "Les comptes inactifs depuis plus de 24 mois sont supprimés après notification préalable",
          "Les données liées aux transactions sont conservées 10 ans (obligation légale comptable belge)",
          "Les données supprimées à votre demande sont effacées définitivement sous 30 jours",
          "Les cartes étudiantes téléchargées pour vérification sont supprimées après validation",
        ].map(i => (
          <li key={i} className="flex items-start gap-2.5">
            <ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600">{i}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    n: "08",
    title: "Données des mineurs",
    content: (
      <p>L'utilisation de Woppy est réservée aux personnes âgées de 16 ans minimum. Les étudiants mineurs (16–17 ans) doivent obtenir une autorisation parentale écrite avant leur inscription sur la Plateforme. Woppy ne collecte pas sciemment de données de personnes de moins de 16 ans.</p>
    ),
  },
  {
    n: "09",
    title: "Cookies",
    content: (
      <>
        <p>Woppy utilise uniquement des cookies techniques strictement nécessaires au fonctionnement de la Plateforme (session d'authentification, préférences). Nous n'utilisons pas de cookies publicitaires ni de traceurs tiers à des fins de ciblage.</p>
        <p className="mt-2 text-sm text-slate-600">Pour en savoir plus, consultez notre <Link href="/cookies" className="text-violet-600 hover:underline">Politique de cookies</Link>.</p>
      </>
    ),
  },
  {
    n: "10",
    title: "Contact et autorité de contrôle",
    content: (
      <>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {[
            { label: "Données personnelles", value: "privacy@woppy.be", href: "mailto:privacy@woppy.be" },
            { label: "Support général", value: "support@woppy.be", href: "mailto:support@woppy.be" },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <a href={item.href} className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">{item.value}</a>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Autorité de contrôle belge</p>
          <p className="text-sm font-semibold text-slate-800">Autorité de Protection des Données (APD)</p>
          <p className="text-xs text-slate-500 mt-0.5">Rue de la Presse 35, 1000 Bruxelles — <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">autoriteprotectiondonnees.be</a></p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPage() {
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
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="font-bold text-3xl text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'Sora, system-ui' }}>
              Politique de Confidentialité
            </h1>
            <p className="text-slate-500 text-sm mb-1">Woppy — Plateforme d'économie collaborative</p>
            <p className="text-xs text-slate-400">Dernière mise à jour : 4 novembre 2025</p>
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