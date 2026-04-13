'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Play, Cpu, Loader2, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

import { buildCoffeePlan } from '@/features/coffee/application/buildCoffeePlan';
import { buildLaundryPlan } from '@/features/laundry/application/buildLaundryPlan';
import { buildCookingPlan } from '@/features/cooking/application/buildCookingPlan';
import type { DripperType, FlavorPreference, CameraView, Step } from '@/features/scenario-engine/domain/types';
import { fetchWithSession } from '@/shared/auth/AuthContext';

interface PlanResponse {
  results?: Step[];
  source?: 'ai' | 'fallback';
}

export default function PlanPage() {
  const paramsHook = useParams();
  const searchParams = useSearchParams();
  const skillId = (paramsHook['skillId'] as string) || 'coffee';
  const router = useRouter();

  const coffeeState = useMemo(() => ({
    beanAmount: Number(searchParams.get('beanWeight') ?? 20),
    waterAmount: Number(searchParams.get('targetWater') ?? 300),
    dripperType: (searchParams.get('dripperType') ?? 'v60') as DripperType,
    kettleAvailable: searchParams.get('kettleAvailable') !== 'false',
    flavorPreference: (searchParams.get('flavorPreference') ?? 'balanced') as FlavorPreference,
    coffeeBean: searchParams.get('coffeeBean') ?? '기본 원두',
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
    dishName: searchParams.get('dishName') ?? '기본 요리',
    servings: Number(searchParams.get('servings') ?? '2'),
    cookingLevel: searchParams.get('cookingLevel') ?? 'beginner',
  }), [searchParams]);

  const [dynamicSteps, setDynamicSteps] = useState<Step[]>([]);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'fallback'>('fallback');

  useEffect(() => {
    async function fetchPlan(): Promise<void> {
      try {
        let bodyPayload: Record<string, unknown> = { skillId };
        if (skillId === 'coffee') {
          bodyPayload = {
            ...bodyPayload,
            coffeeBean: coffeeState.coffeeBean,
            beanAmount: coffeeState.beanAmount,
            targetWater: coffeeState.waterAmount,
            flavorPreference: coffeeState.flavorPreference,
            kettleAvailable: coffeeState.kettleAvailable,
          };
        } else if (skillId === 'laundry') {
          bodyPayload = { ...bodyPayload, ...laundryConfig };
        } else if (skillId === 'cooking') {
          const stored = sessionStorage.getItem('finalizedIngredients');
          const finalizedIngredients = stored ? (JSON.parse(stored) as unknown[]) : [];
          bodyPayload = { ...bodyPayload, ...cookingConfig, finalizedIngredients };
        }

        const res = await fetchWithSession('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });

        const data = (await res.json()) as PlanResponse;
        if (data.results) {
          setDynamicSteps(data.results);
          setSource(data.source ?? 'fallback');
          sessionStorage.setItem(`${skillId}DynamicPlan`, JSON.stringify(data.results));
          sessionStorage.setItem(`${skillId}PlanSource`, data.source ?? 'fallback');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsPlanLoading(false);
      }
    }

    void fetchPlan();
  }, [skillId, coffeeState, laundryConfig, cookingConfig]);

  const steps = useMemo(() => {
    if (dynamicSteps.length > 0) return dynamicSteps;
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
          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-foreground">Generating lesson plan...</h2>
          <p className="text-foreground/50">손질, 순서, 불 조절, 체크포인트까지 포함한 실습 플랜을 구성하고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors cursor-pointer border border-border/20">
          <ChevronLeft size={24} />
        </button>
        <div className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">
          {source === 'ai' ? 'AI lesson plan' : 'Base plan'}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center pb-4">
        <div className="inline-flex items-center justify-center p-4 bg-brand/10 text-brand rounded-full mb-2">
          <Cpu size={32} />
        </div>
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans']">Adaptive Lesson Plan</h1>
        <p className="text-foreground/60">핵심 단계는 짧게 보고, 필요한 부분은 눌러서 손질/불 조절/체크포인트까지 자세히 볼 수 있습니다.</p>
      </motion.div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isExpanded = expandedStepId === step.id;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[2rem] border border-border/30 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-brand bg-white font-bold text-brand">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold">{step.title}</h2>
                      <p className="text-foreground/65">{step.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                        {formatDuration(step.estimatedDurationSeconds)}
                      </span>
                      <button
                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                        className="rounded-full bg-foreground/[0.04] px-3 py-1 text-xs font-bold text-foreground/65"
                      >
                        자세히 보기 <ChevronDown size={14} className={`ml-1 inline transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-4 grid gap-3 rounded-3xl bg-foreground/[0.03] p-4 text-sm text-foreground/70 md:grid-cols-2">
                      {step.prepGuide ? <div><span className="font-bold text-brand">준비</span><p>{step.prepGuide}</p></div> : null}
                      {step.cuttingGuide ? <div><span className="font-bold text-brand">손질 크기</span><p>{step.cuttingGuide}</p></div> : null}
                      {step.heatLevel ? <div><span className="font-bold text-brand">불 조절</span><p>{step.heatLevel}</p></div> : null}
                      {step.whenToProceed ? <div><span className="font-bold text-brand">다음 단계 기준</span><p>{step.whenToProceed}</p></div> : null}
                      {step.mistakeToAvoid ? <div><span className="font-bold text-brand">실수 방지</span><p>{step.mistakeToAvoid}</p></div> : null}
                      {step.tip || step.hint ? <div><span className="font-bold text-brand">팁</span><p>{step.tip ?? step.hint}</p></div> : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={handleStart}
        className="w-full py-5 bg-brand hover:bg-brand-light text-white rounded-[1.5rem] font-bold tracking-wide transition-all shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group"
      >
        <Play size={18} className="fill-white" /> Start Practice
      </button>
    </div>
  );
}
