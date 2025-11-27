import NotificationsProvider from './providers/NotificationsProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import AuthBootstrap from './providers/AuthBootstrap';
import AuthRedirect from './providers/AuthRedirect';
import EnablePushClient from './providers/EnablePushClient'; // 👈 ICI

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'WOPPY - Trouvez des étudiants prêts à aider',
  description: 'Connectez-vous avec des étudiants talentueux disponibles pour des emplois flexibles dans votre région.',
  icons: { icon: '/favicon.ico' },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#f5e5ff', scrollBehavior: 'smooth' }}
      >
        <AuthBootstrap />
        <AuthRedirect />

        {/* 🔥 Active automatiquement les notifications push FCM */}
        <EnablePushClient />

        <NotificationsProvider>
          <Navbar />
          {children}
          <Footer />
        </NotificationsProvider>
      </body>
    </html>
  );
}
