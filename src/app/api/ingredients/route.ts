import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

import { loadPrompt } from '@/lib/promptLoader';
import { guardSession } from '@/server/security/authGuard';
import { guardRateLimit } from '@/server/security/rateLimiter';

export const maxDuration = 30;

const requestSchema = z.object({
  dishName: z.string().min(1).max(100),
  servings: z.coerce.number().int().min(1).max(20).default(1),
});

const responseSchema = z.object({
  isValidRecipe: z.boolean(),
  recipeName: z.string(),
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.string(),
      isEssential: z.boolean(),
      category: z.enum(['main', 'vegetable', 'seasoning', 'other']),
    }),
  ),
});

function buildGuestFallbackIngredients(dishName: string, servings: number) {
  const normalized = dishName.toLowerCase();
  if (normalized.includes('파스타') || normalized.includes('pasta')) {
    return {
      isValidRecipe: true,
      recipeName: dishName,
      ingredients: [
        { id: 'pasta', name: '파스타 면', amount: `${servings * 100}g`, isEssential: true, category: 'main' as const },
        { id: 'garlic', name: '마늘', amount: '3쪽', isEssential: true, category: 'seasoning' as const },
        { id: 'onion', name: '양파', amount: '1/2개', isEssential: true, category: 'vegetable' as const },
        { id: 'oil', name: '올리브오일', amount: '2큰술', isEssential: true, category: 'seasoning' as const },
        ...(normalized.includes('김치')
          ? [{ id: 'kimchi', name: '김치', amount: '1컵', isEssential: true, category: 'vegetable' as const }]
          : []),
      ],
    };
  }

  return {
    isValidRecipe: true,
    recipeName: dishName,
    ingredients: [
      { id: 'main', name: '메인 재료', amount: `${servings}인분`, isEssential: true, category: 'main' as const },
      { id: 'garlic', name: '마늘', amount: '2쪽', isEssential: false, category: 'seasoning' as const },
      { id: 'onion', name: '양파', amount: '1/2개', isEssential: false, category: 'vegetable' as const },
      { id: 'salt', name: '소금', amount: '약간', isEssential: false, category: 'seasoning' as const },
    ],
  };
}

export async function POST(req: Request): Promise<Response> {
  const auth = await guardSession(req);
  if (!auth.isAuthorized) {
    return auth.response ?? NextResponse.json({ success: false }, { status: 401 });
  }

  const rateLimit = await guardRateLimit(req);
  if (!rateLimit.isAllowed) {
    return rateLimit.response ?? NextResponse.json({ success: false }, { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { dishName, servings } = parsed.data;

  if (auth.session?.isGuest) {
    return NextResponse.json(buildGuestFallbackIngredients(dishName, servings));
  }

  try {
    const systemPrompt = loadPrompt('ingredient-analyzer', 'v1.0.0');
    const result = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      output: 'object',
      system: systemPrompt,
      prompt: `요리 이름: ${dishName}\n인분 수: ${servings}\n\n학생이 장보기 전에 빠르게 확인할 수 있도록 꼭 필요한 재료 중심으로 정리해주세요.`,
      schema: responseSchema,
      temperature: 0.1,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error('[Ingredients API Error]', error);
    return NextResponse.json(buildGuestFallbackIngredients(dishName, servings), { status: 200 });
  }
}
