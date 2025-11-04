'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Logo Woppy"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-2xl font-bold text-[#8a6bfe]">Woppy</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition"
          >
            <ArrowLeft size={20} />
            <span>Retour à l’accueil</span>
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#f5e5ff] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scale className="text-white" size={42} />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-black">
            Conditions Générales d’Utilisation
          </h1>
          <p className="text-xl text-gray-600 mb-2">Woppy SPRL</p>
          <p className="text-sm text-gray-500">Dernière mise à jour : 4 novembre 2025</p>
        </div>
      </section>

      {/* ===== CGU ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed space-y-16">

          {/* === 1 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">1</span>
              Acceptation des conditions
            </h2>
            <p>
              En utilisant la plateforme Woppy (ci-après « la Plateforme »), vous acceptez d’être lié par les présentes
              Conditions Générales d’Utilisation. Si vous n’acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.
            </p>
            <p>
              Woppy se réserve le droit de modifier ces CGU à tout moment ; les nouvelles versions sont applicables dès leur publication sur la Plateforme.
            </p>
          </div>

          {/* === 2 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">2</span>
              Objet du service
            </h2>
            <p>
              Woppy est une plateforme numérique de mise en relation entre des particuliers (« Employeurs ») et des étudiants (« Prestataires ») pour des missions ponctuelles, locales et rémunérées.
              Les relations contractuelles se nouent directement entre les utilisateurs ; Woppy agit en tant qu’intermédiaire technique.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Publication d’annonces et gestion des candidatures</li>
              <li>Messagerie intégrée entre utilisateurs</li>
              <li>Paiement sécurisé via Stripe Connect avec protection séquestre</li>
            </ul>
          </div>

          {/* === 3 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">3</span>
              Inscription et vérification
            </h2>
            <p>
              L’inscription est gratuite. Les étudiants doivent fournir une photo claire de leur carte étudiante en cours de validité.
              Chaque carte est vérifiée manuellement par notre équipe avant l’activation du compte Prestataire.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Les informations doivent être exactes et à jour</li>
              <li>Un seul compte par personne est autorisé</li>
              <li>Les tentatives de fraude ou d’usurpation entraînent une suspension immédiate</li>
            </ul>
          </div>

          {/* === 4 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">4</span>
              Utilisation de la Plateforme
            </h2>

            <h3 className="font-semibold text-lg mt-4 mb-2">4.1 Employeurs</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Publier des annonces légales et précises</li>
              <li>Respecter la rémunération proposée</li>
              <li>Ne pas contourner le système de paiement sécurisé</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4 mb-2">4.2 Prestataires</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Effectuer les missions avec professionnalisme</li>
              <li>Respecter la législation belge sur le travail étudiant</li>
              <li>Ne pas annuler sans motif valable</li>
            </ul>
          </div>

          {/* === 5 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">5</span>
              Paiements et commissions
            </h2>
            <p>
              Les paiements passent exclusivement par <strong>Stripe Connect</strong>.  
              L’argent du client est bloqué jusqu’à la fin de la mission puis reversé à l’étudiant.
            </p>
            <p className="mt-3">
              Woppy perçoit une <strong>commission de 15 %</strong> sur chaque transaction, couvrant :
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>La gestion et maintenance de la plateforme</li>
              <li>La vérification manuelle des profils étudiants</li>
              <li>La sécurité des paiements et la protection des utilisateurs</li>
            </ul>
            <p className="mt-3">
              Les Prestataires reçoivent environ 85 % du montant brut après frais Stripe.  
              Les paiements hors plateforme sont interdits.
            </p>
          </div>

          {/* === 6 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">6</span>
              Responsabilité et sécurité
            </h2>
            <p>
              Woppy agit comme intermédiaire technique et ne peut être tenue responsable :
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>De la qualité des prestations réalisées</li>
              <li>Des litiges entre Employeurs et Prestataires</li>
              <li>Des dommages ou retards liés aux missions</li>
              <li>Des interruptions temporaires du service</li>
            </ul>
            <p className="mt-3">
              La responsabilité de Woppy est en tout état de cause limitée au montant de la commission perçue sur la transaction concernée.
            </p>
          </div>

          {/* === 7 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">7</span>
              Système de notation et avis
            </h2>
            <p>
              Après chaque mission, Employeurs et Prestataires peuvent se noter sur 5 étoiles et laisser un avis.  
              Les commentaires doivent rester honnêtes, respectueux et basés sur des expériences réelles.
            </p>
          </div>

          {/* === 8 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">8</span>
              Données personnelles
            </h2>
            <p>
              Woppy respecte le Règlement Général sur la Protection des Données (RGPD).  
              Les informations collectées sont strictement nécessaires au fonctionnement du service et ne sont jamais vendues à des tiers.
            </p>
          </div>

          {/* === 9 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">9</span>
              Résiliation
            </h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment en écrivant à :
              <a href="mailto:support@woppy.be" className="text-[#8a6bfe] hover:underline ml-1">support@woppy.be</a>.
            </p>
            <p>
              Woppy peut suspendre un compte en cas de non-respect des CGU, de fraude ou d’inactivité prolongée (24 mois).
            </p>
          </div>

          {/* === 10 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">10</span>
              Droit applicable et juridiction
            </h2>
            <p>
              Les présentes CGU sont régies par le droit belge.  
              Tout litige sera soumis à la compétence des tribunaux de Louvain-la-Neuve.
            </p>
          </div>

          {/* === 11 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">11</span>
              Contact
            </h2>
            <div className="bg-[#f5e5ff] p-6 rounded-xl space-y-1">
              <p className="font-semibold">Woppy SPRL</p>
              <p>Adresse : Louvain-la-Neuve, Belgique</p>
              <p>
                Email : <a href="mailto:legal@woppy.be" className="text-[#8a6bfe] hover:underline">legal@woppy.be</a>
              </p>
              <p>
                Support : <a href="mailto:support@woppy.be" className="text-[#8a6bfe] hover:underline">support@woppy.be</a>
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
