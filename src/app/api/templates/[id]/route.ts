import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prismaClient';
import { requireUserSession } from '@/server/security/authGuard';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
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
    include: {
      classTag: true,
      shares: true,
    },
  });

  if (!template) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    template,
  });
}
