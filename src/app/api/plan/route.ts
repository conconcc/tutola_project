import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

import { loadPrompt } from '@/lib/promptLoader';
import { buildCoffeePlan } from '@/features/coffee/application/buildCoffeePlan';
import { buildLaundryPlan } from '@/features/laundry/application/buildLaundryPlan';
import { buildCookingPlan } from '@/features/cooking/application/buildCookingPlan';
import { guardSession } from '@/server/security/authGuard';
import { guardRateLimit } from '@/server/security/rateLimiter';

export const maxDuration = 45;

const detailedStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.literal('pending'),
  hint: z.string().optional(),
  estimatedDurationSeconds: z.number().int().positive(),
  detailLevel: z.enum(['standard', 'detailed']).default('detailed'),
  prepGuide: z.string().optional(),
  cuttingGuide: z.string().optional(),
  heatLevel: z.string().optional(),
  whenToProceed: z.string().optional(),
  mistakeToAvoid: z.string().optional(),
  tip: z.string().optional(),
});

const requestSchema = z.discriminatedUnion('skillId', [
  z.object({
    skillId: z.literal('coffee'),
    beanAmount: z.coerce.number().optional(),
    targetWater: z.coerce.number().optional(),
    waterAmount: z.coerce.number().optional(),
    flavorPreference: z.enum(['light', 'balanced', 'strong']).optional(),
    kettleAvailable: z.coerce.boolean().optional(),
  }),
  z.object({
    skillId: z.literal('laundry'),
    fabricType: z.string().optional(),
    soilLevel: z.string().optional(),
    washerType: z.string().optional(),
  }),
  z.object({
    skillId: z.literal('cooking'),
    dishName: z.string().min(1),
    servings: z.coerce.number().int().min(1).max(8),
    cookingLevel: z.string().optional(),
    finalizedIngredients: z
      .array(
        z.object({
          name: z.string(),
          amount: z.string(),
          isAdded: z.boolean().optional(),
          isRemoved: z.boolean().optional(),
        }),
      )
      .optional(),
  }),
]);

function buildCookingSystemPrompt(): string {
  const basePrompt = loadPrompt('adaptive-plan', 'v1.0.0');
  return `${basePrompt}

Write the cooking lesson like a detailed class handout.
- Split the lesson into at least 7 steps.
- Include prep, washing, cutting, heating, ingredient order, heat control, seasoning, and plating.
- Add concrete cutting sizes whenever possible.
- Fill prepGuide, heatLevel, whenToProceed, mistakeToAvoid, and tip whenever relevant.
- Explain the sensory cue for moving to the next step.`;
}

function buildCookingPrompt(body: Extract<z.infer<typeof requestSchema>, { skillId: 'cooking' }>): string {
  const ingredients = (body.finalizedIngredients ?? [])
    .map((item) => `- ${item.name} (${item.amount})${item.isRemoved ? ' [removed]' : ''}${item.isAdded ? ' [added]' : ''}`)
    .join('\n');

  return `Dish: ${body.dishName}
Servings: ${body.servings}
Skill level: ${body.cookingLevel ?? 'beginner'}

Ingredients:
${ingredients.length > 0 ? ingredients : '- no ingredient list provided'}

Generate a student-friendly cooking lesson with precise cutting size, ingredient order, heat control, and checkpoints.`;
}

function buildFallbackPlan(parsedBody: z.infer<typeof requestSchema>) {
  if (parsedBody.skillId === 'coffee') {
    return buildCoffeePlan({
      beanAmount: parsedBody.beanAmount ?? 20,
      waterAmount: parsedBody.targetWater ?? parsedBody.waterAmount ?? 300,
      dripperType: 'v60',
      kettleAvailable: parsedBody.kettleAvailable ?? true,
      flavorPreference: parsedBody.flavorPreference ?? 'balanced',
      currentStepId: '',
      currentView: 'front',
    });
  }

  if (parsedBody.skillId === 'laundry') {
    return buildLaundryPlan({
      fabricType: parsedBody.fabricType ?? 'cotton',
      soilLevel: parsedBody.soilLevel ?? 'light',
      washerType: parsedBody.washerType ?? 'front_load',
    });
  }

  return buildCookingPlan({
    dishName: parsedBody.dishName,
    servings: parsedBody.servings,
    cookingLevel: parsedBody.cookingLevel ?? 'beginner',
  });
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
    return NextResponse.json({ error: 'Invalid plan request payload' }, { status: 400 });
  }

  const body = parsed.data;

  try {
    if (auth.session?.isGuest || body.skillId !== 'cooking') {
      return NextResponse.json({ results: buildFallbackPlan(body), source: 'fallback' });
    }

    const result = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      output: 'object',
      system: buildCookingSystemPrompt(),
      prompt: buildCookingPrompt(body),
      schema: z.object({
        steps: z.array(detailedStepSchema).min(7),
      }),
      temperature: 0.4,
    });

    return NextResponse.json({ results: result.object.steps, source: 'ai' });
  } catch (error) {
    console.error('[Plan API Error]', error);
    return NextResponse.json(
      {
        results: buildFallbackPlan(body),
        source: 'fallback',
        degraded: true,
      },
      { status: 200 },
    );
  }
}
