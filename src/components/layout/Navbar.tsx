'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bell,
  LogOut,
  Menu,
  X,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);

  // 🔗 Liens principaux
  const links = [
    { name: 'Emplois', href: '/jobs' },
    { name: 'Étudiants', href: '/students' },
    { name: 'Profil', href: '/dashboard/profile' },
    { name: 'Références', href: '/references' },
  ];

  // 🧠 Lecture du cookie woppy_user
  useEffect(() => {
    const loadUser = () => {
      const cookie = Cookies.get('woppy_user');
      if (cookie) {
        try {
          setUser(JSON.parse(cookie));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    // 🔁 se met à jour si l’utilisateur se reconnecte depuis un autre onglet
    window.addEventListener('focus', loadUser);
    return () => window.removeEventListener('focus', loadUser);
  }, []);

  // 🔔 Notifications Firestore (si cookie -> user.uid)
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'notifications'),
      where('toUser', '==', user.uid),
      where('read', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => setNotifCount(snap.size));
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    Cookies.remove('woppy_user'); // nettoie le cookie aussi
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <nav className="w-full sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-[#e5d4ff] shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* === LOGO === */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Logo Woppy"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="text-2xl font-bold text-[#8a6bfe] tracking-tight">
            Woppy
          </span>
        </Link>

        {/* === MENU DESKTOP === */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#8a6bfe] font-semibold border-b-2 border-[#8a6bfe]'
                    : 'text-gray-700 hover:text-[#8a6bfe]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* === MESSAGES === */}
          {user && (
            <button
              onClick={() => router.push('/messages')}
              className={`relative p-2 transition ${
                pathname === '/messages'
                  ? 'text-[#8a6bfe]'
                  : 'text-gray-600 hover:text-[#8a6bfe]'
              }`}
              title="Messages"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          )}

          {/* === NOTIFICATIONS === */}
          {user && (
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2 text-[#8a6bfe] hover:text-[#6e4bf5] transition"
              title="Notifications"
            >
              <Bell className="w-6 h-6" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {notifCount}
                </span>
              )}
            </button>
          )}

          {/* === DASHBOARD === */}
          {user && (
            <button
              onClick={() => router.push('/dashboard')}
              className={`p-2 transition ${
                pathname === '/dashboard'
                  ? 'text-[#8a6bfe]'
                  : 'text-gray-600 hover:text-[#8a6bfe]'
              }`}
              title="Tableau de bord"
            >
              <LayoutDashboard className="w-6 h-6" />
            </button>
          )}

          {/* === UTILISATEUR === */}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#8a6bfe] hover:underline"
            >
              Se connecter
            </Link>
          )}
        </div>

        {/* === BOUTON MENU MOBILE === */}
        <button
          className="md:hidden text-[#8a6bfe] focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* === MENU MOBILE === */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden flex flex-col gap-3 px-6 pb-4 bg-white/90 border-t border-[#e5d4ff] backdrop-blur-md"
          >
            {user && (
              <>
                <div className="flex flex-col gap-1 pt-2 border-b border-[#e4d2ff] pb-2">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <button
                        key={link.href}
                        onClick={() => {
                          router.push(link.href);
                          setMenuOpen(false);
                        }}
                        className={`text-sm transition-colors ${
                          isActive
                            ? 'text-[#8a6bfe] font-semibold'
                            : 'text-gray-700 hover:text-[#8a6bfe]'
                        }`}
                      >
                        {link.name}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    router.push('/messages');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-[#8a6bfe] font-medium mt-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Messages
                </button>

                <button
                  onClick={() => {
                    router.push('/notifications');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-[#8a6bfe] font-medium"
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                  {notifCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {notifCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    router.push('/dashboard');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-[#8a6bfe] font-medium"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Tableau de bord
                </button>

                <div className="mt-3 border-t border-[#e4d2ff] pt-3">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </>
            )}

            {!user && (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#8a6bfe] hover:underline mt-2"
              >
                Se connecter
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
