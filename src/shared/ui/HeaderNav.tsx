'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Clock, User, Lock } from 'lucide-react';
import { useTranslation } from '../i18n/TranslationContext';
import { useAuth } from '../auth/AuthContext';

export function HeaderNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { session, isAuthenticated, isLoading } = useAuth();

  const navItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/discover', label: t.nav.discover, icon: Search },
    { href: '/history', label: t.nav.history, icon: Clock },
    { href: '/profile', label: t.nav.profile, icon: User },
  ];

  // Hide Nav on PracticeView
  if (pathname.includes('/practice')) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[--border] bg-[#F5F2F0]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-brand">
          TUTOLA
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-8">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 text-sm font-bold tracking-wide transition-colors ${
                  isActive ? 'text-brand' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
          </nav>
          <div className="rounded-full border border-border/30 bg-white px-3 py-1.5 text-xs font-semibold text-foreground/70">
            {isLoading ? '...' : isAuthenticated ? `${session?.displayName} · ${session?.role}` : 'Guest Mode'}
          </div>
        </div>
        <div className="flex md:hidden items-center gap-4">
        <nav className="flex items-center gap-6">
          {navItems.map(({ href, icon: Icon }) => {
            const isActive = pathname === href;
            const isRestricted = (href === '/history' || href === '/profile') && !isAuthenticated;
            return (
              <Link
                key={href}
                href={href}
                className={`transition-colors ${
                  isActive ? 'text-brand' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon size={24} />
                  {isRestricted ? <Lock size={10} className="absolute -right-1 -top-1 text-brand" /> : null}
                </div>
              </Link>
            );
          })}
        </nav>
          <div className="rounded-full border border-border/30 bg-white px-2.5 py-1 text-[10px] font-semibold text-foreground/70">
            {isAuthenticated ? session?.displayName : 'Guest'}
          </div>
        </div>
      </div>
    </header>
  );
}
