'use client';
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "@/shared/i18n/TranslationContext";
import { useHistoryStore } from "@/shared/store/useHistoryStore";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Bookmark, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ScenarioMeta = {
  scenarioKey: string;
  titleKo: string;
  titleEn: string;
  category: string;
};

export default function HistoryPage() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const { history, toggleSave, removeHistory } = useHistoryStore();

  const [activeTab, setActiveTab] = useState<'RECENT' | 'SAVED'>('RECENT');
  const [scenariosData, setScenariosData] = useState<Record<string, ScenarioMeta>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Fetch scenario metadata and mark as client-mounted in one callback
    const fetchScenarios = async () => {
      try {
        const res = await fetch('/api/scenarios');
        const data = await res.json();
        if (data.results) {
          const map: Record<string, ScenarioMeta> = {};
          (data.results as ScenarioMeta[]).forEach((s) => { map[s.scenarioKey] = s; });
          setScenariosData(map);
        }
      } catch (e) {
        console.error("Failed to load scenarios", e);
      } finally {
        setIsClient(true);
      }
    };
    void fetchScenarios();
  }, []);

  const displayList = useMemo(() => {
    return history.filter(record => activeTab === 'RECENT' ? true : record.isSaved);
  }, [history, activeTab]);

  if (!isClient) return null; // Zustand persist는 클라이언트에서만 동작하므로 hydration 대기

  return (
    <div className="min-h-screen bg-[#F5F2F0] pb-32">
      <div className="pt-12 px-6 max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold font-['Plus_Jakarta_Sans'] text-foreground">{t.nav.history}</h1>
          
          {/* Tabs */}
          <div className="flex bg-foreground/[0.05] p-1.5 rounded-2xl max-w-sm">
            <button
              onClick={() => setActiveTab('RECENT')}
              className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-xl transition-all ${
                activeTab === 'RECENT' ? 'bg-white shadow-md text-brand' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              Recent History
            </button>
            <button
              onClick={() => setActiveTab('SAVED')}
              className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-xl transition-all ${
                activeTab === 'SAVED' ? 'bg-white shadow-md text-brand' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              Saved
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 pt-4">
          <AnimatePresence mode="popLayout">
            {displayList.length > 0 ? (
              displayList.map((record) => {
                const meta = scenariosData[record.scenarioKey];
                const title = meta ? (lang === 'ko' ? meta.titleKo : meta.titleEn) : record.scenarioKey;
                const category = meta?.category || 'PRACTICE';
                const dateString = new Date(record.completedAt).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={record.id}
                    className="p-6 bg-white rounded-3xl border border-border/30 hover:border-brand/30 shadow-sm transition-all flex flex-col gap-6 group relative"
                  >
                    {/* Top line: Category and Delete */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest text-brand bg-brand/10 px-3 py-1 rounded-full">
                        {category}
                      </span>
                      <button
                         onClick={() => removeHistory(record.id)}
                         className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-foreground/30 transition-colors"
                      >
                         <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Middle line: Title and Params */}
                    <div className="space-y-3">
                      <div className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-foreground">
                        {record.customName || title}
                      </div>

                      {/* Parameters Summary */}
                      {Object.keys(record.parameters).length > 0 && (
                        <div className="flex flex-wrap gap-2 text-sm text-foreground/60 bg-foreground/[0.02] p-3 rounded-xl border border-border/10 inline-flex">
                          {Object.entries(record.parameters).map(([key, val]) => (
                            <span key={key} className="font-medium">
                              <span className="opacity-70 capitalize">{key}:</span> {val as string}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom line: Time, Save, Retry (All on one line) */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/10">
                      <span className="text-sm text-foreground/40 flex items-center gap-1 font-medium">
                        <Clock size={16} />
                        {dateString}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSave(record.id)}
                          className={`p-3 rounded-full transition-colors flex items-center justify-center ${
                            record.isSaved ? 'bg-brand/10 text-brand' : 'bg-foreground/[0.03] text-foreground/40 hover:text-brand'
                          }`}
                        >
                          <Bookmark size={20} className={record.isSaved ? 'fill-brand' : ''} />
                        </button>
                        <button
                          onClick={() => router.push(`/setup/${record.scenarioKey}`)}
                          className="px-6 py-3 bg-foreground/[0.03] hover:bg-brand hover:text-white rounded-xl text-foreground transition-all flex items-center justify-center gap-2 font-bold cursor-pointer"
                        >
                          <Play size={18} /> Retry
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-24 text-foreground/40 space-y-4">
                <Bookmark size={48} className="mx-auto opacity-20" />
                <p>{activeTab === 'RECENT' ? "No recent practices found." : "No saved practices yet."}</p>
                <button
                  onClick={() => router.push('/discover')}
                  className="mt-4 px-6 py-3 bg-brand text-white rounded-full font-bold text-sm"
                >
                  Explore Practices
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
