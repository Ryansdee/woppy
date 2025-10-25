'use client';

import Link from 'next/link';
import { ArrowLeft, Cookie, Settings, Eye, BarChart, Shield } from 'lucide-react';
import Image from 'next/image';

export default function CookiesPage() {
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
            <Cookie className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-black">Politique des Cookies</h1>
          <p className="text-xl text-gray-600 mb-4">Woppy SPRL</p>
          <p className="text-sm text-gray-500">Dernière mise à jour : 25 octobre 2025</p>
        </div>
      </section>

      {/* Résumé rapide */}
      <section className="py-12 px-6 bg-[#f5e5ff]/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#8a6bfe]/20">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">En bref</h2>
            <p className="text-gray-700 mb-6">
              Nous utilisons des cookies et technologies similaires pour améliorer votre expérience sur Woppy. 
              Vous pouvez gérer vos préférences à tout moment.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Cookies essentiels</p>
                  <p className="text-xs text-gray-600">Nécessaires au fonctionnement du site</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Cookies analytiques</p>
                  <p className="text-xs text-gray-600">Pour comprendre l'utilisation du site</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Vous contrôlez</p>
                  <p className="text-xs text-gray-600">Gérez vos préférences facilement</p>
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
              Qu'est-ce qu'un cookie ?
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et préférences sur une période de temps.
              </p>
              <p>
                Les cookies ne contiennent pas de virus et ne peuvent pas accéder aux données de votre appareil. Ils facilitent votre navigation et améliorent votre expérience utilisateur.
              </p>
              <div className="bg-[#f5e5ff] p-6 rounded-xl mt-4">
                <p className="font-semibold mb-2">💡 Bon à savoir</p>
                <p className="text-sm">
                  Les cookies ne sont pas les seules technologies de suivi. Nous utilisons également des technologies similaires comme le stockage local (localStorage), les pixels de suivi et les identifiants d'appareil. Cette politique couvre toutes ces technologies.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">2</span>
              Pourquoi utilisons-nous des cookies ?
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>Woppy utilise des cookies pour plusieurs raisons :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Assurer le bon fonctionnement de la plateforme</li>
                <li>Mémoriser vos préférences et paramètres</li>
                <li>Maintenir votre session de connexion sécurisée</li>
                <li>Analyser l'utilisation du site pour l'améliorer</li>
                <li>Personnaliser votre expérience</li>
                <li>Mesurer l'efficacité de nos communications</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">3</span>
              Types de cookies utilisés
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-6">
              
              {/* Cookies essentiels */}
              <div className="bg-white border-2 border-[#8a6bfe] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#8a6bfe] rounded-xl flex items-center justify-center">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cookies strictement nécessaires</h3>
                    <span className="text-sm text-gray-600">Toujours actifs - Non désactivables</span>
                  </div>
                </div>
                <p className="mb-3">
                  Ces cookies sont indispensables au fonctionnement de la plateforme. Sans eux, certaines parties du site ne fonctionneraient pas correctement.
                </p>
                <p className="font-semibold mb-2">Exemples :</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>session_token :</strong> Maintient votre connexion active (expire à la fermeture du navigateur)</li>
                  <li><strong>csrf_token :</strong> Protection contre les attaques de type Cross-Site Request Forgery (24h)</li>
                  <li><strong>cookie_consent :</strong> Mémorise vos préférences de cookies (1 an)</li>
                  <li><strong>language :</strong> Mémorise votre langue préférée (1 an)</li>
                </ul>
              </div>

              {/* Cookies fonctionnels */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Settings className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cookies fonctionnels</h3>
                    <span className="text-sm text-green-600">Recommandés - Désactivables</span>
                  </div>
                </div>
                <p className="mb-3">
                  Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation du site.
                </p>
                <p className="font-semibold mb-2">Exemples :</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>user_preferences :</strong> Sauvegarde vos préférences d'affichage et filtres (6 mois)</li>
                  <li><strong>recent_searches :</strong> Mémorise vos recherches récentes (30 jours)</li>
                  <li><strong>notification_settings :</strong> Préférences de notifications (1 an)</li>
                  <li><strong>tour_completed :</strong> Indique si vous avez terminé le tutoriel (permanent)</li>
                </ul>
              </div>

              {/* Cookies analytiques */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <BarChart className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cookies analytiques</h3>
                    <span className="text-sm text-green-600">Optionnels - Désactivables</span>
                  </div>
                </div>
                <p className="mb-3">
                  Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site, afin de l'améliorer.
                </p>
                <p className="font-semibold mb-2">Exemples :</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>_ga, _gid :</strong> Google Analytics - Mesure d'audience (2 ans / 24h)</li>
                  <li><strong>_hjid :</strong> Hotjar - Analyse comportementale (1 an)</li>
                  <li><strong>amplitude_id :</strong> Amplitude - Analyse d'événements (10 ans)</li>
                </ul>
                <p className="text-sm mt-3 bg-[#f5e5ff] p-3 rounded-lg">
                  <strong>Note :</strong> Les données collectées sont anonymisées et agrégées. Nous n'utilisons jamais ces données pour vous identifier personnellement.
                </p>
              </div>

              {/* Cookies marketing */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Eye className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cookies marketing</h3>
                    <span className="text-sm text-orange-600">Optionnels - Désactivables</span>
                  </div>
                </div>
                <p className="mb-3">
                  Ces cookies sont utilisés pour afficher des publicités pertinentes et mesurer l'efficacité de nos campagnes.
                </p>
                <p className="font-semibold mb-2">Exemples :</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>_fbp :</strong> Facebook Pixel - Publicités ciblées (3 mois)</li>
                  <li><strong>IDE :</strong> Google DoubleClick - Publicités display (13 mois)</li>
                  <li><strong>li_sugr :</strong> LinkedIn - Remarketing (90 jours)</li>
                </ul>
                <p className="text-sm mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <strong>⚠️ Important :</strong> Actuellement, Woppy n'utilise PAS de cookies marketing. Cette catégorie est listée pour transparence et pourrait être activée à l'avenir avec votre consentement explicite.
                </p>
              </div>

            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">4</span>
              Cookies tiers
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Certains cookies sont déposés par des services tiers que nous utilisons pour améliorer notre plateforme :
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Google Analytics</h4>
                  <p className="text-sm mb-2">Mesure d'audience et statistiques de visite</p>
                  <p className="text-xs text-gray-600">
                    Politique de confidentialité : <a href="https://policies.google.com/privacy" className="text-[#8a6bfe] hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Hotjar (si activé)</h4>
                  <p className="text-sm mb-2">Analyse comportementale et cartes de chaleur</p>
                  <p className="text-xs text-gray-600">
                    Politique de confidentialité : <a href="https://www.hotjar.com/legal/policies/privacy" className="text-[#8a6bfe] hover:underline" target="_blank" rel="noopener noreferrer">hotjar.com/legal/policies/privacy</a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Services d'hébergement</h4>
                  <p className="text-sm mb-2">Stockage et sécurité des données</p>
                  <p className="text-xs text-gray-600">
                    Nos hébergeurs peuvent utiliser des cookies techniques pour la sécurité et la performance
                  </p>
                </div>
              </div>

              <p className="text-sm bg-[#f5e5ff] p-4 rounded-lg mt-4">
                <strong>Note :</strong> Nous sélectionnons soigneusement nos partenaires et nous assurons qu'ils respectent le RGPD et vos droits à la vie privée.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">5</span>
              Gérer vos préférences
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Vous avez le contrôle total sur l'utilisation des cookies sur Woppy :
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5.1 Via notre bandeau de cookies</h3>
              <p>
                Lors de votre première visite, un bandeau vous permet de choisir quels types de cookies vous acceptez. 
                Vous pouvez modifier ce choix à tout moment en cliquant sur "Gérer les cookies" dans le footer du site.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5.2 Via les paramètres de votre compte</h3>
              <p>
                Connectez-vous à votre compte Woppy, accédez à <strong>Paramètres → Confidentialité → Cookies</strong> pour gérer vos préférences détaillées.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5.3 Via votre navigateur</h3>
              <p>
                Vous pouvez également gérer les cookies directement depuis votre navigateur :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
                <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                <p className="font-semibold mb-2">⚠️ Attention</p>
                <p className="text-sm">
                  Le blocage ou la suppression de tous les cookies peut affecter le bon fonctionnement de Woppy. 
                  Certaines fonctionnalités pourraient ne plus être disponibles.
                </p>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">6</span>
              Durée de conservation
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Les cookies ont des durées de vie différentes selon leur fonction :
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-[#8a6bfe] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Type de cookie</th>
                      <th className="px-4 py-3 text-left">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="px-4 py-3">Cookies de session</td>
                      <td className="px-4 py-3">Supprimés à la fermeture du navigateur</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3">Cookies essentiels</td>
                      <td className="px-4 py-3">24 heures à 1 an</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Cookies fonctionnels</td>
                      <td className="px-4 py-3">30 jours à 1 an</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3">Cookies analytiques</td>
                      <td className="px-4 py-3">24 heures à 2 ans</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Cookies marketing</td>
                      <td className="px-4 py-3">90 jours à 13 mois</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">7</span>
              Technologies similaires
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                En plus des cookies, nous utilisons d'autres technologies pour améliorer votre expérience :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>LocalStorage / SessionStorage :</strong> Stockage local dans votre navigateur pour sauvegarder vos préférences et améliorer les performances
                </li>
                <li>
                  <strong>Pixels invisibles (web beacons) :</strong> Petites images transparentes pour mesurer l'ouverture des emails
                </li>
                <li>
                  <strong>Empreinte digitale (fingerprinting) :</strong> Nous n'utilisons PAS cette technique intrusive
                </li>
              </ul>
            </div>
          </div>

          {/* Section 8 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">8</span>
              Modifications de cette politique
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Nous pouvons mettre à jour cette Politique des Cookies pour refléter les changements de nos pratiques ou de la législation. 
                La date "Dernière mise à jour" en haut de cette page indique quand la politique a été modifiée pour la dernière fois.
              </p>
              <p>
                Nous vous encourageons à consulter régulièrement cette page pour rester informé de notre utilisation des cookies.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">9</span>
              Contact
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Pour toute question concernant notre utilisation des cookies, contactez-nous :
              </p>
              <div className="bg-[#f5e5ff] p-6 rounded-xl">
                <p className="font-semibold mb-2">Woppy SPRL</p>
                <p>Adresse : Louvain-la-Neuve, Belgique</p>
                <p>Email : <a href="mailto:privacy@woppy.be" className="text-[#8a6bfe] hover:underline">privacy@woppy.be</a></p>
                <p>Support : <a href="mailto:support@woppy.be" className="text-[#8a6bfe] hover:underline">support@woppy.be</a></p>
              </div>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ressources utiles</h2>
            <div className="bg-gray-50 p-6 rounded-xl space-y-2">
              <p className="font-semibold mb-3 text-black">Pour en savoir plus sur les cookies :</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.autoriteprotectiondonnees.be" className="text-[#8a6bfe] hover:underline" target="_blank" rel="noopener noreferrer">
                    → Autorité de Protection des Données (Belgique)
                  </a>
                </li>
                <li>
                  <a href="https://www.allaboutcookies.org" className="text-[#8a6bfe] hover:underline" target="_blank" rel="noopener noreferrer">
                    → All About Cookies (guide complet)
                  </a>
                </li>
                <li>
                  <a href="https://www.youronlinechoices.com" className="text-[#8a6bfe] hover:underline" target="_blank" rel="noopener noreferrer">
                    → Your Online Choices (opt-out publicitaire)
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}