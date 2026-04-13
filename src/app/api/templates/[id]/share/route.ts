import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prismaClient';
import { requireUserSession } from '@/server/security/authGuard';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function generateShareToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const auth = await requireUserSession(request);
  if (!auth.isAuthorized || !auth.session?.userId) {
    return auth.response ?? NextResponse.json({ success: false }, { status: 403 });
  }

  const { id } = await context.params;
  const template = await prisma.lessonTemplate.findFirst({
    where: {
      id,
      userId: auth.session.userId,
    },
  });

  if (!template) {
    return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
  }

  const existingShare = await prisma.lessonShare.findFirst({
    where: {
      lessonTemplateId: template.id,
    },
  });

  if (existingShare) {
    return NextResponse.json({
      success: true,
      share: existingShare,
    });
  }

  const share = await prisma.lessonShare.create({
    data: {
      lessonTemplateId: template.id,
      shareToken: generateShareToken(),
    },
  });

  return NextResponse.json({
    success: true,
    share,
  });
}
