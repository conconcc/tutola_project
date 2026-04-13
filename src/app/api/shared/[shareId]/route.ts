import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prismaClient';

interface RouteContext {
  params: Promise<{ shareId: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { shareId } = await context.params;
  const share = await prisma.lessonShare.findUnique({
    where: {
      shareToken: shareId,
    },
    include: {
      lessonTemplate: {
        include: {
          user: true,
          classTag: true,
        },
      },
    },
  });

  if (!share) {
    return NextResponse.json({ success: false, error: 'Shared lesson not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    share: {
      id: share.id,
      shareToken: share.shareToken,
      createdAt: share.createdAt,
      template: share.lessonTemplate,
    },
  });
}
