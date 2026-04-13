'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, RotateCcw, Play, Pause, FastForward, CheckCircle2, Settings2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useTranslation } from '@/shared/i18n/TranslationContext';
import { CoffeeViewer } from '@/features/coffee/ui/CoffeeViewer';
import { Placeholder3D } from '@/shared/ui/Placeholder3D';
import { buildCoffeePlan } from '@/features/coffee/application/buildCoffeePlan';
import { buildLaundryPlan } from '@/features/laundry/application/buildLaundryPlan';
import { buildCookingPlan } from '@/features/cooking/application/buildCookingPlan';
import type { CameraView, DripperType, FlavorPreference, Step } from '@/features/scenario-engine/domain/types';
import { fetchWithSession, useAuth } from '@/shared/auth/AuthContext';

const VIEW_BUTTONS: { view: CameraView; label: string }[] = [
  { view: 'front', label: 'Front' },
  { view: 'top', label: 'Top' },
  { view: 'side', label: 'Side' },
  { view: 'zoom', label: 'Zoom' },
];

function buildIdempotencyKey(skillId: string, customName?: string): string {
  return `${skillId}:${customName ?? 'history'}:${Date.now()}`;
}

export default function PracticeView() {
  const paramsHook = useParams();
  const searchParams = useSearchParams();
  const skillId = (paramsHook.skillId as string) || 'coffee';
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentView, setCurrentView] = useState<CameraView>('front');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dynamicSteps, setDynamicSteps] = useState<Step[]>([]);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [customName, setCustomName] = useState('');
  const [classTag, setClassTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isComplete]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`${skillId}DynamicPlan`);
    if (!stored) return;

    try {
      setDynamicSteps(JSON.parse(stored) as Step[]);
    } catch {
      console.error(`Failed to parse dynamic steps for ${skillId}`);
    }
  }, [skillId]);

  const coffeeState = useMemo(() => ({
    beanAmount: Number(searchParams.get('beanWeight') ?? 20),
    waterAmount: Number(searchParams.get('targetWater') ?? 300),
    dripperType: (searchParams.get('dripperType') ?? 'v60') as DripperType,
    kettleAvailable: searchParams.get('kettleAvailable') !== 'false',
    flavorPreference: (searchParams.get('flavorPreference') ?? 'balanced') as FlavorPreference,
    coffeeBean: searchParams.get('coffeeBean') ?? 'Unknown Bean',
    currentStepId: '',
    currentView,
  }), [searchParams, currentView]);

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

  const steps = useMemo(() => {
    if (dynamicSteps.length > 0) return dynamicSteps;
    if (skillId === 'coffee') return buildCoffeePlan(coffeeState);
    if (skillId === 'laundry') return buildLaundryPlan(laundryConfig);
    if (skillId === 'cooking') return buildCookingPlan(cookingConfig);
    return [];
  }, [skillId, coffeeState, laundryConfig, cookingConfig, dynamicSteps]);

  const currentStep = steps[currentStepIdx];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      setElapsedTime(0);
    } else {
      setIsComplete(true);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
      setElapsedTime(0);
    }
  };

  function getParametersPayload(): Record<string, unknown> {
    if (skillId === 'coffee') {
      return {
        beanAmount: coffeeState.beanAmount,
        waterAmount: coffeeState.waterAmount,
        flavor: coffeeState.flavorPreference,
        coffeeBean: coffeeState.coffeeBean,
      };
    }
    if (skillId === 'laundry') {
      return {
        clothingItem: laundryConfig.clothingItem,
        fabricType: laundryConfig.fabricType,
        soilLevel: laundryConfig.soilLevel,
        washerType: laundryConfig.washerType,
        loadWeight: laundryConfig.loadWeight,
      };
    }
    return {
      dishName: cookingConfig.dishName,
      servings: cookingConfig.servings,
      cookingLevel: cookingConfig.cookingLevel,
    };
  }

  async function handleFinish(name?: string): Promise<void> {
    if (!isAuthenticated || isSubmitting) {
      router.push('/history');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchWithSession('/api/history', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scenarioKey: skillId,
          customName: name?.trim() || undefined,
          parameters: getParametersPayload(),
          planSteps: steps,
          idempotencyKey: buildIdempotencyKey(skillId, name),
        }),
      });
      router.push('/history');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTemplateSave(): Promise<void> {
    if (!isAuthenticated || isSubmitting) {
      router.push('/profile');
      return;
    }

    setIsSubmitting(true);
    try {
      const templateResponse = await fetchWithSession('/api/templates', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scenarioKey: skillId,
          title: customName.trim() || `${skillId} lesson template`,
          classTag: classTag.trim() || undefined,
          parameters: getParametersPayload(),
          planSteps: steps,
        }),
      });
      const templateData = (await templateResponse.json()) as { template?: { id: string } };
      if (!templateResponse.ok || !templateData.template) {
        throw new Error('Template save failed');
      }

      const shareResponse = await fetchWithSession(`/api/templates/${templateData.template.id}/share`, {
        method: 'POST',
      });
      const shareData = (await shareResponse.json()) as { share?: { shareToken: string } };
      if (shareData.share?.shareToken) {
        setShareUrl(`/shared/${shareData.share.shareToken}`);
      }
      setIsSavingTemplate(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!currentStep && !isComplete) return null;

  return (
    <div className="fixed inset-0 bg-[#F5F2F0] overflow-hidden flex flex-col">
      <div className="flex-1 w-full relative z-0 bg-[#F5F2F0]">
        {skillId === 'coffee' ? (
          <div className="w-full h-full">
            <CoffeeViewer currentView={currentView} />
          </div>
        ) : (
          <Placeholder3D skillId={skillId} />
        )}

        <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none flex items-start justify-between">
          <button onClick={() => router.back()} className="pointer-events-auto p-4 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-border/20">
            <ChevronLeft size={24} />
          </button>

          {!isComplete && currentStep ? (
            <div className="pointer-events-auto max-w-sm flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {steps.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full ${idx === currentStepIdx ? 'w-8 bg-brand' : idx < currentStepIdx ? 'w-2 bg-brand/50' : 'w-2 bg-brand/20'}`} />
                ))}
              </div>
              <motion.div key={currentStepIdx} initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[2rem] shadow-xl border border-border/20 flex flex-col items-center text-center space-y-2">
                <div className="text-xs font-bold tracking-widest text-brand/70 uppercase">
                  {t.practice.stepOf.replace('{current}', String(currentStepIdx + 1)).replace('{total}', String(steps.length))}
                </div>
                <h2 className="text-lg font-bold font-['Plus_Jakarta_Sans']">{currentStep.title}</h2>
                <div className="text-sm font-medium text-foreground/60">{currentStep.estimatedDurationSeconds ? `~${currentStep.estimatedDurationSeconds}s` : 'Ready'}</div>
              </motion.div>
            </div>
          ) : null}

          {!isComplete ? (
            <div className="pointer-events-auto px-6 py-3 bg-white/80 backdrop-blur-md rounded-full border border-border/20 shadow-md flex items-center gap-3">
              <div className={`w-2.5 h-2.5 bg-brand rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
              <div className="text-xl font-mono tracking-tighter text-brand font-bold">{formatTime(elapsedTime)}</div>
            </div>
          ) : null}
        </div>

        {!isComplete && currentStep ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute bottom-32 right-6 max-w-[320px] w-full z-20 pointer-events-none">
            <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#964B00]/20 p-4 rounded-3xl shadow-lg space-y-3">
              {currentStep.prepGuide ? <p className="text-sm text-brand"><strong>준비</strong> {currentStep.prepGuide}</p> : null}
              {currentStep.cuttingGuide ? <p className="text-sm text-brand"><strong>손질</strong> {currentStep.cuttingGuide}</p> : null}
              {currentStep.heatLevel ? <p className="text-sm text-brand"><strong>불 조절</strong> {currentStep.heatLevel}</p> : null}
              {currentStep.whenToProceed ? <p className="text-sm text-brand"><strong>다음 기준</strong> {currentStep.whenToProceed}</p> : null}
              <p className="text-sm text-brand">{currentStep.tip ?? currentStep.hint}</p>
            </div>
          </motion.div>
        ) : null}

        <div className="absolute bottom-8 left-6 right-6 z-20 pointer-events-none flex items-end justify-between">
          <div className="pointer-events-auto group relative">
            {skillId === 'coffee' ? (
              <>
                <button className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-border/20 flex items-center justify-center text-foreground/60">
                  <Settings2 size={24} />
                </button>
                <div className="absolute bottom-16 left-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto translate-y-4 group-hover:translate-y-0 transition-all flex flex-col gap-2">
                  {VIEW_BUTTONS.map(({ view, label }) => (
                    <button
                      key={view}
                      onClick={() => setCurrentView(view)}
                      className={`px-6 py-3 rounded-full text-sm font-bold shadow-md whitespace-nowrap ${currentView === view ? 'bg-brand text-white' : 'bg-white text-foreground/70 border border-border/20'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {!isComplete ? (
            <div className="pointer-events-auto flex items-center gap-4 bg-white/90 backdrop-blur-xl p-3 rounded-full shadow-2xl border border-border/20">
              <button onClick={handlePrev} disabled={currentStepIdx === 0} className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground/[0.03] disabled:opacity-30">
                <RotateCcw size={20} />
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl bg-brand">
                {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
              </button>
              <button onClick={handleNext} className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground/[0.03]">
                <FastForward size={20} fill="currentColor" />
              </button>
            </div>
          ) : null}

          <div className="w-14" />
        </div>
      </div>

      <AnimatePresence>
        {isComplete ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center flex flex-col">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] mb-2">{t.practice.greatJob}</h2>
              <p className="text-sm text-foreground/60 mb-6">
                {isAuthenticated
                  ? '로그인 상태라면 이 레슨을 기록으로 저장하거나, 클래스 태그를 붙여 공유 템플릿으로 만들 수 있습니다.'
                  : '게스트 모드에서는 실습 체험만 가능합니다. 저장과 공유는 로그인 후 사용할 수 있어요.'}
              </p>

              {shareUrl ? (
                <div className="rounded-3xl bg-brand/5 p-4 text-left text-sm text-brand">
                  <div className="font-bold">공유 링크 생성 완료</div>
                  <button onClick={() => router.push(shareUrl)} className="mt-2 font-semibold underline">
                    {shareUrl}
                  </button>
                </div>
              ) : null}

              {!isSavingTemplate ? (
                <div className="space-y-3 mt-6">
                  <button
                    disabled={isSubmitting}
                    onClick={() => void handleFinish()}
                    className="w-full py-4 bg-brand text-white rounded-full font-bold shadow-md disabled:opacity-50"
                  >
                    {isAuthenticated ? '기록 저장 후 History 보기' : '실습 마치기'}
                  </button>
                  <button
                    onClick={() => setIsSavingTemplate(true)}
                    disabled={!isAuthenticated}
                    className="w-full py-4 bg-brand/10 text-brand rounded-full font-bold disabled:opacity-40"
                  >
                    <Share2 size={16} className="mr-2 inline" />
                    Save as Shared Lesson
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-left space-y-4 mt-4 pt-6 border-t border-border/20">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-brand uppercase">Lesson Title</label>
                    <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="예: 김치파스타 수업용 레슨" className="w-full px-4 py-3 bg-foreground/5 rounded-2xl text-sm font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-brand uppercase">Class Tag</label>
                    <input value={classTag} onChange={(event) => setClassTag(event.target.value)} placeholder="예: spring-lesson-a" className="w-full px-4 py-3 bg-foreground/5 rounded-2xl text-sm font-medium" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setIsSavingTemplate(false)} className="flex-1 py-3 bg-foreground/10 text-foreground/60 rounded-full font-bold">
                      Cancel
                    </button>
                    <button onClick={() => void handleTemplateSave()} disabled={isSubmitting} className="flex-1 py-3 bg-brand text-white rounded-full font-bold disabled:opacity-50">
                      Save & Share
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
