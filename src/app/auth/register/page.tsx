import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthShell
      wide
      title="Créer un compte"
      subtitle="Gratuit, sans CV ni carte bancaire."
      aside={{
        title: 'Un compte, deux usages',
        points: [
          'Étudiant : complétez votre profil et postulez aux missions',
          'Particulier : publiez une annonce et choisissez votre étudiant',
          'Dans les deux cas, la messagerie et les avis sont inclus',
        ],
      }}
      switchText="Déjà un compte ?"
      switchHref="/auth/login"
      switchLabel="Se connecter"
    >
      <RegisterForm />
    </AuthShell>
  );
}
