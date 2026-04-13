import type { CoffeeState, Step } from '../../scenario-engine/domain/types';

function buildExtractionStep(flavorPreference: CoffeeState['flavorPreference']): Step {
  if (flavorPreference === 'strong') {
    return {
      id: 'coffee-extract-strong',
      title: '진하게 추출하기',
      description: '추출 시간을 늘려 더 진한 바디감을 만듭니다.',
      status: 'pending',
      hint: '기본보다 10~15초 정도 길게 추출해 보세요.',
    };
  }

  if (flavorPreference === 'light') {
    return {
      id: 'coffee-extract-light',
      title: '가볍게 추출하기',
      description: '추출 시간을 줄여 깔끔하고 밝은 맛을 만듭니다.',
      status: 'pending',
      hint: '기본보다 10초 정도 짧게 추출해 보세요.',
    };
  }

  return {
    id: 'coffee-extract-balanced',
    title: '균형 잡힌 추출하기',
    description: '표준 추출 시간으로 밸런스를 맞춥니다.',
    status: 'pending',
    hint: '물을 일정한 속도로 원을 그리며 부어 주세요.',
  };
}

export function buildCoffeePlan(state: CoffeeState): Step[] {
  const plan: Step[] = [
    {
      id: 'coffee-prepare',
      title: '도구 준비',
      description: '드리퍼, 필터, 서버를 준비합니다.',
      status: 'pending',
      hint: '필터를 먼저 린싱하면 종이 냄새를 줄일 수 있어요.',
    },
    {
      id: 'coffee-heat-water',
      title: '물 준비',
      description: '물 온도와 양을 맞춰 준비합니다.',
      status: 'pending',
      hint: '92~96도 범위의 물이 일반적으로 적절합니다.',
    },
    {
      id: 'coffee-bloom',
      title: '뜸 들이기',
      description: '초기 소량의 물로 가스를 배출합니다.',
      status: 'pending',
      hint: '원두량의 약 2배 물로 30초 전후로 뜸을 들여 보세요.',
    },
    buildExtractionStep(state.flavorPreference),
  ];

  if (!state.kettleAvailable) {
    plan.splice(1, 0, {
      id: 'kettle-substitute',
      title: '주전자 대체 단계',
      description: '스파우트가 있는 용기나 계량컵으로 물줄기를 제어합니다.',
      status: 'pending',
      hint: '한 번에 많이 붓지 말고 여러 번 나눠서 천천히 부어 주세요.',
    });
  }

  return plan;
}
