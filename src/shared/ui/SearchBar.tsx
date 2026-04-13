'use client';

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/shared/i18n/TranslationContext";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface SearchResult {
  id: string;
  scenarioKey: string;
  titleKo: string;
  titleEn: string;
  category: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t, lang } = useTranslation();
  
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const url = debouncedQuery.trim() ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : '/api/scenarios';
        const res = await fetch(url);
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isFocused || debouncedQuery.trim()) {
      fetchResults();
    }
  }, [debouncedQuery, isFocused]);

  const handleSelect = (scenarioKey: string) => {
    setIsFocused(false);
    router.push(`/setup/${scenarioKey}`);
  };

  const handleSearch = () => {
    if (query.trim()) {
      if (results.length > 0 && results[0]) {
        handleSelect(results[0].scenarioKey);
      } else {
        router.push('/discover');
      }
    } else {
      router.push('/discover');
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
        <Search className="text-foreground/30 group-focus-within:text-brand transition-colors" size={24} />
      </div>
      
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsFocused(true);
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={t.landing.searchPlaceholder}
        className="relative w-full pl-16 pr-32 py-6 bg-white rounded-full border border-border/40 text-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm z-0"
      />
      
      <button
        onClick={handleSearch}
        className="absolute right-3 top-2 bottom-2 px-10 py-5 rounded-full text-white transition-all hover:shadow-lg cursor-pointer z-10"
        style={{ backgroundColor: 'var(--brand)' }}
      >
        {t.landing.searchButton}
      </button>

      {/* Dropdown Results */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-border/30 shadow-2xl overflow-hidden z-20 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-foreground/50">Loading...</div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelect(item.scenarioKey)}
                    className="w-full text-left px-6 py-4 hover:bg-foreground/[0.02] transition-colors flex flex-col cursor-pointer"
                  >
                    <span className="text-xs text-brand font-bold tracking-wider mb-1">{item.category}</span>
                    <span className="text-lg font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {lang === 'ko' ? item.titleKo : item.titleEn}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-foreground/50">No practices found.</div>
          )}
        </div>
      )}
    </div>
  );
}
