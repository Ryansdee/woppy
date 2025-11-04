'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  UserCheck,
  Trash2,
} from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield className="text-white" size={42} />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-black">
            Politique de Confidentialité
          </h1>
          <p className="text-xl text-gray-600 mb-2">Woppy SPRL</p>
          <p className="text-sm text-gray-500">
            Dernière mise à jour : 4 novembre 2025
          </p>
        </div>
      </section>

      {/* ===== RÉSUMÉ RAPIDE ===== */}
      <section className="py-12 px-6 bg-[#f5e5ff]/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#8a6bfe]/20">
            <h2 className="text-2xl font-bold mb-6 text-[#4C3E87] text-center">
              En résumé
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-black">
                    Données sécurisées
                  </p>
                  <p className="text-xs text-gray-600">
                    Vos informations sont chiffrées et protégées
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-black">
                    Aucune revente
                  </p>
                  <p className="text-xs text-gray-600">
                    Woppy ne revend jamais vos données
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-black">
                    Contrôle total
                  </p>
                  <p className="text-xs text-gray-600">
                    Accédez, modifiez ou supprimez vos données à tout moment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENU ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed space-y-16">

          {/* === 1 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                1
              </span>
              Introduction
            </h2>
            <p>
              Chez Woppy, nous respectons votre vie privée. Cette politique décrit comment nous collectons,
              utilisons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.
            </p>
            <p>
              Woppy SPRL, basée à Louvain-la-Neuve, est responsable du traitement des données.
              Vous pouvez nous contacter à{" "}
              <a
                href="mailto:privacy@woppy.be"
                className="text-[#8a6bfe] hover:underline"
              >
                privacy@woppy.be
              </a>.
            </p>
          </div>

          {/* === 2 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                2
              </span>
              Données collectées
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Données d’inscription :</strong> nom, email, mot de passe chiffré, âge, ville.
              </li>
              <li>
                <strong>Données de profil :</strong> photo, description, compétences, expériences, carte étudiante.
              </li>
              <li>
                <strong>Données d’utilisation :</strong> annonces, messages, connexions, avis, cookies.
              </li>
              <li>
                <strong>Données de paiement :</strong> traitées par Stripe Connect. Woppy ne stocke jamais vos
                informations bancaires.
              </li>
            </ul>
          </div>

          {/* === 3 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                3
              </span>
              Utilisation des données
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Création et gestion de votre compte</li>
              <li>Mise en relation entre Employeurs et Prestataires</li>
              <li>Vérification manuelle des profils étudiants</li>
              <li>Traitement des paiements via Stripe Connect</li>
              <li>Envoi de notifications et assistance client</li>
              <li>Amélioration de la plateforme et analyses anonymes</li>
            </ul>
          </div>

          {/* === 4 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                4
              </span>
              Partage des données
            </h2>
            <p>
              Woppy ne vend jamais vos données.  
              Nous partageons uniquement les informations nécessaires avec :
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Stripe (paiements sécurisés)</li>
              <li>Firebase (hébergement et base de données chiffrée)</li>
              <li>Partenaires techniques pour la maintenance</li>
            </ul>
          </div>

          {/* === 5 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                5
              </span>
              Sécurité des données
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement complet (HTTPS / TLS)</li>
              <li>Mots de passe hachés avec bcrypt</li>
              <li>Accès limité au personnel autorisé</li>
              <li>Surveillance et sauvegardes régulières</li>
            </ul>
            <p className="mt-2">
              Malgré nos efforts, aucun système n’est infaillible — restez prudent avec vos identifiants.
            </p>
          </div>

          {/* === 6 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                6
              </span>
              Vos droits (RGPD)
            </h2>
            <p>
              Vous pouvez à tout moment :
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Accéder à vos données</li>
              <li>Les corriger ou les supprimer</li>
              <li>Limiter leur utilisation</li>
              <li>Retirer votre consentement</li>
              <li>Demander la portabilité de vos données</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits :{" "}
              <a
                href="mailto:privacy@woppy.be"
                className="text-[#8a6bfe] hover:underline font-semibold"
              >
                privacy@woppy.be
              </a>
            </p>
          </div>

          {/* === 7 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                7
              </span>
              Conservation et suppression
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Les comptes inactifs sont supprimés après 24 mois</li>
              <li>Les transactions sont conservées 10 ans (obligation légale)</li>
              <li>Les données supprimées sont effacées sous 30 jours</li>
            </ul>
          </div>

          {/* === 8 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                8
              </span>
              Données des mineurs
            </h2>
            <p>
              L’utilisation de Woppy est réservée aux personnes de plus de 16 ans.
              Les étudiants mineurs (16–18 ans) doivent obtenir une autorisation parentale avant leur inscription.
            </p>
          </div>

          {/* === 9 === */}
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-[#8a6bfe] text-white rounded-lg flex items-center justify-center text-lg font-bold">
                9
              </span>
              Contact et autorité de contrôle
            </h2>
            <div className="bg-[#f5e5ff] p-6 rounded-xl space-y-1">
              <p className="font-semibold">Woppy SPRL – Protection des Données</p>
              <p>Adresse : Louvain-la-Neuve, Belgique</p>
              <p>
                Email :{" "}
                <a
                  href="mailto:privacy@woppy.be"
                  className="text-[#8a6bfe] hover:underline"
                >
                  privacy@woppy.be
                </a>
              </p>
              <p>
                Support :{" "}
                <a
                  href="mailto:support@woppy.be"
                  className="text-[#8a6bfe] hover:underline"
                >
                  support@woppy.be
                </a>
              </p>
              <p className="mt-4 text-sm">
                <strong>Autorité de Protection des Données (APD)</strong> — Rue
                de la Presse 35, 1000 Bruxelles.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
