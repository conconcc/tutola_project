'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Info, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "@/shared/i18n/TranslationContext";

const COFFEE_BEANS = [
  "에티오피아 예가체프",
  "콜롬비아 수프리모",
  "과테말라 안티구아",
  "케냐 AA",
  "직접 입력"
];

export default function ScenarioSetup() {
  const paramsHook = useParams();
  const skillId = (paramsHook['skillId'] as string) || 'coffee';
  const router = useRouter();
  const { t } = useTranslation();
  
  const [params, setParams] = useState({
    // Coffee
    strength: 3,
    temperature: 92,
    beanWeight: 20,
    targetWater: 300,
    dripperType: 'v60',
    kettleAvailable: true,
    coffeeBean: COFFEE_BEANS[0],
    customCoffeeBean: "",
    
    // Laundry
    clothingItem: '', 
    fabricType: 'cotton', 
    soilLevel: 'light', 
    washerType: 'front_load',
    loadWeight: 'medium',
    
    // Cooking
    dishName: '', // e.g., '스테이크', '알리오 올리오'
    servings: '2', // '1', '2', '4'
    cookingLevel: 'beginner', // 'beginner', 'intermediate', 'advanced'
  });

  const handleNext = () => {
    let qs: URLSearchParams;

    if (skillId === 'coffee') {
      const flavor = params.strength >= 4 ? 'strong' : params.strength <= 2 ? 'light' : 'balanced';
      const finalBean = params.coffeeBean === "직접 입력" ? params.customCoffeeBean : params.coffeeBean;
      qs = new URLSearchParams({
        beanWeight: String(params.beanWeight),
        targetWater: String(params.targetWater),
        dripperType: params.dripperType,
        kettleAvailable: String(params.kettleAvailable),
        flavorPreference: flavor,
        coffeeBean: finalBean || '알 수 없는 원두',
      });
      router.push(`/plan/${skillId}?${qs.toString()}`);
    } else if (skillId === 'laundry') {
      qs = new URLSearchParams({
        clothingItem: params.clothingItem || '일반 빨래',
        fabricType: params.fabricType,
        soilLevel: params.soilLevel,
        washerType: params.washerType,
        loadWeight: params.loadWeight,
      });
      router.push(`/plan/${skillId}?${qs.toString()}`);
    } else if (skillId === 'cooking') {
      qs = new URLSearchParams({
        dishName: params.dishName || '간단한 요리',
        servings: params.servings,
        cookingLevel: params.cookingLevel,
      });
      // Cooking은 재료 선택(Ingredients) 페이지를 먼저 거친 뒤 Plan으로 이동
      router.push(`/ingredients/${skillId}?${qs.toString()}`);
    } else {
      qs = new URLSearchParams();
      router.push(`/plan/${skillId}?${qs.toString()}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors cursor-pointer border border-border/20">
          <ChevronLeft size={24} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-border/30"
      >
        <div className="space-y-2 text-center md:text-left">
          <div className="text-sm font-bold tracking-widest text-brand uppercase mb-4 inline-block bg-brand/10 px-4 py-1.5 rounded-full">
            {skillId === 'coffee' ? t.landing.coffeeTitle : skillId === 'laundry' ? t.landing.laundryTitle : t.landing.cookingTitle}
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {skillId === 'coffee' ? t.setup.brewParams : skillId === 'laundry' ? '세탁 환경 설정' : '요리 레시피 설정'} 
          </h2>
        </div>

        <div className="space-y-10">
          {skillId === 'coffee' && (
            <>
              {/* Coffee Bean Selection */}
              <div className="space-y-4">
                <span className="font-semibold text-sm">원두 선택 (Coffee Beans)</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COFFEE_BEANS.map(bean => (
                    <button
                      key={bean}
                      onClick={() => setParams({ ...params, coffeeBean: bean })}
                      className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        params.coffeeBean === bean 
                          ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                          : 'border-border/30 bg-foreground/[0.02] text-foreground/60 hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {bean}
                    </button>
                  ))}
                </div>
                
                <AnimatePresence>
                  {params.coffeeBean === "직접 입력" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 overflow-hidden"
                    >
                      <input
                        type="text"
                        value={params.customCoffeeBean}
                        onChange={(e) => setParams({ ...params, customCoffeeBean: e.target.value })}
                        placeholder="직접 사용하실 원두 이름을 입력해주세요"
                        className="w-full px-5 py-4 bg-white border border-brand/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium shadow-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold">{t.setup.strength}</span>
                  <span className="text-brand font-bold">Level {params.strength}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={params.strength}
                  onChange={(e) => setParams({ ...params, strength: parseInt(e.target.value) })}
                  className="w-full h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--brand)' }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold">{t.setup.temperature}</span>
                  <span className="text-brand font-bold">{params.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="98"
                  value={params.temperature}
                  onChange={(e) => setParams({ ...params, temperature: parseInt(e.target.value) })}
                  className="w-full h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--brand)' }}
                />
              </div>
              
              <div className="space-y-4 pt-4 border-t border-border/10">
                 <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold">{t.setup.kettle}</span>
                  <button 
                    onClick={() => setParams({ ...params, kettleAvailable: !params.kettleAvailable })}
                    className="flex shrink-0 w-12 h-6 bg-foreground/10 rounded-full transition-colors cursor-pointer"
                    style={{ backgroundColor: params.kettleAvailable ? 'var(--brand)' : '' }}
                  >
                    <motion.div 
                       className="w-5 h-5 m-0.5 bg-white rounded-full shadow-sm"
                       animate={{ x: params.kettleAvailable ? 24 : 0 }}
                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 p-6 bg-brand/5 rounded-[1.5rem] border border-brand/10 text-sm text-brand">
                <Info size={20} className="flex-shrink-0" />
                <p className="leading-relaxed">
                  {t.setup.tasteHints[params.strength >= 4 ? 'strong' : params.strength <= 2 ? 'light' : 'balanced']}
                </p>
              </div>
            </>
          )}

          {skillId === 'laundry' && (
            <>
              {/* Clothing Item Input */}
              <div className="space-y-4">
                <span className="font-semibold text-sm">세탁할 옷 입력 (Clothing Item)</span>
                <input
                  type="text"
                  value={params.clothingItem}
                  onChange={(e) => setParams({ ...params, clothingItem: e.target.value })}
                  placeholder="예: 청바지, 흰 셔츠, 캐시미어 니트 등"
                  className="w-full px-5 py-4 bg-white border border-border/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm font-medium shadow-sm transition-all"
                />
              </div>

              {/* Fabric Type */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <span className="font-semibold text-sm">주요 옷감 종류 (Fabric)</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'cotton', label: '일반 면 (Cotton)' },
                    { id: 'wool', label: '니트/스웨터 (Wool/Knit)' },
                    { id: 'silk', label: '실크/블라우스 (Silk/Delicate)' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setParams({ ...params, fabricType: f.id })}
                      className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        params.fabricType === f.id 
                          ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                          : 'border-border/30 bg-foreground/[0.02] text-foreground/60 hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Load Weight */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <span className="font-semibold text-sm">세탁량 / 무게 (Load Weight)</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'small', label: '소량 (1~3kg)' },
                    { id: 'medium', label: '보통 (3~5kg)' },
                    { id: 'large', label: '대량 (5kg 이상)' },
                  ].map(w => (
                    <button
                      key={w.id}
                      onClick={() => setParams({ ...params, loadWeight: w.id })}
                      className={`py-3 px-2 text-center rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        params.loadWeight === w.id 
                          ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                          : 'border-border/30 bg-foreground/[0.02] text-foreground/60 hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soil Level */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <span className="font-semibold text-sm">오염 정도 (Soil Level)</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'light', label: '가벼운 오염 / 일상' },
                    { id: 'heavy', label: '찌든 때 / 얼룩' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setParams({ ...params, soilLevel: s.id })}
                      className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        params.soilLevel === s.id 
                          ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                          : 'border-border/30 bg-foreground/[0.02] text-foreground/60 hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Washer Type */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <span className="font-semibold text-sm">세탁기 종류 (Washer Type)</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'front_load', label: '드럼 세탁기 (Front)' },
                    { id: 'top_load', label: '통돌이 세탁기 (Top)' },
                  ].map(w => (
                    <button
                      key={w.id}
                      onClick={() => setParams({ ...params, washerType: w.id })}
                      className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        params.washerType === w.id 
                          ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                          : 'border-border/30 bg-foreground/[0.02] text-foreground/60 hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 p-6 bg-brand/5 rounded-[1.5rem] border border-brand/10 text-sm text-brand">
                <Info size={20} className="flex-shrink-0" />
                <p className="leading-relaxed">
                  입력해주신 옷 종류와 세탁량에 맞춰, 세제량 계산 및 애벌빨래 필요 여부가 포함된 AI 맞춤 플랜을 생성합니다.
                </p>
              </div>
            </>
          )}

          {skillId === 'cooking' && (
            <>
              {/* Dish Name */}
              <div className="space-y-4">
                <span className="font-semibold text-sm">요리 이름 (Dish Name)</span>
                <input
                  type="text"
                  value={params.dishName}
                  onChange={(e) => setParams({ ...params, dishName: e.target.value })}
                  placeholder="예: 김치볶음밥, 알리오 올리오, 스테이크"
                  className="w-full px-5 py-4 bg-white border border-border/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm font-medium shadow-sm transition-all"
                />
              </div>

              {/* Servings */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <span className="font-semibold text-sm">인분 수 (Servings)</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: '1', label: '1인분' },
                    { id: '2', label: '2인분' },
                    { id: '4', label: '3~4인분' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setParams({ ...params, servings: s.id })}
                      className={`py-3 px-2 text-center rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        params.servings === s.id 
                          ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                          : 'border-border/30 bg-foreground/[0.02] text-foreground/60 hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooking Level */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <span className="font-semibold text-sm">요리 숙련도 (Cooking Level)</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'beginner', label: '초보' },
                    { id: 'intermediate', label: '중수' },
                    { id: 'advanced', label: '고수' },
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setParams({ ...params, cookingLevel: lvl.id })}
                      className={`py-3 px-2 text-center rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        params.cookingLevel === lvl.id 
                          ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                          : 'border-border/30 bg-foreground/[0.02] text-foreground/60 hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 p-6 bg-brand/5 rounded-[1.5rem] border border-brand/10 text-sm text-brand">
                <Info size={20} className="flex-shrink-0" />
                <p className="leading-relaxed">
                  다음 단계에서 요리에 필요한 재료를 확인하고 보유 유무에 따라 조리 계획을 맞춤 생성합니다.
                </p>
              </div>
            </>
          )}

          <button 
            onClick={handleNext}
            className="w-full mt-8 py-5 bg-brand hover:bg-brand-light text-white rounded-[1.5rem] font-bold tracking-wide transition-all shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group"
          >
            {skillId === 'cooking' ? 'Ingredients Check' : 'Create Plan'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
