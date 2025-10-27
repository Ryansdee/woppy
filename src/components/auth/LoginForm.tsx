'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// 👉 Firebase imports
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      // 🔐 Connexion Firebase
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // 🔍 Vérifie si l’utilisateur existe dans Firestore
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // 👤 Si le doc n’existe pas encore, on le crée
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
        });
      }

      console.log('✅ Connexion réussie:', user.email);

      // ✅ Redirection après login
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      let message = 'Erreur lors de la connexion.';

      switch (err.code) {
        case 'auth/user-not-found':
          message = 'Aucun compte trouvé avec cet email.';
          break;
        case 'auth/wrong-password':
          message = 'Mot de passe incorrect.';
          break;
        case 'auth/invalid-email':
          message = 'Adresse email invalide.';
          break;
        default:
          message = 'Une erreur est survenue. Réessayez.';
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Image
            src="/images/logo.png"
            alt="Logo Woppy"
            width={24}
            height={24}
            className="rounded-md"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bon retour sur Woppy !
        </h1>
        <p className="text-gray-600">
          Connectez-vous pour accéder à votre compte
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-gray-400" size={20} />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
              placeholder="votre@email.com"
              required
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-gray-400" size={20} />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#8a6bfe] border-gray-300 rounded focus:ring-[#8a6bfe]"
            />
            <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-[#8a6bfe] hover:text-[#7a5bee] font-medium transition"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connexion en cours...</span>
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      {/* Lien inscription */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Vous n'avez pas encore de compte ?{' '}
          <Link
            href="/auth/register"
            className="text-[#8a6bfe] hover:text-[#7a5bee] font-semibold transition"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
