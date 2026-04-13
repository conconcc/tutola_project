import type { Step } from '../../scenario-engine/domain/types';

export interface CookingConfig {
  dishName: string; // e.g., '스테이크', '알리오 올리오'
  servings: string; // '1', '2', '4'
  cookingLevel: string; // 'beginner', 'intermediate', 'advanced'
}

export function buildCookingPlan(config: CookingConfig): Step[] {
  const plan: Step[] = [];
  const dish = config.dishName.trim() || '간단한 요리';
  const isBeginner = config.cookingLevel === 'beginner';

  // Base multiplier for servings
  const servingMultiplier = config.servings === '1' ? 1 : config.servings === '2' ? 1.5 : 2;

  // Step 1: Prep
  plan.push({
    id: 'cooking-prep',
    title: '재료 준비 및 손질',
    description: `${config.servings}인분에 맞는 ${dish} 재료를 꺼내고 세척, 손질합니다.`,
    status: 'pending',
    hint: isBeginner 
      ? '요리를 시작하기 전에 모든 재료를 손질해두면 당황하지 않고 요리할 수 있습니다.' 
      : '칼질 시 교차 오염에 주의하세요.',
    estimatedDurationSeconds: Math.floor(300 * servingMultiplier),
  });

  // Step 2: Main Cooking
  plan.push({
    id: 'cooking-main',
    title: '본격 조리하기',
    description: `준비된 재료로 ${dish}의 메인 조리를 시작합니다. 불 조절에 유의하세요.`,
    status: 'pending',
    hint: isBeginner 
      ? '레시피에 적힌 불 세기(강불/중불/약불)를 잘 지키는 것이 가장 중요합니다.' 
      : '팬이 충분히 예열된 후 재료를 넣어야 맛이 살아납니다.',
    estimatedDurationSeconds: Math.floor(600 * servingMultiplier),
  });

  // Step 3: Seasoning
  plan.push({
    id: 'cooking-seasoning',
    title: '간 맞추기 및 마무리',
    description: `요리의 맛을 보고 소금, 후추 등으로 부족한 간을 맞춥니다.`,
    status: 'pending',
    hint: '한 번에 많이 넣지 말고 조금씩 넣어가며 맛을 보세요.',
    estimatedDurationSeconds: 120,
  });

  // Step 4: Plating
  plan.push({
    id: 'cooking-plating',
    title: '플레이팅',
    description: `완성된 ${dish}을(를) 그릇에 예쁘게 담아냅니다.`,
    status: 'pending',
    hint: '음식을 중앙에 소복하게 담으면 더 먹음직스러워 보입니다.',
    estimatedDurationSeconds: 180,
  });

  return plan;
}
