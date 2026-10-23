'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  LogOut,
  Menu,
  X,
  MessageSquare,
  LayoutDashboard,
  ChevronDown,
  UserRound,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const PUBLIC_LINKS = [
  { name: 'Annonces', href: '/jobs' },
  { name: 'Étudiants', href: '/students' },
  { name: 'À propos', href: '/a-propos' },
];

const USER_LINKS = [
  { name: 'Annonces', href: '/jobs' },
  { name: 'Étudiants', href: '/students' },
  { name: 'Mon activité', href: '/dashboard/activity' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('toUser', '==', user.uid),
      where('read', '==', false)
    );
    return onSnapshot(q, (snap) => setNotifCount(snap.size));
  }, [user]);

  /* Ferme le menu utilisateur au clic extérieur */
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userMenuOpen]);

  /* Ferme les menus quand on clique sur un lien */
  const closeOnLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) {
      setMenuOpen(false);
      setUserMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  const links = user ? USER_LINKS : PUBLIC_LINKS;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const initial =
    user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  const iconLink = (href: string, label: string, icon: React.ReactNode, badge = 0) => (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={`relative grid h-10 w-10 place-items-center rounded-full transition-colors ${
        isActive(href) ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
      }`}
    >
      {icon}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-ink ring-2 ring-paper">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="container-w flex h-16 items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/images/logo.png" alt="" width={30} height={30} priority />
          <span className="font-display text-xl font-bold tracking-tight text-ink">woppy</span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(link.href) ? 'bg-paper-2 text-ink' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {user ? (
            <>
              {iconLink('/messages', 'Messages', <MessageSquare size={18} />)}
              {iconLink('/notifications', 'Notifications', <Bell size={18} />, notifCount)}

              <div className="relative ml-2" ref={userMenuRef} onClick={closeOnLink}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 transition-colors hover:border-ink"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                    {initial}
                  </span>
                  <span className="max-w-[110px] truncate text-sm font-medium">
                    {user.displayName?.split(' ')[0] || 'Mon compte'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="card absolute right-0 top-full mt-2 w-52 p-1.5 shadow-xl shadow-ink/5"
                    >
                      <Link href="/dashboard" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-paper-2">
                        <LayoutDashboard size={15} /> Tableau de bord
                      </Link>
                      <Link href="/dashboard/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-paper-2">
                        <UserRound size={15} /> Mon profil
                      </Link>
                      <div className="my-1 border-t border-line" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-50"
                      >
                        <LogOut size={15} /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost">
                Connexion
              </Link>
              <Link href="/auth/register" className="btn btn-primary">
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Burger mobile */}
        <button
          className="relative grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-paper-2 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
          {!menuOpen && notifCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-paper" />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-line bg-paper md:hidden"
          >
            <div className="container-w flex flex-col gap-1 py-4" onClick={closeOnLink}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-3 text-base font-medium ${
                    isActive(link.href) ? 'bg-paper-2 text-ink' : 'text-ink-2'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="my-2 border-t border-line" />
                  <Link href="/messages" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-ink-2">
                    <MessageSquare size={18} /> Messages
                  </Link>
                  <Link href="/notifications" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-ink-2">
                    <Bell size={18} /> Notifications
                    {notifCount > 0 && (
                      <span className="ml-auto rounded-full bg-lime px-2 py-0.5 text-xs font-bold text-ink">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-ink-2">
                    <LayoutDashboard size={18} /> Tableau de bord
                  </Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-ink-2">
                    <UserRound size={18} /> Mon profil
                  </Link>
                  <div className="my-2 border-t border-line" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-danger"
                  >
                    <LogOut size={18} /> Déconnexion
                  </button>
                </>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-4">
                  <Link href="/auth/login" className="btn btn-outline">
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="btn btn-primary">
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
