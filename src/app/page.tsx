'use client';

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { useTranslation } from "@/shared/i18n/TranslationContext";
import { SearchBar } from "@/shared/ui/SearchBar";

export default function Landing() {
  const router = useRouter();
  const { t } = useTranslation();

  const recentPractices = [
    { id: "coffee", title: t.landing.coffeeTitle, time: "2 hours ago", category: "COFFEE" },
    { id: "laundry", title: t.landing.laundryTitle, time: "3 days ago", category: "HOME CARE" },
    { id: "cooking", title: t.landing.cookingTitle, time: "1 week ago", category: "KITCHEN" },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 pb-24 md:pb-6">
      <div className="w-full max-w-3xl mx-auto text-center space-y-12 animate-in fade-in duration-500">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {t.landing.title}
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            {t.landing.subtitle}
          </p>
        </div>

        <SearchBar />

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-foreground/50 justify-center">
            <Clock size={16} />
            <span>{t.landing.recentPractices}</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recentPractices.map((practice) => (
              <button
                key={practice.id}
                onClick={() => router.push(`/setup/${practice.id}`)}
                className="p-6 bg-white rounded-3xl border border-border/30 hover:border-brand/30 hover:shadow-md transition-all text-left group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="text-xs tracking-wider text-brand font-bold">
                    {practice.category}
                  </div>
                  <div className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {practice.title}
                  </div>
                  <div className="text-sm text-foreground/50">
                    {practice.time}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
