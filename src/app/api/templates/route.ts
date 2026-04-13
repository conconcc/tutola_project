import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/server/db/prismaClient';
import { requireUserSession } from '@/server/security/authGuard';

const stepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  estimatedDurationSeconds: z.number().optional(),
  hint: z.string().optional(),
  detailLevel: z.string().optional(),
  prepGuide: z.string().optional(),
  cuttingGuide: z.string().optional(),
  heatLevel: z.string().optional(),
  whenToProceed: z.string().optional(),
  mistakeToAvoid: z.string().optional(),
  tip: z.string().optional(),
});

const createTemplateSchema = z.object({
  scenarioKey: z.enum(['coffee', 'laundry', 'cooking']),
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(200).optional(),
  classTag: z.string().trim().min(2).max(40).optional(),
  parameters: z.record(z.string(), z.unknown()),
  planSteps: z.array(stepSchema),
});

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function POST(request: Request): Promise<Response> {
  const auth = await requireUserSession(request);
  if (!auth.isAuthorized || !auth.session?.userId) {
    return auth.response ?? NextResponse.json({ success: false }, { status: 403 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createTemplateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid template payload' }, { status: 400 });
  }

  let classTagId: string | undefined;
  if (parsed.data.classTag) {
    const classTag = await prisma.classTag.upsert({
      where: {
        slug: slugify(parsed.data.classTag),
      },
      update: {
        label: parsed.data.classTag,
      },
      create: {
        slug: slugify(parsed.data.classTag),
        label: parsed.data.classTag,
      },
    });
    classTagId = classTag.id;
  }

  const template = await prisma.lessonTemplate.create({
    data: {
      userId: auth.session.userId,
      scenarioKey: parsed.data.scenarioKey,
      title: parsed.data.title,
      parameters: parsed.data.parameters as Prisma.InputJsonValue,
      planSteps: parsed.data.planSteps as Prisma.InputJsonValue,
      ...(parsed.data.description ? { description: parsed.data.description } : {}),
      ...(classTagId ? { classTagId } : {}),
    },
    include: {
      classTag: true,
    },
  });

  return NextResponse.json({
    success: true,
    template,
  });
}
