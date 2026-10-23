'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import AuthShell from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Indiquez votre adresse email.');
      return;
    }
    setStatus('loading');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus('sent');
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : '';
      // Un compte inexistant affiche le même message, pour ne pas révéler quels emails sont inscrits
      if (code === 'auth/user-not-found') {
        setStatus('sent');
        return;
      }
      setError(code === 'auth/invalid-email' ? 'Adresse email invalide.' : 'Une erreur est survenue. Réessayez.');
      setStatus('idle');
    }
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Recevez un lien par email pour en choisir un nouveau."
      aside={{
        title: 'Ça arrive à tout le monde',
        points: [
          'Entrez l’adresse de votre compte',
          'Ouvrez le lien reçu par email',
          'Choisissez un nouveau mot de passe',
        ],
      }}
      switchText="Vous vous en souvenez ?"
      switchHref="/auth/login"
      switchLabel="Se connecter"
    >
      {status === 'sent' ? (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          Si un compte existe pour {email.trim()}, un email de réinitialisation vient d’être envoyé. Pensez à vérifier vos spams.
        </div>
      ) : (
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
          <button type="submit" disabled={status === 'loading'} className="btn btn-primary btn-lg w-full">
            {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Envoyer le lien'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
