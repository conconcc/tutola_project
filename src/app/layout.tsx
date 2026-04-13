import type { Metadata } from 'next';
import './globals.css';
import { HeaderNav } from '@/shared/ui/HeaderNav';
import { TranslationProvider } from "@/shared/i18n/TranslationContext";
import { AuthProvider } from '@/shared/auth/AuthContext';

export const metadata: Metadata = {
    title: 'TUTOLA — 라이프스타일 코칭 플랫폼',
    description: '커피 브루잉, 세탁, 요리 등 생활 속 작업을 단계별로 코칭하는 AI 플랫폼',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className="antialiased bg-[#F5F2F0]">
        <TranslationProvider>
            <AuthProvider>
                <HeaderNav />
                <main className="min-h-screen pt-[72px]">
                    {children}
                </main>
            </AuthProvider>
        </TranslationProvider>
        </body>
        </html>
    );
}
