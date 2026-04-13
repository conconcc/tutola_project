'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Clock, User } from 'lucide-react';
import { useTranslation } from '../i18n/TranslationContext';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/discover', label: t.nav.discover, icon: Search },
    { href: '/history', label: t.nav.history, icon: Clock },
    { href: '/profile', label: t.nav.profile, icon: User },
  ];

  // Hide BottomNav on PracticeView (which is a full-screen layout)
  if (pathname.includes('/practice')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[--border] bg-[--background]/80 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2 pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors"
            >
              <Icon
                size={22}
                className={isActive ? 'text-brand' : 'text-muted-foreground'}
              />
              <span
                className={`text-[10px] font-medium tracking-wide ${
                  isActive ? 'text-brand' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
