import NotificationsProvider from './providers/NotificationsProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { Inter } from 'next/font/google';
import AuthBootstrap from './providers/AuthBootstrap';
import AuthRedirect from './providers/AuthRedirect';
import EnablePushClient from './providers/EnablePushClient';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });

export const metadata = {
  title: 'Woppy · Petits jobs entre étudiants et particuliers',
  description: 'Woppy met en relation des étudiants et des particuliers pour des missions locales et rémunérées en Belgique.',
  icons: { icon: '/favicon.ico' },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>
        <AuthBootstrap />
        <AuthRedirect />

        {/* Active automatiquement les notifications push FCM */}
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
