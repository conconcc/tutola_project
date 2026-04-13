'use client';

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, RotateCcw, Play, Pause, FastForward, CheckCircle2, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "@/shared/i18n/TranslationContext";
import { useHistoryStore } from "@/shared/store/useHistoryStore";
import { CoffeeViewer } from '@/features/coffee/ui/CoffeeViewer';
import { Placeholder3D } from '@/shared/ui/Placeholder3D';
import { buildCoffeePlan } from '@/features/coffee/application/buildCoffeePlan';
import { buildLaundryPlan } from '@/features/laundry/application/buildLaundryPlan';
import { buildCookingPlan } from '@/features/cooking/application/buildCookingPlan';
import type { CameraView, DripperType, FlavorPreference, Step } from '@/features/scenario-engine/domain/types';

const VIEW_BUTTONS: { view: CameraView; label: string }[] = [
  { view: 'front', label: 'Front' },
  { view: 'top', label: 'Top' },
  { view: 'side', label: 'Side' },
  { view: 'zoom', label: 'Zoom' },
];

export default function PracticeView() {
  const paramsHook = useParams();
  const searchParams = useSearchParams();
  const skillId = (paramsHook['skillId'] as string) || 'coffee';
  const router = useRouter();
  const { t } = useTranslation();
  const addHistory = useHistoryStore(state => state.addHistory);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentView, setCurrentView] = useState<CameraView>('front');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dynamicSteps, setDynamicSteps] = useState<Step[]>([]);

  // New Modal States
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [customName, setCustomName] = useState("");

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  // Load dynamic plan from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem(`${skillId}DynamicPlan`);
    if (!stored) return;
    let parsed: Step[];
    try {
      parsed = JSON.parse(stored) as Step[];
    } catch {
      console.error(`Failed to parse dynamic steps for ${skillId}`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDynamicSteps(parsed);
  }, [skillId]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* Parse query params */
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
    dishName: searchParams.get('dishName') ?? '간단한 요리',
    servings: searchParams.get('servings') ?? '2',
    cookingLevel: searchParams.get('cookingLevel') ?? 'beginner',
  }), [searchParams]);

  const steps = useMemo(() => {
    if (dynamicSteps.length > 0) return dynamicSteps;
    // Fallback
    if (skillId === 'coffee') return buildCoffeePlan(coffeeState);
    if (skillId === 'laundry') return buildLaundryPlan(laundryConfig);
    if (skillId === 'cooking') return buildCookingPlan(cookingConfig);
    return [];
  }, [skillId, coffeeState, laundryConfig, cookingConfig, dynamicSteps]);
  
  const currentStep = steps[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setElapsedTime(0);
    } else {
      setIsComplete(true);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setElapsedTime(0);
    }
  };

  const handleFinish = (name?: string) => {
    const paramsPayload = skillId === 'coffee' 
      ? { beanAmount: coffeeState.beanAmount, waterAmount: coffeeState.waterAmount, flavor: coffeeState.flavorPreference, coffeeBean: coffeeState.coffeeBean }
      : skillId === 'laundry'
      ? { 
          clothingItem: laundryConfig.clothingItem,
          fabricType: laundryConfig.fabricType, 
          soilLevel: laundryConfig.soilLevel, 
          washerType: laundryConfig.washerType,
          loadWeight: laundryConfig.loadWeight
        }
      : skillId === 'cooking'
      ? {
          dishName: cookingConfig.dishName,
          servings: cookingConfig.servings,
          cookingLevel: cookingConfig.cookingLevel
      }
      : {};

    addHistory({
      scenarioKey: skillId,
      ...(name && name.trim() !== '' ? { customName: name.trim() } : {}),
      parameters: paramsPayload,
    });
    router.push('/history');
  };

  if (!currentStep && !isComplete) return null;

  return (
    <div className="fixed inset-0 bg-[#F5F2F0] overflow-hidden flex flex-col">
      {/* 3D Viewer Area - Full Screen */}
      <div className="flex-1 w-full relative z-0 bg-[#F5F2F0]">
        {skillId === 'coffee' ? (
          <div className="w-full h-full">
            <CoffeeViewer currentView={currentView} />
          </div>
        ) : (
          <Placeholder3D skillId={skillId} />
        )}

        {/* Top Header HUD */}
        <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none flex items-start justify-between">
          <button 
            onClick={() => router.back()} 
            className="pointer-events-auto p-4 bg-white/50 hover:bg-white backdrop-blur-md rounded-full shadow-sm border border-border/20 transition-all cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Minimalist Step Banner */}
          {!isComplete && currentStep && (
            <div className="pointer-events-auto max-w-sm flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStepIdx ? 'w-8 bg-brand' : idx < currentStepIdx ? 'w-2 bg-brand/50' : 'w-2 bg-brand/20'}`}
                  />
                ))}
              </div>
              <motion.div 
                key={currentStepIdx}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[2rem] shadow-xl border border-border/20 flex flex-col items-center text-center space-y-1"
              >
                <div className="text-xs font-bold tracking-widest text-brand/70 uppercase">
                  {t.practice.stepOf.replace('{current}', String(currentStepIdx + 1)).replace('{total}', String(steps.length))}
                </div>
                <h2 className="text-lg font-bold font-['Plus_Jakarta_Sans']">{currentStep.title}</h2>
                <div className="text-sm font-medium text-foreground/60">
                 {currentStep.estimatedDurationSeconds ? `~${currentStep.estimatedDurationSeconds}s` : 'Ready'} 
                 {skillId === 'coffee' && currentStep.id === 'coffee-bloom' ? ` • ${coffeeState.beanAmount * 2}g` : ''}
                </div>
              </motion.div>
            </div>
          )}

          {/* Right Timer */}
          {!isComplete && (
            <div className="pointer-events-auto px-6 py-3 bg-white/80 backdrop-blur-md rounded-full border border-border/20 shadow-md flex items-center gap-3">
              <div className={`w-2.5 h-2.5 bg-brand rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
              <div className="text-xl font-mono tracking-tighter text-brand font-bold">{formatTime(elapsedTime)}</div>
            </div>
          )}
        </div>

        {/* Warming Vibe Tool Popup - Bottom Right */}
        {!isComplete && currentStep?.hint && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-32 right-6 max-w-[280px] w-full z-20 pointer-events-none"
          >
            <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#964B00]/20 p-4 rounded-3xl shadow-lg flex items-start gap-3">
               <span className="text-brand text-lg">💡</span>
               <div className="text-brand text-sm font-medium leading-relaxed">
                 {currentStep.hint}
               </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Menu & Controls HUD */}
        <div className="absolute bottom-8 left-6 right-6 z-20 pointer-events-none flex items-end justify-between">
          
          {/* Hamburger Camera Menu (Hover/Click to expand) - Only for Coffee for now */}
          <div className="pointer-events-auto group relative">
            {skillId === 'coffee' && (
              <>
                <button className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-border/20 flex items-center justify-center text-foreground/60 transition-colors cursor-pointer">
                  <Settings2 size={24} />
                </button>
                <div className="absolute bottom-16 left-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto translate-y-4 group-hover:translate-y-0 transition-all flex flex-col gap-2">
                  {VIEW_BUTTONS.map(({ view, label }) => (
                    <button
                      key={view}
                      onClick={() => setCurrentView(view)}
                      className={`px-6 py-3 rounded-full text-sm font-bold shadow-md transition-colors whitespace-nowrap cursor-pointer ${
                        currentView === view ? 'bg-brand text-white border-none' : 'bg-white text-foreground/70 border border-border/20 hover:text-brand'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Floating Player Controls */}
          {!isComplete && (
            <div className="pointer-events-auto flex items-center gap-4 bg-white/90 backdrop-blur-xl p-3 rounded-full shadow-2xl border border-border/20">
              <button 
                onClick={handlePrev} 
                disabled={currentStepIdx === 0}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.08] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <RotateCcw size={20} />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl bg-brand hover:bg-brand-light transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
              </button>

              <button 
                onClick={handleNext} 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.08] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <FastForward size={20} fill="currentColor" />
              </button>
            </div>
          )}

          {/* Right spacer for flex-between */}
          <div className="w-14" />
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center flex flex-col"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] mb-2">{t.practice.greatJob}</h2>
                <p className="text-sm text-foreground/60 mb-6">{t.practice.practiceComplete}</p>
              </div>

              {!isSavingCustom ? (
                <div className="space-y-3 mt-auto">
                  <button 
                    onClick={() => handleFinish()}
                    className="w-full py-4 bg-brand text-white rounded-full font-bold shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    View History
                  </button>
                  <button 
                    onClick={() => setIsSavingCustom(true)}
                    className="w-full py-4 bg-brand/10 text-brand rounded-full font-bold hover:bg-brand/20 transition-all cursor-pointer"
                  >
                    Save as New Template
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-left space-y-4 mt-4 pt-6 border-t border-border/20"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-brand uppercase">Template Name</label>
                    <input 
                      autoFocus
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="e.g., Morning Pour Over" 
                      className="w-full px-4 py-3 bg-foreground/5 rounded-2xl border-none focus:ring-2 focus:ring-brand/30 text-sm font-medium"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsSavingCustom(false)}
                      className="flex-1 py-3 bg-foreground/10 text-foreground/60 rounded-full font-bold hover:bg-foreground/20 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleFinish(customName)}
                      className="flex-1 py-3 bg-brand text-white rounded-full font-bold shadow-md hover:bg-brand-light transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
