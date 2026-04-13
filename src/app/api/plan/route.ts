import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { loadPrompt } from '@/lib/promptLoader';

export const maxDuration = 45;

// ─── 요청 스키마 ────────────────────────────────────────────────────────────

const finalizedIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  isAdded: z.boolean().optional(),
  isRemoved: z.boolean().optional(),
});

const requestSchema = z.object({
  skillId: z.enum(['coffee', 'laundry', 'cooking']),
  // coffee
  coffeeBean: z.string().optional(),
  temperature: z.number().optional(),
  beanAmount: z.number().optional(),
  targetWater: z.number().optional(),
  flavorPreference: z.string().optional(),
  kettleAvailable: z.boolean().optional(),
  // laundry
  clothingItem: z.string().optional(),
  fabricType: z.string().optional(),
  soilLevel: z.string().optional(),
  loadWeight: z.string().optional(),
  washerType: z.string().optional(),
  // cooking
  dishName: z.string().optional(),
  servings: z.number().optional(),
  cookingLevel: z.string().optional(),
  finalizedIngredients: z.array(finalizedIngredientSchema).optional(),
});

type PlanRequest = z.infer<typeof requestSchema>;

// ─── AI 출력 스키마 ─────────────────────────────────────────────────────────

const outputSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string().describe('스텝 고유 ID (예: "step-1")'),
      title: z.string().describe('스텝 제목'),
      description: z.string().describe('구체적인 행동 지침'),
      status: z.literal('pending'),
      hint: z.string().optional().describe('숙련도에 맞는 실용적인 팁'),
      estimatedDurationSeconds: z.number().int().positive().describe('예상 소요 시간(초)'),
    }),
  ).describe('세분화된 과정 배열'),
});

// ─── 시나리오별 프롬프트 빌더 ───────────────────────────────────────────────

function getSystemPrompt(body: PlanRequest): string {
  if (body.skillId === 'coffee') {
    return `<persona>당신은 친숙하고 다정한 동네 단골 카페 바리스타입니다. 실생활에서 바로 쓸 수 있는 실용적인 팁을 선호하며 친절한 존댓말을 사용합니다.</persona>
<rules>
1. 사용자가 입력한 조건(원두, 물 온도, 드리퍼 등)에 맞춰 핸드드립 추출 순서와 팁을 작성하세요.
2. 반드시 주어진 JSON 스키마 형태로만 출력하세요.
</rules>
<edge_cases>
1. 장난스러운 원두 이름(예: "김치찌개맛"): 정색하지 말고 넉살 좋게 받아치고 표준 브루잉 플랜을 제공하세요.
2. 주전자 없음: 종이컵 끝을 구부려 대체하는 현실적인 야매 팁을 포함하세요.
</edge_cases>`;
  }

  if (body.skillId === 'laundry') {
    return `<persona>당신은 동네 세탁소 사장님처럼 친근하고 다정한 세탁 마스터입니다. 옷감을 보호하면서 깨끗이 세탁하는 방법을 친절한 존댓말로 안내합니다.</persona>
<rules>
1. 입력된 조건(옷 종류, 옷감, 오염도, 세탁량)을 분석하여 세탁 순서를 작성하세요.
2. 세탁량에 비례하여 세제 투입량을 명시하세요.
3. 반드시 주어진 JSON 스키마 형태로만 출력하세요.
</rules>
<edge_cases>
1. 세탁기 절대 금지 의류(가죽 자켓, 오리털 패딩, 명품 실크 등): 스텝 1번에 "세탁기 절대 금지! 세탁소에 맡기세요." 강력 경고를 포함하세요.
</edge_cases>`;
  }

  // cooking — 전용 프롬프트 파일 사용
  return loadPrompt('adaptive-plan', 'v1.0.0');
}

function getUserPrompt(body: PlanRequest): string {
  if (body.skillId === 'coffee') {
    return `원두: ${body.coffeeBean ?? '에티오피아 예가체프'}, 물 온도: ${body.temperature ?? 92}도, 원두 ${body.beanAmount ?? 15}g / 물 ${body.targetWater ?? 250}g, 맛 선호도: ${body.flavorPreference ?? 'balanced'}, 주전자 유무: ${body.kettleAvailable ?? true}`;
  }

  if (body.skillId === 'laundry') {
    return `옷 종류: ${body.clothingItem ?? '일반 의류'}, 옷감: ${body.fabricType ?? 'cotton'}, 오염도: ${body.soilLevel ?? 'normal'}, 세탁량: ${body.loadWeight ?? 'medium'}, 세탁기 종류: ${body.washerType ?? 'front_load'}`;
  }

  // cooking
  const ingredientText = (body.finalizedIngredients ?? [])
    .map(
      item =>
        `- ${item.name} (${item.amount})${item.isAdded === true ? ' [추가됨]' : ''}${item.isRemoved === true ? ' [제거됨]' : ''}`,
    )
    .join('\n');

  return `요리: ${body.dishName ?? '미정'}
숙련도: ${body.cookingLevel ?? '초보'}
인분 수: ${body.servings ?? 1}인분

[확정된 재료 목록]
${ingredientText || '(재료 미입력)'}`;
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'skillId(coffee|laundry|cooking)는 필수이며 올바른 형식이어야 합니다.' },
      { status: 400 },
    );
  }

  const body = parsed.data;

  try {
    const result = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      output: 'object',
      system: getSystemPrompt(body),
      prompt: getUserPrompt(body),
      schema: outputSchema,
      temperature: 0.6,
    });

    return NextResponse.json({ results: result.object.steps });
  } catch (error) {
    console.error('[Plan API Error]', error);
    return NextResponse.json(
      { error: 'AI 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    );
  }
}
