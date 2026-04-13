'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Clock, User } from 'lucide-react';
import { useTranslation } from '../i18n/TranslationContext';

export function HeaderNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

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
        <nav className="hidden md:flex items-center gap-8">
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
        <nav className="flex md:hidden items-center gap-6">
          {navItems.map(({ href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`transition-colors ${
                  isActive ? 'text-brand' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <Icon size={24} />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
