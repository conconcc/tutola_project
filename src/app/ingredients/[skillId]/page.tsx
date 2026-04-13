'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight, Check, Plus, Beaker } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


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
  const skillId = (paramsHook['skillId'] as string) || 'cooking';
  const router = useRouter();

  const dishName = searchParams.get('dishName') || '';
  const servings = searchParams.get('servings') || '1';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemAmount, setCustomItemAmount] = useState('');

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dishName, servings }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch ingredients');
        
        if (data.isValidRecipe === false) {
          setError('해당 요리의 레시피를 찾을 수 없거나 식용 불가능한 요리입니다. 정확한 요리명을 입력해주세요.');
        } else {
          setIngredients(data.ingredients || []);
        }
      } catch (err) {
        console.error(err);
        setError('재료 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, [dishName, servings]);

  const toggleIngredient = (id: string) => {
    setIngredients(prev => prev.map(item => 
      item.id === id ? { ...item, isRemoved: !item.isRemoved } : item
    ));
  };

  const handleAddCustom = () => {
    if (!customItemName.trim()) return;
    const newItem: Ingredient = {
      id: `custom-${Date.now()}`,
      name: customItemName.trim(),
      amount: customItemAmount.trim() || '적당량',
      isEssential: false,
      category: 'other',
      isAdded: true,
      isRemoved: false,
    };
    setIngredients(prev => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemAmount('');
  };

  const handleConfirm = () => {
    // sessionStorage에 최종 확정된 재료 리스트 저장 후 plan 페이지로 이동
    const finalized = ingredients;
    sessionStorage.setItem('finalizedIngredients', JSON.stringify(finalized));
    router.push(`/plan/${skillId}?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center">
          <Beaker size={32} className="text-brand animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">재료 목록 분석 중...</h2>
          <p className="text-sm text-foreground/50">&apos;{dishName}&apos;의 완벽한 레시피를 위해 AI가 필요한 재료를 추출하고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-500 text-3xl">⚠️</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">{error}</h2>
        </div>
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 bg-brand text-white rounded-full font-bold shadow-md cursor-pointer hover:bg-brand-light"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors cursor-pointer border border-border/20">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="space-y-4 text-center pb-4">
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-brand">
          Ingredients
        </h1>
        <p className="text-foreground/60">
          &apos;{dishName}&apos; {servings}인분에 필요한 재료입니다.<br/>
          없는 재료는 체크 해제하고, 냉장고에 있는 재료를 추가해보세요.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-border/30 space-y-6">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {ingredients.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: item.isRemoved ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  item.isRemoved ? 'border-border/30 bg-foreground/[0.02] grayscale' : 'border-brand/20 bg-brand/5 shadow-sm'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${item.isRemoved ? 'line-through text-foreground/40' : 'text-foreground'}`}>
                      {item.name}
                    </span>
                    {item.isEssential && !item.isAdded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-500 rounded-full">필수</span>
                    )}
                    {item.isAdded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-600 rounded-full">추가됨</span>
                    )}
                  </div>
                  <span className={`text-sm ${item.isRemoved ? 'text-foreground/30' : 'text-brand font-medium'}`}>
                    {item.amount}
                  </span>
                </div>

                <button 
                  onClick={() => toggleIngredient(item.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    item.isRemoved ? 'bg-white border border-border/40 text-foreground/30 hover:bg-foreground/[0.05]' : 'bg-brand text-white shadow-md hover:bg-brand-light'
                  }`}
                >
                  {item.isRemoved ? <Plus size={18} /> : <Check size={18} />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Custom Ingredient Add */}
        <div className="pt-6 border-t border-border/20 space-y-3">
          <span className="text-sm font-bold text-foreground/60">집에 있는 다른 재료 추가하기</span>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="재료명 (예: 베이컨)" 
              value={customItemName}
              onChange={e => setCustomItemName(e.target.value)}
              className="flex-1 px-4 py-3 bg-foreground/5 rounded-2xl border-none focus:ring-2 focus:ring-brand/30 text-sm font-medium"
            />
            <input 
              type="text" 
              placeholder="수량 (예: 2줄)" 
              value={customItemAmount}
              onChange={e => setCustomItemAmount(e.target.value)}
              className="w-24 px-4 py-3 bg-foreground/5 rounded-2xl border-none focus:ring-2 focus:ring-brand/30 text-sm font-medium"
            />
            <button 
              onClick={handleAddCustom}
              disabled={!customItemName.trim()}
              className="px-5 py-3 bg-foreground/[0.05] hover:bg-brand hover:text-white disabled:opacity-30 disabled:hover:bg-foreground/[0.05] disabled:hover:text-foreground rounded-2xl font-bold transition-colors cursor-pointer"
            >
              추가
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={handleConfirm}
        className="w-full mt-4 py-5 bg-brand hover:bg-brand-light text-white rounded-[1.5rem] font-bold tracking-wide transition-all shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group"
      >
        Confirm Ingredients <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
