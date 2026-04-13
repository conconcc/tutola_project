import type { Step } from '../../scenario-engine/domain/types';

export interface CookingConfig {
  dishName: string;
  servings: number;
  cookingLevel: string;
}

function buildDefaultDishLabel(dishName: string): string {
  const normalized = dishName.trim();
  return normalized.length > 0 ? normalized : '기본 요리';
}

export function buildCookingPlan(config: CookingConfig): Step[] {
  const dish = buildDefaultDishLabel(config.dishName);
  const servings = config.servings > 0 ? config.servings : 2;
  const beginnerTip = config.cookingLevel === 'beginner';

  return [
    {
      id: 'cooking-gather',
      title: '재료 꺼내기와 조리 도구 준비',
      description: `${servings}인분 기준으로 ${dish}에 들어갈 재료와 팬, 집게, 칼, 도마를 한곳에 모읍니다.`,
      status: 'pending',
      estimatedDurationSeconds: 180,
      detailLevel: 'detailed',
      prepGuide: '재료를 종류별로 한 줄로 세워두고, 양념은 작은 그릇에 미리 덜어두면 중간에 허둥대지 않습니다.',
      whenToProceed: '팬, 칼, 도마, 재료가 모두 손 닿는 위치에 있고 불을 켜기 전 준비가 끝난 상태면 됩니다.',
      mistakeToAvoid: '팬을 먼저 달구고 재료를 찾기 시작하면 마늘이나 양파가 바로 탈 수 있습니다.',
      tip: beginnerTip ? '조리 시작 전에 싱크대와 작업대를 비워두면 단계 전환이 훨씬 편합니다.' : '양념을 미리 계량해 두면 전체 템포를 일정하게 유지하기 좋습니다.',
    },
    {
      id: 'cooking-wash-prep',
      title: '세척과 기본 손질',
      description: '채소와 부재료를 세척하고 물기를 제거한 뒤, 손질 순서대로 도마 위에 나눠 둡니다.',
      status: 'pending',
      estimatedDurationSeconds: 240,
      detailLevel: 'detailed',
      prepGuide: '잎채소는 물기를 꼭 털고, 김치처럼 수분이 많은 재료는 가볍게 짜거나 체에 잠시 받쳐 수분을 정리합니다.',
      cuttingGuide: '양파는 0.5cm 두께로 채 썰고, 대파는 3~4mm 두께로 송송 썰고, 마늘은 아주 잘게 다지거나 얇게 편 썹니다.',
      whenToProceed: '채소 표면의 큰 물기가 없어 팬에 넣었을 때 기름이 심하게 튀지 않을 정도면 됩니다.',
      mistakeToAvoid: '물기 제거 없이 바로 볶기 시작하면 향이 올라오기 전에 재료가 질척해집니다.',
      tip: '김치가 들어가는 요리는 김치 길이를 2~3cm 정도로 잘라야 면이나 밥과 함께 집기 편합니다.',
    },
    {
      id: 'cooking-cutting-order',
      title: '재료 크기 맞추기',
      description: `${dish}에 들어갈 재료를 익는 속도에 맞춰 같은 크기로 정리합니다.`,
      status: 'pending',
      estimatedDurationSeconds: 180,
      detailLevel: 'detailed',
      cuttingGuide: '베이컨이나 고기는 한입 크기인 1.5~2cm, 버섯은 0.7cm 안팎 슬라이스, 면과 섞일 채소는 너무 길지 않게 4~5cm 이내로 정리합니다.',
      whenToProceed: '같이 볶일 재료들이 너무 크거나 두껍지 않아 한 팬에서 비슷한 시간에 익을 것처럼 보이면 충분합니다.',
      mistakeToAvoid: '고기나 단단한 채소를 너무 크게 자르면 채소는 숨이 죽고 고기는 덜 익는 불균형이 생깁니다.',
      tip: '손질이 끝난 재료는 “향 재료 / 메인 재료 / 마무리 재료”로 구획을 나눠 두면 투입 순서를 실수하지 않습니다.',
    },
    {
      id: 'cooking-heat-pan',
      title: '팬 예열과 향 재료 시작',
      description: '중불에서 팬을 충분히 예열한 뒤 기름을 두르고 마늘, 대파처럼 향이 먼저 필요한 재료부터 넣습니다.',
      status: 'pending',
      estimatedDurationSeconds: 120,
      detailLevel: 'detailed',
      heatLevel: '중불',
      whenToProceed: '기름이 묽게 퍼지고 마늘 가장자리에서 가벼운 지글거림이 들리면 다음 재료를 넣기 좋습니다.',
      mistakeToAvoid: '센불에서 시작하면 향이 올라오기 전에 마늘이 갈색으로 타서 쓴맛이 납니다.',
      tip: '팬이 덜 달궈졌다면 재료가 기름을 먹고 눅눅해집니다. 첫 30초는 조급해하지 않는 편이 좋습니다.',
    },
    {
      id: 'cooking-main-sequence',
      title: '메인 재료 순서대로 볶기',
      description: '익는 시간이 긴 재료부터 넣고 볶은 뒤, 수분이 많은 재료와 소스를 이어서 넣어 전체 맛의 중심을 만듭니다.',
      status: 'pending',
      estimatedDurationSeconds: 420,
      detailLevel: 'detailed',
      heatLevel: '중불에서 중강불 사이',
      prepGuide: '고기나 베이컨을 먼저 70% 정도 익힌 뒤 김치, 양파, 버섯, 소스 순으로 이어가면 팬의 온도가 안정적입니다.',
      whenToProceed: '김치나 채소의 풋내가 줄고 기름과 양념이 재료 표면에 고르게 묻기 시작하면 다음 단계로 넘어갈 준비가 된 것입니다.',
      mistakeToAvoid: '한 번에 모든 재료를 넣으면 팬 온도가 급격히 떨어져 볶음이 아니라 찜에 가까워집니다.',
      tip: '팬 바닥이 마르면 물이나 면수 한두 큰술로 온도를 안정시키고 눌어붙는 부분을 살짝 풀어주세요.',
    },
    {
      id: 'cooking-simmer-balance',
      title: '수분과 농도 맞추기',
      description: '소스나 면수, 물을 더해 농도를 정리하고 재료가 서로 맛을 주고받도록 1~2분 더 익힙니다.',
      status: 'pending',
      estimatedDurationSeconds: 180,
      detailLevel: 'detailed',
      heatLevel: '중불',
      whenToProceed: '소스가 물처럼 흘러내리지 않고 주걱이나 집게로 저었을 때 재료 표면에 얇게 코팅되면 적당합니다.',
      mistakeToAvoid: '물을 너무 많이 넣으면 간을 다시 맞추느라 조리 시간이 길어지고 식감이 무너집니다.',
      tip: beginnerTip ? '너무 되직하면 물 한 큰술씩만 추가하며 상태를 보는 것이 안전합니다.' : '면 요리라면 면수의 전분을 이용해 농도를 잡는 편이 더 자연스럽습니다.',
    },
    {
      id: 'cooking-season',
      title: '간 확인과 최종 보정',
      description: '불을 한 단계 낮추고 맛을 본 뒤 소금, 후추, 산미 또는 단맛 요소를 소량씩 조절합니다.',
      status: 'pending',
      estimatedDurationSeconds: 120,
      detailLevel: 'detailed',
      heatLevel: '약불',
      whenToProceed: '첫맛보다 끝맛이 더 정돈되고, 재료 따로 양념 따로 놀지 않으면 마무리 단계로 넘어갈 수 있습니다.',
      mistakeToAvoid: '한 번에 소금을 많이 넣으면 되돌리기 어려우니 반드시 소량씩 추가합니다.',
      tip: '김치나 장류가 들어간 요리는 짠맛보다 신맛과 감칠맛 균형을 같이 확인해야 전체 맛이 안정됩니다.',
    },
    {
      id: 'cooking-plate',
      title: '마무리와 플레이팅',
      description: '불을 끄고 잔열로 마지막 정리를 한 뒤, 그릇에 담아 고명이나 마무리 오일을 더합니다.',
      status: 'pending',
      estimatedDurationSeconds: 150,
      detailLevel: 'detailed',
      prepGuide: '그릇은 미리 꺼내두고, 팬에서 바로 담을 수 있게 집게나 국자를 준비합니다.',
      whenToProceed: '국물과 건더기 비율이 자연스럽고, 접시에 담았을 때 모양이 흐트러지지 않으면 완성입니다.',
      mistakeToAvoid: '불을 끈 뒤에도 팬 위에 오래 두면 잔열로 재료가 더 익어 식감이 퍼질 수 있습니다.',
      tip: '마지막에 송송 썬 파, 후추, 치즈, 허브 중 한 가지라도 올리면 레슨용 결과물이 훨씬 좋아 보입니다.',
    },
  ];
}
