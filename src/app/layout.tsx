import type { Metadata } from 'next';
import './globals.css';
import { HeaderNav } from '@/shared/ui/HeaderNav';

export const metadata: Metadata = {
  title: 'TUTOLA — 라이프스타일 코칭 플랫폼',
  description: '커피 브루잉, 세탁, 요리 등 생활 속 작업을 단계별로 코칭하는 AI 플랫폼',
};

import { TranslationProvider } from "@/shared/i18n/TranslationContext"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F5F2F0]">
        <TranslationProvider>
          <HeaderNav />
          <main className="min-h-screen pt-[72px]">
            {children}
          </main>
        </TranslationProvider>
      </body>
    </html>
  );
}
