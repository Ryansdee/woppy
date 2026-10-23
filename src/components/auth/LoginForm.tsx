'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Email ou mot de passe incorrect.',
  'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
  'auth/wrong-password': 'Mot de passe incorrect.',
  'auth/invalid-email': 'Adresse email invalide.',
  'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'auth/network-request-failed': 'Pas de connexion internet.',
};

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

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Crée le document utilisateur s'il n'existe pas encore
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, { uid: user.uid, email: user.email, createdAt: new Date() });
      }

      router.push('/dashboard');
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : '';
      setError(ERRORS[code] ?? 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">Adresse email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="vous@exemple.be"
          required
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="label">Mot de passe</label>
          <Link href="/auth/forgot-password" className="text-sm font-medium text-brand hover:text-brand-dark">
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Connexion…
          </>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
}
