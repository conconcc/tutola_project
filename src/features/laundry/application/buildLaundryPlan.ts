import type { Step } from '../../scenario-engine/domain/types';

export interface LaundryConfig {
  fabricType: string; // 'cotton', 'wool', 'silk'
  soilLevel: string; // 'light', 'heavy'
  washerType: string; // 'front_load', 'top_load'
}

export function buildLaundryPlan(config: LaundryConfig): Step[] {
  const plan: Step[] = [];

  // Step 1: Pre-treatment based on soil level
  if (config.soilLevel === 'heavy') {
    plan.push({
      id: 'laundry-pretreat',
      title: '애벌 빨래 (Pre-treat)',
      description: '오염이 심한 부분에 세제를 미리 묻혀 가볍게 문질러 줍니다.',
      status: 'pending',
      hint: '뜨거운 물보다는 미지근한 물이 얼룩 제거에 좋습니다.',
      estimatedDurationSeconds: 180,
    });
  }

  // Step 2: Sorting and Preparation
  if (config.fabricType === 'wool' || config.fabricType === 'silk') {
    plan.push({
      id: 'laundry-sort-delicate',
      title: '세탁망에 넣기',
      description: '손상을 막기 위해 옷을 뒤집어서 세탁망에 넣습니다.',
      status: 'pending',
      hint: '너무 꽉 차지 않게 여유 공간을 남겨주세요.',
      estimatedDurationSeconds: 60,
    });
  } else {
    plan.push({
      id: 'laundry-sort-normal',
      title: '세탁기 투입',
      description: '색상별로 분류된 옷감을 세탁기에 넣습니다.',
      status: 'pending',
      hint: '주머니에 이물질이 없는지 한 번 더 확인하세요.',
      estimatedDurationSeconds: 60,
    });
  }

  // Step 3: Detergent Setup
  if (config.fabricType === 'wool' || config.fabricType === 'silk') {
    plan.push({
      id: 'laundry-detergent-neutral',
      title: '중성 세제 투입',
      description: '울샴푸 등 중성 세제를 전용 칸에 적당량 넣습니다.',
      status: 'pending',
      hint: '일반 알칼리성 세제는 옷감을 손상시킬 수 있습니다.',
      estimatedDurationSeconds: 30,
    });
  } else {
    plan.push({
      id: 'laundry-detergent-normal',
      title: '일반 세제 투입',
      description: '표준 세제를 정량 투입합니다. 오염이 심하므로 표백제를 약간 추가해도 좋습니다.',
      status: 'pending',
      hint: '가루 세제는 미지근한 물에 미리 녹여 넣으면 잔여물이 남지 않습니다.',
      estimatedDurationSeconds: 30,
    });
  }

  // Step 4: Machine Course Setting
  let courseTitle = '표준 코스 설정';
  let courseDesc = '일반 세탁 코스로 설정하고 물 온도를 30~40도로 맞춥니다.';

  if (config.fabricType === 'wool') {
    courseTitle = '울/섬세 코스 설정';
    courseDesc = '물 온도를 차갑게(20도 이하) 하고, 탈수는 가장 약하게 설정합니다.';
  } else if (config.fabricType === 'silk') {
    courseTitle = '란제리 코스 설정';
    courseDesc = '가장 약한 수류와 탈수 세기를 선택합니다.';
  } else if (config.soilLevel === 'heavy') {
    courseTitle = '불림 코스 설정';
    courseDesc = '오염이 심하므로 불림 기능을 추가하고 40도 이상의 물을 사용합니다.';
  }

  plan.push({
    id: 'laundry-course-setting',
    title: courseTitle,
    description: courseDesc,
    status: 'pending',
    hint: config.washerType === 'top_load' ? '물을 먼저 받고 세제를 풀어 거품을 낸 뒤 옷을 넣으면 더 좋습니다.' : '드럼 세탁기는 낙차를 이용하므로 너무 많은 빨래를 넣지 마세요.',
    estimatedDurationSeconds: 30,
  });

  return plan;
}
