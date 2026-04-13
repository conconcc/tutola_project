import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { loadPrompt } from '@/lib/promptLoader';

export const maxDuration = 30;

const requestSchema = z.object({
  dishName: z.string().min(1, '요리 이름을 입력해주세요.').max(100),
  servings: z.coerce.number().int().min(1).max(20).default(1),
});

const responseSchema = z.object({
  isValidRecipe: z.boolean().describe('실제 존재하는 식용 가능한 요리인지 여부'),
  recipeName: z.string().describe('정규화된 표준 요리 이름 (예: "알리오올리오" → "알리오 올리오 파스타")'),
  ingredients: z.array(
    z.object({
      id: z.string().describe('재료 고유 영문 ID (예: "garlic", "spaghetti")'),
      name: z.string().describe('재료명 (한국어)'),
      amount: z.string().describe('수량과 단위 포함 (예: "100g", "4쪽", "약간")'),
      isEssential: z.boolean().describe('이 요리에 필수적인 재료인지 여부'),
      category: z.enum(['main', 'vegetable', 'seasoning', 'other']).describe('재료 분류'),
    }),
  ).describe('요리에 필요한 재료 목록. isValidRecipe가 false이면 빈 배열'),
});

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
      { error: parsed.error.issues[0]?.message ?? '요청 형식이 올바르지 않습니다.' },
      { status: 400 },
    );
  }

  const { dishName, servings } = parsed.data;

  try {
    const systemPrompt = loadPrompt('ingredient-analyzer', 'v1.0.0');

    const result = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      output: 'object',
      system: systemPrompt,
      prompt: `요리 이름: ${dishName}\n인분 수: ${servings}인분\n\n위 요리의 재료를 분석해주세요. 실제 존재하지 않는 요리라면 isValidRecipe를 false로, ingredients를 빈 배열로 반환하세요.`,
      schema: responseSchema,
      temperature: 0.1,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error('[Ingredients API Error]', error);
    return NextResponse.json(
      { error: 'AI 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    );
  }
}
