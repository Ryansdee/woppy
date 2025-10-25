'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function PrivacyPage() {
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
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-black">Politique de Confidentialité</h1>
          <p className="text-xl text-gray-600 mb-4">Woppy SPRL</p>
          <p className="text-sm text-gray-500">Dernière mise à jour : 25 octobre 2025</p>
        </div>
      </section>

      {/* Résumé rapide */}
      <section className="py-12 px-6 bg-[#f5e5ff]/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#8a6bfe]/20">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">En résumé</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-black">Données sécurisées</p>
                  <p className="text-xs text-gray-600">Vos informations sont chiffrées et protégées</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-black">Pas de revente</p>
                  <p className="text-xs text-gray-600">Nous ne vendons jamais vos données</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-black">Vous contrôlez</p>
                  <p className="text-xs text-gray-600">Accédez, modifiez ou supprimez vos données</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu de la politique */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto prose prose-lg">
          
          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">1</span>
              Introduction
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Chez Woppy, nous prenons la protection de vos données personnelles très au sérieux. Cette Politique de Confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre plateforme.
              </p>
              <p>
                En utilisant Woppy, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
              <p className="font-semibold">
                Responsable du traitement des données :
              </p>
              <div className="bg-[#f5e5ff] p-4 rounded-lg">
                <p>Woppy SPRL</p>
                <p>Louvain-la-Neuve, Belgique</p>
                <p>Email : <a href="mailto:privacy@woppy.be" className="text-[#8a6bfe] hover:underline">privacy@woppy.be</a></p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">2</span>
              Données collectées
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.1 Données d'inscription</h3>
              <p>Lors de la création de votre compte, nous collectons :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Mot de passe (stocké de manière chiffrée)</li>
                <li>Âge et date de naissance</li>
                <li>Localisation (ville ou région)</li>
                <li>Numéro de téléphone (pour la vérification future)</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.2 Données de profil</h3>
              <p>Vous pouvez choisir de fournir volontairement :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Photo de profil</li>
                <li>Description personnelle</li>
                <li>Expériences professionnelles</li>
                <li>Compétences et qualifications</li>
                <li>Rémunération horaire souhaitée</li>
                <li>Disponibilités</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.3 Données d'utilisation</h3>
              <p>Nous collectons automatiquement :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Historique des annonces publiées et consultées</li>
                <li>Messages échangés via la messagerie intégrée</li>
                <li>Notes et avis donnés et reçus</li>
                <li>Missions effectuées</li>
                <li>Données de connexion (adresse IP, type de navigateur, appareil utilisé)</li>
                <li>Cookies et technologies similaires (voir notre Politique de Cookies)</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.4 Données de paiement</h3>
              <p>
                Actuellement, les paiements s'effectuent en dehors de la plateforme. Si nous implémentons un système de paiement intégré, nous collecterons uniquement les données nécessaires via des prestataires de paiement sécurisés certifiés PCI-DSS. Woppy ne stocke jamais vos informations bancaires complètes.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">3</span>
              Utilisation des données
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>Nous utilisons vos données personnelles pour :</p>
              
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.1 Fourniture du service</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Créer et gérer votre compte</li>
                <li>Mettre en relation Employeurs et Prestataires</li>
                <li>Afficher votre profil aux autres utilisateurs (selon vos paramètres de confidentialité)</li>
                <li>Faciliter la communication via la messagerie</li>
                <li>Gérer les annonces et candidatures</li>
                <li>Traiter les transactions et paiements (si applicable)</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.2 Amélioration du service</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analyser l'utilisation de la plateforme pour améliorer l'expérience utilisateur</li>
                <li>Développer de nouvelles fonctionnalités</li>
                <li>Effectuer des statistiques anonymisées</li>
                <li>Optimiser notre algorithme de mise en relation</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.3 Communication</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vous envoyer des notifications importantes (nouvelles candidatures, messages)</li>
                <li>Vous informer des modifications de nos conditions ou politiques</li>
                <li>Répondre à vos questions et demandes de support</li>
                <li>Vous envoyer des newsletters (avec votre consentement explicite)</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.4 Sécurité et conformité</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prévenir les fraudes et abus</li>
                <li>Vérifier l'identité des utilisateurs (vérification téléphonique à venir)</li>
                <li>Respecter nos obligations légales</li>
                <li>Résoudre les litiges</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">4</span>
              Partage des données
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p className="font-semibold">
                Woppy ne vend jamais vos données personnelles à des tiers.
              </p>
              <p>
                Nous pouvons partager vos informations dans les cas suivants :
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.1 Avec d'autres utilisateurs</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Votre profil public (nom, photo, note, expériences) est visible par les autres utilisateurs</li>
                <li>Les informations des annonces sont publiques</li>
                <li>Les messages que vous envoyez sont visibles par leurs destinataires</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.2 Avec nos prestataires de services</h3>
              <p>Nous travaillons avec des partenaires de confiance qui nous aident à fournir nos services :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hébergement de données (serveurs sécurisés)</li>
                <li>Services d'emailing</li>
                <li>Analyse et statistiques</li>
                <li>Support client</li>
                <li>Processeurs de paiement (si applicable)</li>
              </ul>
              <p>
                Ces prestataires sont contractuellement tenus de protéger vos données et ne peuvent les utiliser qu'aux fins pour lesquelles nous les leur avons communiquées.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.3 Obligations légales</h3>
              <p>Nous pouvons divulguer vos informations si :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La loi nous y oblige</li>
                <li>Nous recevons une demande officielle d'une autorité compétente</li>
                <li>C'est nécessaire pour protéger nos droits légaux</li>
                <li>C'est requis pour prévenir des activités illégales ou dangereuses</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.4 Transfert d'entreprise</h3>
              <p>
                En cas de fusion, acquisition ou vente de Woppy, vos données personnelles pourraient être transférées au nouvel acquéreur. Nous vous informerions de ce changement et vous auriez la possibilité de supprimer votre compte avant le transfert.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">5</span>
              Sécurité des données
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chiffrement :</strong> Toutes les données sensibles sont chiffrées en transit (HTTPS/TLS) et au repos</li>
                <li><strong>Authentification :</strong> Mots de passe stockés avec un algorithme de hachage sécurisé (bcrypt)</li>
                <li><strong>Accès limité :</strong> Seul le personnel autorisé peut accéder aux données personnelles</li>
                <li><strong>Surveillance :</strong> Monitoring continu de nos systèmes pour détecter les anomalies</li>
                <li><strong>Mises à jour :</strong> Maintenance régulière et patches de sécurité</li>
                <li><strong>Backups :</strong> Sauvegardes régulières et sécurisées</li>
              </ul>
              <p className="font-semibold">
                Cependant, aucun système n'est totalement infaillible. Nous vous recommandons de choisir un mot de passe fort et de ne jamais le partager.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">6</span>
              Conservation des données
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte actif :</strong> Tant que votre compte est actif</li>
                <li><strong>Données de transaction :</strong> 10 ans (obligation comptable belge)</li>
                <li><strong>Logs de sécurité :</strong> 12 mois maximum</li>
                <li><strong>Données marketing :</strong> Jusqu'au retrait de votre consentement</li>
                <li><strong>Après suppression du compte :</strong> 30 jours (sauf obligations légales)</li>
              </ul>
              <p>
                Passé ces délais, vos données sont soit supprimées, soit anonymisées de manière irréversible pour des analyses statistiques.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">7</span>
              Vos droits (RGPD)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-6">
                <div className="bg-[#f5e5ff] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="text-[#8a6bfe]" size={20} />
                    <h4 className="font-bold">Droit d'accès</h4>
                  </div>
                  <p className="text-sm">Obtenir une copie de vos données personnelles</p>
                </div>

                <div className="bg-[#f5e5ff] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="text-[#8a6bfe]" size={20} />
                    <h4 className="font-bold">Droit de rectification</h4>
                  </div>
                  <p className="text-sm">Corriger des données inexactes ou incomplètes</p>
                </div>

                <div className="bg-[#f5e5ff] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="text-[#8a6bfe]" size={20} />
                    <h4 className="font-bold">Droit à l'effacement</h4>
                  </div>
                  <p className="text-sm">Demander la suppression de vos données</p>
                </div>

                <div className="bg-[#f5e5ff] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="text-[#8a6bfe]" size={20} />
                    <h4 className="font-bold">Droit à la limitation</h4>
                  </div>
                  <p className="text-sm">Restreindre le traitement de vos données</p>
                </div>
              </div>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré et lisible</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données pour certaines finalités</li>
                <li><strong>Droit de retirer votre consentement :</strong> À tout moment, pour les traitements basés sur le consentement</li>
                <li><strong>Droit de déposer une plainte :</strong> Auprès de l'Autorité de Protection des Données (APD) en Belgique</li>
              </ul>

              <p className="font-semibold mt-6">
                Pour exercer ces droits, contactez-nous à :
              </p>
              <div className="bg-[#f5e5ff] p-4 rounded-lg">
                <p>Email : <a href="mailto:privacy@woppy.be" className="text-[#8a6bfe] hover:underline font-semibold">privacy@woppy.be</a></p>
                <p className="text-sm mt-2">Nous répondrons à votre demande dans un délai d'un mois maximum.</p>
              </div>
            </div>
          </div>

          {/* Section 8 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">8</span>
              Données des mineurs
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Woppy est destiné aux utilisateurs âgés d'au moins 16 ans. Les Prestataires mineurs (16-18 ans) doivent obtenir l'autorisation de leurs parents ou tuteurs légaux avant de s'inscrire.
              </p>
              <p>
                Si nous découvrons qu'un utilisateur de moins de 16 ans s'est inscrit sans autorisation parentale, nous supprimerons immédiatement son compte et toutes ses données.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">9</span>
              Transferts internationaux
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Vos données sont principalement stockées et traitées au sein de l'Union Européenne. Si nous devons transférer des données hors de l'UE, nous nous assurons que :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Le pays destinataire offre un niveau de protection adéquat (décision d'adéquation de la Commission européenne)</li>
                <li>Ou des garanties appropriées sont mises en place (clauses contractuelles types de l'UE)</li>
              </ul>
            </div>
          </div>

          {/* Section 10 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">10</span>
              Modifications de cette politique
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Nous pouvons modifier cette Politique de Confidentialité occasionnellement. En cas de changement important, nous vous informerons par :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email (à l'adresse enregistrée)</li>
                <li>Notification sur la plateforme</li>
                <li>Mise à jour de la date "Dernière mise à jour" en haut de cette page</li>
              </ul>
              <p>
                Nous vous encourageons à consulter régulièrement cette politique pour rester informé de la manière dont nous protégeons vos données.
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
                Pour toute question concernant cette Politique de Confidentialité ou vos données personnelles, contactez notre Délégué à la Protection des Données :
              </p>
              <div className="bg-[#f5e5ff] p-6 rounded-xl">
                <p className="font-semibold mb-2">Woppy SPRL - Protection des Données</p>
                <p>Adresse : Louvain-la-Neuve, Belgique</p>
                <p>Email : <a href="mailto:privacy@woppy.be" className="text-[#8a6bfe] hover:underline">privacy@woppy.be</a></p>
                <p>Support : <a href="mailto:support@woppy.be" className="text-[#8a6bfe] hover:underline">support@woppy.be</a></p>
                <p className="mt-4 text-sm">
                  <strong>Autorité de contrôle :</strong><br />
                  Autorité de Protection des Données (APD)<br />
                  Rue de la Presse, 35, 1000 Bruxelles<br />
                  <a href="https://www.autoriteprotectiondonnees.be" className="text-[#8a6bfe] hover:underline">www.autoriteprotectiondonnees.be</a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}