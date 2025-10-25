'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Scale, Shield } from 'lucide-react';
import Image from 'next/image';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
             <Image
                src="/images/logo.png"
                alt="Logo Woppy"
                width={24}
                height={24}
                className="rounded-md"
              />
            </div>
            <span className="text-2xl font-bold text-gray-900">Woppy</span>
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition"
          >
            <ArrowLeft size={20} />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#f5e5ff] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scale className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-black">Conditions Générales d'Utilisation</h1>
          <p className="text-xl text-gray-600 mb-4">Woppy SPRL</p>
          <p className="text-sm text-gray-500">Dernière mise à jour : 25 octobre 2025</p>
        </div>
      </section>

      {/* Contenu des CGU */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto prose prose-lg">
          
          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">1</span>
              Acceptation des conditions
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                En accédant et en utilisant la plateforme Woppy (ci-après "la Plateforme"), vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
              <p>
                Woppy se réserve le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur la Plateforme. Il est de votre responsabilité de consulter régulièrement ces conditions.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">2</span>
              Description du service
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Woppy est une plateforme en ligne qui met en relation des particuliers et des entreprises (ci-après "Employeurs") avec des étudiants (ci-après "Prestataires") pour des missions ponctuelles et flexibles.
              </p>
              <p>
                La Plateforme offre deux modes de fonctionnement :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Partie 1 :</strong> Publication d'annonces par les Employeurs avec réception de candidatures</li>
                <li><strong>Partie 2 :</strong> Consultation directe des profils de Prestataires disponibles</li>
              </ul>
              <p>
                Woppy agit uniquement en tant qu'intermédiaire et ne constitue pas un employeur. Les relations contractuelles se créent directement entre Employeurs et Prestataires.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">3</span>
              Inscription et compte utilisateur
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Pour utiliser les services de Woppy, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La confidentialité de votre mot de passe</li>
                <li>Toutes les activités effectuées sous votre compte</li>
                <li>L'exactitude des informations fournies dans votre profil</li>
                <li>La mise à jour régulière de vos informations personnelles</li>
              </ul>
              <p>
                Vous devez avoir au moins 18 ans pour créer un compte Employeur. Les Prestataires doivent avoir au moins 16 ans et respecter la législation belge sur le travail étudiant.
              </p>
              <p className="font-semibold">
                Il est strictement interdit de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Créer plusieurs comptes pour la même personne</li>
                <li>Usurper l'identité d'autrui</li>
                <li>Partager votre compte avec des tiers</li>
                <li>Utiliser des informations fausses ou trompeuses</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">4</span>
              Utilisation de la plateforme
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.1 Pour les Employeurs</h3>
              <p>Les Employeurs s'engagent à :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publier des annonces conformes à la législation en vigueur</li>
                <li>Fournir des descriptions précises et honnêtes des missions</li>
                <li>Respecter les rémunérations proposées dans les annonces</li>
                <li>Ne pas discriminer les Prestataires sur la base de critères illégaux</li>
                <li>Respecter les conditions de travail légales</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.2 Pour les Prestataires</h3>
              <p>Les Prestataires s'engagent à :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir des informations exactes sur leurs compétences et expériences</li>
                <li>Honorer les engagements pris auprès des Employeurs</li>
                <li>Effectuer les missions avec professionnalisme</li>
                <li>Respecter les instructions et consignes de sécurité</li>
                <li>Être en règle avec la législation sur le travail étudiant</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.3 Interdictions générales</h3>
              <p>Il est strictement interdit d'utiliser la Plateforme pour :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publier des contenus illégaux, offensants, discriminatoires ou diffamatoires</li>
                <li>Proposer ou accepter des missions non conformes à la législation</li>
                <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
                <li>Contourner les systèmes de sécurité de la Plateforme</li>
                <li>Extraire ou copier des données de manière automatisée</li>
                <li>Utiliser la Plateforme à des fins commerciales non autorisées</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">5</span>
              Paiements et transactions
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Actuellement, les paiements pour les missions s'effectuent directement entre Employeurs et Prestataires, en dehors de la Plateforme. Woppy ne perçoit aucune commission sur ces transactions.
              </p>
              <p>
                À l'avenir, Woppy pourra proposer un système de paiement intégré. Les conditions spécifiques seront communiquées lors de la mise en place de cette fonctionnalité.
              </p>
              <p className="font-semibold">
                Woppy ne saurait être tenu responsable des litiges relatifs aux paiements effectués en dehors de la Plateforme.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">6</span>
              Système de notation et avis
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Après chaque mission, les parties peuvent s'évaluer mutuellement via un système de notation sur 5 étoiles et laisser des commentaires.
              </p>
              <p>
                Les utilisateurs s'engagent à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir des avis honnêtes et constructifs</li>
                <li>Ne pas publier de contenus diffamatoires, offensants ou discriminatoires</li>
                <li>Ne pas manipuler le système de notation</li>
              </ul>
              <p>
                Woppy se réserve le droit de modérer, modifier ou supprimer tout avis qui ne respecterait pas ces principes.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">7</span>
              Propriété intellectuelle
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                L'ensemble du contenu de la Plateforme (design, textes, logos, graphiques, code source) est la propriété exclusive de Woppy SPRL et est protégé par les lois belges et internationales sur la propriété intellectuelle.
              </p>
              <p>
                Vous n'êtes pas autorisé à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Copier, reproduire ou distribuer le contenu de la Plateforme</li>
                <li>Modifier, adapter ou créer des œuvres dérivées</li>
                <li>Utiliser le nom "Woppy" ou les logos sans autorisation écrite</li>
              </ul>
            </div>
          </div>

          {/* Section 8 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">8</span>
              Limitation de responsabilité
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Woppy agit uniquement en tant qu'intermédiaire et ne peut être tenu responsable :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>De la qualité des services fournis par les Prestataires</li>
                <li>Du respect des engagements entre Employeurs et Prestataires</li>
                <li>Des litiges concernant les paiements</li>
                <li>Des accidents ou dommages survenus pendant les missions</li>
                <li>Des contenus publiés par les utilisateurs</li>
                <li>Des interruptions ou dysfonctionnements techniques de la Plateforme</li>
              </ul>
              <p className="font-semibold">
                Dans tous les cas, la responsabilité de Woppy ne saurait excéder le montant des frais d'abonnement payés par l'utilisateur au cours des 12 derniers mois.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">9</span>
              Résiliation
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Vous pouvez fermer votre compte à tout moment en nous contactant à l'adresse support@woppy.be.
              </p>
              <p>
                Woppy se réserve le droit de suspendre ou supprimer votre compte en cas de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation des présentes CGU</li>
                <li>Comportement frauduleux ou abusif</li>
                <li>Plaintes répétées d'autres utilisateurs</li>
                <li>Inactivité prolongée (plus de 24 mois)</li>
              </ul>
              <p>
                En cas de résiliation, vos données personnelles seront traitées conformément à notre Politique de Confidentialité.
              </p>
            </div>
          </div>

          {/* Section 10 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">10</span>
              Droit applicable et juridiction
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Les présentes CGU sont régies par le droit belge. Tout litige relatif à l'utilisation de la Plateforme sera soumis à la compétence exclusive des tribunaux de Louvain-la-Neuve, Belgique.
              </p>
              <p>
                Conformément à la législation européenne, vous disposez également du droit de recourir à une plateforme de règlement des litiges en ligne.
              </p>
            </div>
          </div>

          {/* Section 11 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">11</span>
              Contact
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Pour toute question concernant ces Conditions Générales d'Utilisation, vous pouvez nous contacter à :
              </p>
              <div className="bg-[#f5e5ff] p-6 rounded-xl">
                <p className="font-semibold mb-2">Woppy SPRL</p>
                <p>Adresse : Louvain-la-Neuve, Belgique</p>
                <p>Email : <a href="mailto:legal@woppy.be" className="text-[#8a6bfe] hover:underline">legal@woppy.be</a></p>
                <p>Support : <a href="mailto:support@woppy.be" className="text-[#8a6bfe] hover:underline">support@woppy.be</a></p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}