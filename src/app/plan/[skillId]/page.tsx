'use client';

import { useMemo, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Play, Cpu, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "@/shared/i18n/TranslationContext";
import { buildCoffeePlan } from '@/features/coffee/application/buildCoffeePlan';
import { buildLaundryPlan } from '@/features/laundry/application/buildLaundryPlan';
import { buildCookingPlan } from '@/features/cooking/application/buildCookingPlan';
import type { DripperType, FlavorPreference, CameraView, Step } from '@/features/scenario-engine/domain/types';

export default function PlanPage() {
  const paramsHook = useParams();
  const searchParams = useSearchParams();
  const skillId = (paramsHook['skillId'] as string) || 'coffee';
  const router = useRouter();
  const { t } = useTranslation();

  const coffeeState = useMemo(() => ({
    beanAmount: Number(searchParams.get('beanWeight') ?? 20),
    waterAmount: Number(searchParams.get('targetWater') ?? 300),
    dripperType: (searchParams.get('dripperType') ?? 'v60') as DripperType,
    kettleAvailable: searchParams.get('kettleAvailable') !== 'false',
    flavorPreference: (searchParams.get('flavorPreference') ?? 'balanced') as FlavorPreference,
    coffeeBean: searchParams.get('coffeeBean') ?? '알 수 없는 원두',
    currentStepId: '',
    currentView: 'front' as CameraView,
  }), [searchParams]);

  const laundryConfig = useMemo(() => ({
    clothingItem: searchParams.get('clothingItem') ?? '일반 빨래',
    fabricType: searchParams.get('fabricType') ?? 'cotton',
    soilLevel: searchParams.get('soilLevel') ?? 'light',
    washerType: searchParams.get('washerType') ?? 'front_load',
    loadWeight: searchParams.get('loadWeight') ?? 'medium',
  }), [searchParams]);

  const cookingConfig = useMemo(() => ({
    dishName: searchParams.get('dishName') ?? '간단한 요리',
    servings: searchParams.get('servings') ?? '2',
    cookingLevel: searchParams.get('cookingLevel') ?? 'beginner',
  }), [searchParams]);

  const [dynamicSteps, setDynamicSteps] = useState<Step[]>([]);
  // 이제 모든 시나리오(coffee, laundry, cooking)가 AI(Mock)를 거쳐 플랜을 생성합니다.
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        let bodyPayload: any = { skillId };
        
        if (skillId === 'coffee') {
          bodyPayload = { ...bodyPayload, ...coffeeState };
        } else if (skillId === 'laundry') {
          bodyPayload = { ...bodyPayload, ...laundryConfig };
        } else if (skillId === 'cooking') {
          const stored = sessionStorage.getItem('finalizedIngredients');
          const finalizedIngredients = stored ? JSON.parse(stored) : [];
          bodyPayload = { ...bodyPayload, ...cookingConfig, finalizedIngredients };
        }

        const res = await fetch('/api/plan', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(bodyPayload)
        });
        
        const data = await res.json();
        if (data.results) {
           setDynamicSteps(data.results);
           // Practice 페이지에서 재사용할 수 있도록 저장
           sessionStorage.setItem(`${skillId}DynamicPlan`, JSON.stringify(data.results));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsPlanLoading(false);
      }
    };
    fetchPlan();
  }, [skillId, coffeeState, laundryConfig, cookingConfig]);

  // fallback logic if dynamic loading fails or isn't ready
  const steps = useMemo(() => {
    if (dynamicSteps.length > 0) return dynamicSteps;
    // Fallbacks to local functions if AI/API fails completely
    if (skillId === 'coffee') return buildCoffeePlan(coffeeState);
    if (skillId === 'laundry') return buildLaundryPlan(laundryConfig);
    if (skillId === 'cooking') return buildCookingPlan(cookingConfig);
    return [];
  }, [skillId, coffeeState, laundryConfig, cookingConfig, dynamicSteps]);

  const handleStart = () => {
    router.push(`/practice/${skillId}?${searchParams.toString()}`);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:30';
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isPlanLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2F0] flex flex-col items-center justify-center p-6 space-y-6">
        <Loader2 size={48} className="text-brand animate-spin" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-foreground">Generating AI Plan...</h2>
          <p className="text-foreground/50">사용자의 설정과 환경에 맞춘 완벽한 AI 맞춤 플랜을 설계하고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors cursor-pointer border border-border/20">
          <ChevronLeft size={24} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center pb-4"
      >
        <div className="inline-flex items-center justify-center p-4 bg-brand/10 text-brand rounded-full mb-2">
          <Cpu size={32} />
        </div>
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans']">
          AI Adaptive Plan
        </h1>
        <p className="text-foreground/60">
          입력된 설정값을 바탕으로 AI가 최적화된 맞춤형 플랜을 구성했습니다.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-border/30 space-y-8 relative overflow-hidden"
      >
        {/* Decorative flair */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/[0.03] rounded-bl-full pointer-events-none" />

        <div className="space-y-6 relative">
          <div className="absolute left-6 top-8 bottom-8 w-px bg-border/50 z-0" />
          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex gap-6 relative z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-brand text-brand shadow-sm flex items-center justify-center font-bold shrink-0 self-start mt-1">
                {idx + 1}
              </div>
              <div className="flex-1 bg-foreground/[0.02] p-5 rounded-2xl border border-border/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                  <div className="font-bold text-lg">{step.title}</div>
                  <div className="text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full w-max">
                    ~{formatDuration(step.estimatedDurationSeconds)}
                  </div>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </motion.div>
      
      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleStart}
        className="w-full py-5 bg-brand hover:bg-brand-light text-white rounded-[1.5rem] font-bold tracking-wide transition-all shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group"
      >
        <Play size={18} className="fill-white" /> Start Practice
      </motion.button>

    </div>
  );
}
