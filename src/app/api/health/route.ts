import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prismaClient';

export async function GET(): Promise<Response> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      status: 'ok',
      checks: {
        database: 'ok',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Health API Error]', error);
    return NextResponse.json(
      {
        success: false,
        status: 'degraded',
        checks: {
          database: 'error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
