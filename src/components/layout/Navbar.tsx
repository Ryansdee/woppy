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
  ChevronDown,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const links = [
    { name: 'Annonces', href: '/jobs' },
    { name: 'Étudiants', href: '/students' },
    { name: 'Mon Profil', href: '/dashboard/profile' },
    { name: 'Mon activité', href: '/dashboard/activity' },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
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
    router.push('/auth/login');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="w-full sticky top-0 z-50 bg-white border-b border-slate-100 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/images/logo.png"
            alt="Logo Woppy"
            width={32}
            height={32}
            className="rounded-xl"
          />
          <span className="font-bold text-xl text-violet-600 tracking-tight"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            woppy
          </span>
        </Link>

        {/* ── Nav links desktop ── */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${
                isActive(link.href)
                  ? 'text-violet-700 bg-violet-50'
                  : 'text-slate-600 hover:text-violet-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-violet-600 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* ── Right actions desktop ── */}
        <div className="hidden md:flex items-center gap-1">

          {/* Messages */}
          {user && (
            <button
              onClick={() => router.push('/messages')}
              title="Messages"
              className={`relative p-2.5 rounded-lg transition-colors ${
                isActive('/messages')
                  ? 'text-violet-700 bg-violet-50'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Notifications */}
          {user && (
            <button
              onClick={() => router.push('/notifications')}
              title="Notifications"
              className={`relative p-2.5 rounded-lg transition-colors ${
                isActive('/notifications')
                  ? 'text-violet-700 bg-violet-50'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white
                                 text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>
          )}

          {/* Dashboard */}
          {user && (
            <button
              onClick={() => router.push('/dashboard')}
              title="Tableau de bord"
              className={`p-2.5 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'text-violet-700 bg-violet-50'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          )}

          {/* Divider */}
          {user && <div className="w-px h-5 bg-slate-200 mx-1" />}

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50
                           border border-transparent hover:border-slate-200 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'Mon compte'}
                </span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-slate-100
                               shadow-lg shadow-slate-200/60 py-1.5 z-50"
                  >
                    <button
                      onClick={() => { router.push('/dashboard'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700
                                 hover:bg-slate-50 hover:text-violet-600 transition-colors"
                    >
                      <LayoutDashboard size={14} /> Tableau de bord
                    </button>
                    <button
                      onClick={() => { router.push('/dashboard/profile'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700
                                 hover:bg-slate-50 hover:text-violet-600 transition-colors"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-violet-200 shrink-0" /> Mon profil
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500
                                 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login"
                className="text-sm font-medium text-slate-600 hover:text-violet-600 px-3 py-2 transition-colors">
                Connexion
              </Link>
              <Link href="/auth/register"
                className="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white
                           px-4 py-2 rounded-xl transition-colors shadow-sm shadow-violet-200">
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* ── Burger mobile ── */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Menu mobile ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-slate-100 bg-white"
          >
            <div className="px-5 py-4 flex flex-col gap-1">

              {/* Nav links */}
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => { router.push(link.href); setMenuOpen(false); }}
                  className={`flex items-center text-sm font-medium px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive(link.href)
                      ? 'text-violet-700 bg-violet-50'
                      : 'text-slate-700 hover:text-violet-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </button>
              ))}

              {user && (
                <>
                  <div className="my-2 border-t border-slate-100" />

                  <button
                    onClick={() => { router.push('/messages'); setMenuOpen(false); }}
                    className={`flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                      isActive('/messages') ? 'text-violet-700 bg-violet-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> Messages
                  </button>

                  <button
                    onClick={() => { router.push('/notifications'); setMenuOpen(false); }}
                    className={`flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                      isActive('/notifications') ? 'text-violet-700 bg-violet-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Bell className="w-4 h-4" /> Notifications
                    {notifCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {notifCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { router.push('/dashboard'); setMenuOpen(false); }}
                    className={`flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                      isActive('/dashboard') ? 'text-violet-700 bg-violet-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                  </button>

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg
                               text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </>
              )}

              {!user && (
                <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-100">
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-slate-700 text-center py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    Connexion
                  </Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-violet-600 text-white text-center py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
                    S'inscrire gratuitement
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