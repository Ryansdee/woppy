'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Scale, ChevronRight } from 'lucide-react';

const sections = [
  {
    n: "01",
    title: "Acceptation des conditions",
    content: (
      <>
        <p>En accédant à la plateforme Woppy, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.</p>
        <p className="mt-3">Woppy se réserve le droit de modifier ces CGU à tout moment. Les nouvelles versions sont applicables dès leur publication sur la Plateforme.</p>
      </>
    ),
  },
  {
    n: "02",
    title: "Nature du service — économie collaborative",
    content: (
      <>
        <p>Woppy est une <strong>plateforme d'économie collaborative</strong> qui met en relation des particuliers (« Demandeurs ») et des étudiants (« Prestataires ») pour des <strong>missions ponctuelles et de courte durée</strong> — en règle générale inférieures à 3–5 heures.</p>
        <p className="mt-3"><strong>Woppy n'est pas une agence d'intérim.</strong> Woppy ne fournit aucun service de placement, ne conclut aucun contrat de travail et n'intervient pas en qualité d'employeur. Les relations contractuelles se nouent directement et librement entre utilisateurs ; Woppy agit uniquement en tant qu'intermédiaire technique.</p>
        <p className="mt-3">Ce modèle repose sur le régime belge du <strong>travail étudiant occasionnel</strong> : tant que les revenus annuels de l'étudiant ne dépassent pas le plafond légal (7 460 € en 2025), aucune cotisation patronale ONSS ordinaire n'est due, ce qui permet une structure tarifaire transparente et équitable :</p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            { label: "Montant facturé au Demandeur", value: "14 €/h", sub: "ex. pour une heure" },
            { label: "Montant perçu par l'étudiant", value: "13 €/h", sub: "≈ 93 % reversé" },
            { label: "Frais de plateforme", value: "< 10 %", sub: "vs 20–30 % en intérim" },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className="text-xl font-bold text-violet-700" style={{ fontFamily: 'Sora, system-ui' }}>{item.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">Les services fournis par Woppy comprennent :</p>
        <ul className="mt-2 space-y-1.5 pl-4">
          {["Publication d'annonces et gestion des candidatures", "Messagerie intégrée entre utilisateurs", "Paiement sécurisé via Stripe avec protection séquestre"].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: "03",
    title: "Missions éligibles",
    content: (
      <>
        <p>Pour maintenir le cadre légal de l'économie collaborative et du travail étudiant, seules les missions respectant les critères suivants sont autorisées sur Woppy :</p>
        <ul className="mt-3 space-y-1.5 pl-4">
          {[
            "Durée maximale recommandée : 3 à 5 heures par mission",
            "Nature ponctuelle et non récurrente (pas de relation de travail continue)",
            "Activités de la vie quotidienne : déménagement, jardinage, bricolage, aide informatique, cours particuliers, livraison, nettoyage, garde d'animaux, etc.",
            "Rémunération brute annuelle de l'étudiant inférieure au plafond légal belge (7 460 €/an en 2025)",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
        <p className="mt-4">Les missions de longue durée, à caractère permanent ou assimilables à un emploi salarié régulier sont expressément exclues de la Plateforme. Woppy se réserve le droit de supprimer toute annonce ne respectant pas ce cadre.</p>
      </>
    ),
  },
  {
    n: "04",
    title: "Inscription et vérification",
    content: (
      <>
        <p>L'inscription est gratuite. Les étudiants souhaitant accéder au statut Prestataire doivent fournir une photo de leur carte étudiante en cours de validité. Chaque carte est vérifiée manuellement par notre équipe avant activation.</p>
        <ul className="mt-3 space-y-1.5 pl-4">
          {[
            "Les informations fournies doivent être exactes et à jour",
            "Un seul compte par personne physique est autorisé",
            "Les tentatives de fraude ou d'usurpation d'identité entraînent une suspension immédiate et définitive",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: "05",
    title: "Obligations des utilisateurs",
    content: (
      <>
        <p className="font-semibold text-slate-800 text-sm mb-2">5.1 — Demandeurs (particuliers)</p>
        <ul className="space-y-1.5 pl-4 mb-4">
          {[
            "Publier des annonces légales, précises et conformes au cadre collaboratif de la Plateforme",
            "Respecter la rémunération publiée et validée au moment de l'acceptation",
            "Ne pas proposer de missions contournant le cadre légal du travail étudiant",
            "Ne pas effectuer de paiements hors plateforme",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
        <p className="font-semibold text-slate-800 text-sm mb-2">5.2 — Prestataires (étudiants)</p>
        <ul className="space-y-1.5 pl-4">
          {[
            "Effectuer les missions avec sérieux et professionnalisme",
            "Respecter la législation belge sur le travail étudiant et surveiller son plafond annuel (7 460 €)",
            "Ne pas annuler une mission acceptée sans motif valable et sans prévenir le Demandeur",
            "Ne pas accepter de paiements hors plateforme",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: "06",
    title: "Paiements et transparence tarifaire",
    content: (
      <>
        <p>Tous les paiements transitent exclusivement par <strong>Stripe</strong>. Le montant réglé par le Demandeur est bloqué en séquestre jusqu'à la validation mutuelle de la mission, puis reversé à l'étudiant dans les 2 à 5 jours ouvrables.</p>
        <p className="mt-3">La structure tarifaire de Woppy est volontairement transparente et réduite :</p>
        <ul className="mt-2 space-y-1.5 pl-4">
          {[
            "Les frais de plateforme sont inférieurs à 10 % du montant de la transaction",
            "Ce taux inclut les frais de traitement Stripe, la vérification des profils et la maintenance de la Plateforme",
            "À titre de comparaison, les agences d'intérim prélèvent généralement entre 20 % et 35 %",
            "Les paiements hors plateforme sont strictement interdits et entraînent la suspension du compte",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    n: "07",
    title: "Responsabilité",
    content: (
      <>
        <p>Woppy agit exclusivement en qualité d'intermédiaire technique et ne peut être tenue responsable :</p>
        <ul className="mt-2 space-y-1.5 pl-4">
          {[
            "De la qualité ou du résultat des prestations réalisées",
            "Des litiges entre Demandeurs et Prestataires",
            "Des accidents, dommages ou retards liés à l'exécution des missions",
            "Des interruptions temporaires du service pour raisons techniques",
            "Des conséquences fiscales ou sociales pour les utilisateurs ayant dépassé les plafonds légaux",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
        <p className="mt-3">La responsabilité de Woppy est en tout état de cause limitée au montant des frais de plateforme perçus sur la transaction concernée.</p>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">Avertissement fiscal important</p>
          <p className="text-xs text-amber-700 leading-relaxed">Il appartient à chaque Prestataire de vérifier qu'il ne dépasse pas le plafond légal annuel du travail étudiant (7 460 € en 2025). Au-delà de ce seuil, des cotisations sociales ordinaires peuvent s'appliquer. Woppy ne peut pas être tenu responsable des conséquences d'un dépassement.</p>
        </div>
      </>
    ),
  },
  {
    n: "08",
    title: "Système de notation et avis",
    content: (
      <p>Après chaque mission validée, les deux parties peuvent se noter de 1 à 5 étoiles et laisser un commentaire. Les avis doivent être honnêtes, respectueux et basés sur des expériences réelles. Les avis abusifs, diffamatoires ou frauduleux seront supprimés et pourront entraîner la suspension du compte concerné.</p>
    ),
  },
  {
    n: "09",
    title: "Données personnelles",
    content: (
      <p>Woppy respecte le Règlement Général sur la Protection des Données (RGPD — UE 2016/679). Les données collectées sont strictement limitées à ce qui est nécessaire au fonctionnement du service et ne sont jamais vendues ni cédées à des tiers à des fins commerciales. Pour toute demande relative à vos données, contactez <a href="mailto:privacy@woppy.be" className="text-violet-600 hover:underline">privacy@woppy.be</a>.</p>
    ),
  },
  {
    n: "10",
    title: "Résiliation",
    content: (
      <>
        <p>Vous pouvez demander la suppression de votre compte à tout moment en écrivant à <a href="mailto:support@woppy.be" className="text-violet-600 hover:underline">support@woppy.be</a>.</p>
        <p className="mt-2">Woppy se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU, de fraude avérée, de dépassement manifeste du cadre collaboratif, ou d'inactivité supérieure à 24 mois.</p>
      </>
    ),
  },
  {
    n: "11",
    title: "Droit applicable",
    content: (
      <p>Les présentes CGU sont régies par le droit belge. Tout litige relatif à leur interprétation ou à leur exécution sera soumis à la compétence exclusive des tribunaux de Nivelles (Brabant wallon), Belgique.</p>
    ),
  },
  {
    n: "12",
    title: "Contact",
    content: (
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { label: "Adresse", value: "Louvain-la-Neuve, Brabant wallon, Belgique" },
          { label: "Juridique", value: "legal@woppy.be", href: "mailto:legal@woppy.be" },
          { label: "Support", value: "support@woppy.be", href: "mailto:support@woppy.be" },
          { label: "Données personnelles", value: "privacy@woppy.be", href: "mailto:privacy@woppy.be" },
        ].map(item => (
          <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            {item.href
              ? <a href={item.href} className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">{item.value}</a>
              : <p className="text-sm text-slate-700">{item.value}</p>
            }
          </div>
        ))}
      </div>
    ),
  },
];

export default function TermsPage() {
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
            <Link href="/"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors font-medium">
              <ArrowLeft size={15} /> Retour à l'accueil
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="pt-24 pb-12 px-6 bg-slate-50 border-b border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Scale className="text-white" size={24} />
            </div>
            <h1 className="font-bold text-3xl text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'Sora, system-ui' }}>
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-slate-500 text-sm mb-1">Woppy — Plateforme d'économie collaborative</p>
            <p className="text-xs text-slate-400">Dernière mise à jour : 4 novembre 2025</p>

            {/* Key differentiator */}
            <div className="mt-6 inline-flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 text-left max-w-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1.5" />
              <p className="text-sm text-violet-800 leading-relaxed">
                Woppy n'est <strong>pas une agence d'intérim</strong>. Notre modèle d'économie collaborative permet de reverser jusqu'à <strong>93 % du montant</strong> à l'étudiant, contre 65–80 % en intérim classique.
              </p>
            </div>
          </div>
        </section>

        {/* ── TOC ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-6">
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
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((s, i) => (
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