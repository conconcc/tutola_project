'use client';
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "@/shared/i18n/TranslationContext";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Scenario {
  id: string;
  scenarioKey: string;
  titleKo: string;
  titleEn: string;
  category: string;
}

export default function DiscoverPage() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await fetch('/api/scenarios');
        const data = await res.json();
        if (data.results) {
          setScenarios(data.results);
        }
      } catch (e) {
        console.error("Failed to load scenarios", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(scenarios.map(s => s.category));
    return ["ALL", ...Array.from(cats)];
  }, [scenarios]);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const matchCategory = activeCategory === "ALL" || s.category === activeCategory;
      const matchQuery = !searchQuery.trim() || 
        s.titleKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [scenarios, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-transparent pb-32">
      <div className="pt-12 px-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Header & Search */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold font-['Plus_Jakarta_Sans'] text-foreground">{t.nav.discover}</h1>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="text-foreground/30 group-focus-within:text-brand transition-colors" size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.landing.searchPlaceholder}
              className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-border/40 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold tracking-wider transition-colors ${
                activeCategory === cat 
                  ? 'bg-brand text-white shadow-md' 
                  : 'bg-white text-foreground/60 border border-border/40 hover:bg-foreground/[0.02]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid List */}
        {isLoading ? (
          <div className="text-center py-20 text-foreground/40 font-medium">Loading scenarios...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.length > 0 ? (
              filteredScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => router.push(`/setup/${scenario.scenarioKey}`)}
                  className="p-6 bg-white rounded-3xl border border-border/30 hover:border-brand/30 hover:shadow-lg transition-all text-left flex flex-col h-full cursor-pointer group"
                >
                  <div className="text-xs font-bold tracking-widest text-brand mb-3">
                    {scenario.category}
                  </div>
                  <div className="text-xl font-bold font-['Plus_Jakarta_Sans'] group-hover:text-brand transition-colors text-foreground">
                    {lang === 'ko' ? scenario.titleKo : scenario.titleEn}
                  </div>
                  <div className="mt-auto pt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-bold text-brand">Start Practice →</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-foreground/40 font-medium">
                {"No practices found matching your search."}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
