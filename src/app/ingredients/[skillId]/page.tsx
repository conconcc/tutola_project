'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ArrowRight, Check, Plus, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { fetchWithSession } from '@/shared/auth/AuthContext';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  isEssential: boolean;
  category: string;
  isRemoved?: boolean;
  isAdded?: boolean;
}

export default function IngredientsPage() {
  const paramsHook = useParams();
  const searchParams = useSearchParams();
  const skillId = (paramsHook.skillId as string) || 'cooking';
  const router = useRouter();

  const dishName = searchParams.get('dishName') || '';
  const servings = searchParams.get('servings') || '1';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemAmount, setCustomItemAmount] = useState('');

  useEffect(() => {
    async function fetchIngredients(): Promise<void> {
      try {
        const res = await fetchWithSession('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dishName, servings }),
        });

        const data = (await res.json()) as { error?: string; isValidRecipe?: boolean; ingredients?: Ingredient[] };
        if (!res.ok) {
          throw new Error(data.error ?? 'Failed to fetch ingredients');
        }

        if (data.isValidRecipe === false) {
          setError('요리명을 찾지 못했어요. 보다 구체적인 이름으로 다시 시도해 주세요.');
        } else {
          setIngredients(data.ingredients ?? []);
        }
      } catch (err) {
        console.error(err);
        setError('재료 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchIngredients();
  }, [dishName, servings]);

  const toggleIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRemoved: !item.isRemoved } : item)),
    );
  };

  const handleAddCustom = () => {
    if (!customItemName.trim()) return;
    setIngredients((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: customItemName.trim(),
        amount: customItemAmount.trim() || '적당량',
        isEssential: false,
        category: 'other',
        isAdded: true,
        isRemoved: false,
      },
    ]);
    setCustomItemName('');
    setCustomItemAmount('');
  };

  const handleConfirm = () => {
    sessionStorage.setItem('finalizedIngredients', JSON.stringify(ingredients));
    router.push(`/plan/${skillId}?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center">
          <Beaker size={32} className="text-brand animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">재료를 확인하는 중...</h2>
          <p className="text-sm text-foreground/50">{dishName}에 필요한 재료와 손질 기준을 정리하고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-red-500 text-3xl">!</span>
        </div>
        <h2 className="text-xl font-bold">{error}</h2>
        <button onClick={() => router.back()} className="px-6 py-3 bg-brand text-white rounded-full font-bold">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-white/50 hover:bg-white rounded-full border border-border/20">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="space-y-4 text-center pb-4">
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-brand">Ingredients</h1>
        <p className="text-foreground/60">
          {dishName} {servings}인분에 필요한 재료입니다. 없는 재료는 제외하고, 집에 있는 재료는 직접 추가해 보세요.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-border/30 space-y-6">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {ingredients.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: item.isRemoved ? 0.5 : 1, y: 0 }}
                className={`flex items-center justify-between p-4 rounded-2xl border ${
                  item.isRemoved ? 'border-border/30 bg-foreground/[0.02] grayscale' : 'border-brand/20 bg-brand/5 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${item.isRemoved ? 'line-through text-foreground/40' : 'text-foreground'}`}>
                      {item.name}
                    </span>
                    {item.isEssential && !item.isAdded ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-500 rounded-full">필수</span>
                    ) : null}
                    {item.isAdded ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-600 rounded-full">추가</span>
                    ) : null}
                  </div>
                  <span className={`text-sm ${item.isRemoved ? 'text-foreground/30' : 'text-brand font-medium'}`}>{item.amount}</span>
                </div>
                <button
                  onClick={() => toggleIngredient(item.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.isRemoved ? 'bg-white border border-border/40 text-foreground/30' : 'bg-brand text-white shadow-md'
                  }`}
                >
                  {item.isRemoved ? <Plus size={18} /> : <Check size={18} />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="pt-6 border-t border-border/20 space-y-3">
          <span className="text-sm font-bold text-foreground/60">직접 재료 추가하기</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="재료명"
              value={customItemName}
              onChange={(event) => setCustomItemName(event.target.value)}
              className="flex-1 px-4 py-3 bg-foreground/5 rounded-2xl text-sm font-medium"
            />
            <input
              type="text"
              placeholder="양"
              value={customItemAmount}
              onChange={(event) => setCustomItemAmount(event.target.value)}
              className="w-24 px-4 py-3 bg-foreground/5 rounded-2xl text-sm font-medium"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customItemName.trim()}
              className="px-5 py-3 bg-foreground/[0.05] hover:bg-brand hover:text-white disabled:opacity-30 rounded-2xl font-bold"
            >
              추가
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleConfirm} className="w-full py-5 bg-brand text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-2">
        Confirm Ingredients <ArrowRight size={20} />
      </button>
    </div>
  );
}
