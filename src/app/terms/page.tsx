'use client';

import { ChevronRight } from 'lucide-react';

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
          ].map(item => (
            <div key={item.label} className="bg-paper-2 border border-line rounded-xl p-4 text-center">
              <p className="text-xs text-muted mb-1">{item.label}</p>
              <p className="text-xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>{item.value}</p>
              <p className="text-[11px] text-muted mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">Les services fournis par Woppy comprennent :</p>
        <ul className="mt-2 space-y-1.5 pl-4">
          {["Publication d'annonces et gestion des candidatures", "Messagerie intégrée entre utilisateurs"].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2"><ChevronRight size={14} className="text-brand shrink-0 mt-0.5" />{i}</li>
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
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2"><ChevronRight size={14} className="text-brand shrink-0 mt-0.5" />{i}</li>
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
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2"><ChevronRight size={14} className="text-brand shrink-0 mt-0.5" />{i}</li>
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
        <p className="font-semibold text-ink text-sm mb-2">5.1 — Demandeurs (particuliers)</p>
        <ul className="space-y-1.5 pl-4 mb-4">
          {[
            "Publier des annonces légales, précises et conformes au cadre collaboratif de la Plateforme",
            "Respecter la rémunération publiée et validée au moment de l'acceptation",
            "Ne pas proposer de missions contournant le cadre légal du travail étudiant",
            "Ne pas effectuer de paiements hors plateforme",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2"><ChevronRight size={14} className="text-brand shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
        <p className="font-semibold text-ink text-sm mb-2">5.2 — Prestataires (étudiants)</p>
        <ul className="space-y-1.5 pl-4">
          {[
            "Effectuer les missions avec sérieux et professionnalisme",
            "Respecter la législation belge sur le travail étudiant et surveiller son plafond annuel (7 460 €)",
            "Ne pas annuler une mission acceptée sans motif valable et sans prévenir le Demandeur",
            "Ne pas accepter de paiements hors plateforme",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2"><ChevronRight size={14} className="text-brand shrink-0 mt-0.5" />{i}</li>
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
        <p>La rémunération de chaque mission est fixée par le Demandeur et affichée dans l'annonce avant toute candidature.</p>
        <p className="mt-3">Pendant la phase de lancement :</p>
        <ul className="mt-2 space-y-1.5 pl-4">
          {[
            "Le paiement de la mission est réglé directement entre le Demandeur et l'étudiant, une fois la mission terminée",
            "Woppy n'intervient pas dans cette transaction et ne prélève actuellement aucune commission",
            "L'utilisation de la Plateforme est gratuite pour les Demandeurs comme pour les étudiants",
            "Si Woppy introduit un système de paiement intégré ou des frais de service, les utilisateurs en seront informés avant leur entrée en vigueur",
          ].map(i => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2"><ChevronRight size={14} className="text-brand shrink-0 mt-0.5" />{i}</li>
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
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2"><ChevronRight size={14} className="text-brand shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
        <p className="mt-3">La responsabilité de Woppy est en tout état de cause limitée au montant des frais de plateforme perçus sur la transaction concernée.</p>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">Avertissement fiscal important</p>
          <p className="text-xs text-amber-700 leading-relaxed">Les missions réalisées par des étudiants relèvent du régime belge du <strong>travail étudiant</strong> : chaque étudiant dispose d'un quota annuel de 650 heures soumises à une cotisation de solidarité réduite. Au-delà, les cotisations sociales ordinaires s'appliquent. Les revenus perçus peuvent également avoir un impact sur la fiscalité de l'étudiant et sur son statut de personne à charge. Il appartient à chaque étudiant de vérifier sa situation sur la plateforme officielle <a href="https://www.studentatwork.be/fr/quota-heures-et-impact.html" target="_blank" rel="noopener noreferrer" className="text-brand underline">Student@Work</a>.</p>
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
      <p>Woppy respecte le Règlement Général sur la Protection des Données (RGPD — UE 2016/679). Les données collectées sont strictement limitées à ce qui est nécessaire au fonctionnement du service et ne sont jamais vendues ni cédées à des tiers à des fins commerciales. Pour toute demande relative à vos données, contactez <a href="mailto:privacy@woppy.be" className="text-brand hover:underline">privacy@woppy.be</a>.</p>
    ),
  },
  {
    n: "10",
    title: "Résiliation",
    content: (
      <>
        <p>Vous pouvez demander la suppression de votre compte à tout moment en écrivant à <a href="mailto:support@woppy.be" className="text-brand hover:underline">support@woppy.be</a>.</p>
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
          { label: "Adresse", value: "Brussels, Belgium" },
          { label: "Juridique", value: "legal@woppy.be", href: "mailto:legal@woppy.be" },
          { label: "Support", value: "support@woppy.be", href: "mailto:support@woppy.be" },
          { label: "Données personnelles", value: "privacy@woppy.be", href: "mailto:privacy@woppy.be" },
        ].map(item => (
          <div key={item.label} className="bg-paper-2 border border-line rounded-xl p-4">
            <p className="text-xs font-medium text-muted mb-1">{item.label}</p>
            {item.href
              ? <a href={item.href} className="text-sm font-medium text-brand hover:text-brand-dark transition-colors">{item.value}</a>
              : <p className="text-sm text-ink-2">{item.value}</p>
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
      <style>{``}</style>

      <main className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Hero ── */}
        <section className="pt-12 pb-12 px-6 bg-paper-2 border-b border-line">
          <div className="max-w-3xl mx-auto">
            <h1 className="display text-3xl mb-2">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-muted text-sm mb-1">Woppy — Plateforme d'économie collaborative</p>
            <p className="text-xs text-muted">Dernière mise à jour : 4 novembre 2025</p>

            {/* Key differentiator */}
            <div className="mt-6 inline-flex items-start gap-3 bg-brand-soft border border-brand/30 rounded-2xl px-5 py-4 text-left max-w-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
              <p className="text-sm text-brand-dark leading-relaxed">
                Woppy n'est <strong>pas une agence d'intérim</strong>. Notre modèle d'économie collaborative permet de reverser jusqu'à <strong>93 % du montant</strong> à l'étudiant, contre 65–80 % en intérim classique.
              </p>
            </div>
          </div>
        </section>

        {/* ── TOC ── */}
        <section className="bg-white border-b border-line">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <p className="text-sm font-semibold text-ink mb-3">Sommaire</p>
            <div className="grid sm:grid-cols-2 gap-1">
              {sections.map(s => (
                <a key={s.n} href={`#section-${s.n}`}
                  className="flex items-center gap-2.5 text-sm text-ink-2 hover:text-brand py-1.5 transition-colors group">
                  <span className="text-[11px] font-bold text-muted group-hover:text-brand/50 w-6 shrink-0">{s.n}</span>
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
                className="bg-white rounded-2xl border border-line overflow-hidden scroll-mt-20">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
                  <span className="text-[11px] font-bold text-brand bg-brand-soft border border-brand-soft px-2 py-0.5 rounded-full shrink-0">
                    {s.n}
                  </span>
                  <h2 className="font-bold text-sm text-ink" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                    {s.title}
                  </h2>
                </div>
                <div className="px-6 py-5 text-sm text-ink-2 leading-relaxed">
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