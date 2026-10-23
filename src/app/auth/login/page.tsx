import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connectez-vous pour retrouver vos missions et vos messages."
      aside={{
        title: 'Votre espace Woppy',
        points: [
          'Suivez vos annonces et vos candidatures',
          'Répondez à vos messages',
          'Laissez un avis après chaque mission',
        ],
      }}
      switchText="Pas encore de compte ?"
      switchHref="/auth/register"
      switchLabel="S'inscrire"
    >
      <LoginForm />
    </AuthShell>
  );
}
