'use client';

import { useTranslation } from "@/shared/i18n/TranslationContext";
import { ChevronRight, Globe, Bell, Palette, LogOut, Coffee } from "lucide-react";
import { useHistoryStore } from "@/shared/store/useHistoryStore";
import { useMemo } from "react";

export default function ProfilePage() {
  const { t, lang, setLang } = useTranslation();
  const { history } = useHistoryStore();

  const totalPractices = history.length;
  
  const favoriteCategory = useMemo(() => {
    if (history.length === 0) return '-';
    // Count categories (we saved scenarioKey instead of category directly in history parameters)
    // So let's just determine favorite by scenarioKey.
    const counts = history.reduce((acc, curr) => {
      acc[curr.scenarioKey] = (acc[curr.scenarioKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const fav = Object.keys(counts).reduce((a, b) => (counts[a] ?? 0) > (counts[b] ?? 0) ? a : b);
    return fav.toUpperCase();
  }, [history]);

  // Rough estimation: each practice ~3 mins
  const totalHours = (totalPractices * 3 / 60).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F5F2F0] pb-32">
      <div className="pt-12 px-6 max-w-2xl mx-auto space-y-10 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold font-['Plus_Jakarta_Sans'] text-foreground">
            {t.nav.profile}
          </h1>
        </div>

        {/* User Info Card */}
        <div className="p-6 bg-white rounded-3xl border border-border/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center text-2xl font-bold font-['Plus_Jakarta_Sans']">
              U
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">User</h2>
              <p className="text-sm text-foreground/50">user@tutola.com</p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-full border border-border/40 text-sm font-bold text-foreground/70 hover:bg-foreground/[0.02] transition-colors">
            Edit
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-3xl border border-border/30 shadow-sm flex flex-col justify-center text-center space-y-2">
            <div className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-brand">
              {totalPractices}
            </div>
            <div className="text-xs font-bold tracking-widest text-foreground/50 uppercase">
              Total Practices
            </div>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-border/30 shadow-sm flex flex-col justify-center text-center space-y-2">
            <div className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-brand flex items-center justify-center gap-1">
              <Coffee size={20} /> {favoriteCategory}
            </div>
            <div className="text-xs font-bold tracking-widest text-foreground/50 uppercase">
              Favorite
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 p-6 bg-white rounded-3xl border border-border/30 shadow-sm flex flex-col justify-center text-center space-y-2">
            <div className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-brand">
              {totalHours}h
            </div>
            <div className="text-xs font-bold tracking-widest text-foreground/50 uppercase">
              Total Hours
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-widest text-foreground/40 uppercase mb-4 px-2">Settings</h3>
          
          <button 
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-border/20 hover:border-brand/30 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand/10 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <Globe size={20} />
              </div>
              <span className="font-medium text-foreground">Language</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground/40">{lang === 'ko' ? '한국어' : 'English'}</span>
              <ChevronRight className="text-foreground/30 group-hover:text-brand transition-colors" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-border/20 hover:border-brand/30 hover:shadow-sm transition-all group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand/10 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <Bell size={20} />
              </div>
              <span className="font-medium text-foreground">Notifications</span>
            </div>
            <ChevronRight className="text-foreground/30 group-hover:text-brand transition-colors" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-border/20 hover:border-brand/30 hover:shadow-sm transition-all group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand/10 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <Palette size={20} />
              </div>
              <span className="font-medium text-foreground">App Theme</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground/40">Light</span>
              <ChevronRight className="text-foreground/30 group-hover:text-brand transition-colors" />
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-border/20 hover:border-red-500/30 hover:shadow-sm transition-all group mt-6 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                <LogOut size={20} />
              </div>
              <span className="font-medium text-red-500">Log Out</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
