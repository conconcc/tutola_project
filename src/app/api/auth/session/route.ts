import { NextResponse } from 'next/server';
import { z } from 'zod';

import { guardSession } from '../../../../server/security/authGuard';
import { issueGuestSession, issueUserSession, revokeSession } from '../../../../server/security/sessionStore';

const requestSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('guest'),
  }),
  z.object({
    mode: z.literal('login'),
    displayName: z.string().trim().min(2).max(40),
    role: z.enum(['learner', 'instructor']),
  }),
]);

function getRequestMetadata(request: Request): { userAgent?: string; ipAddress?: string } {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent') ?? undefined;
  const ipAddress = forwardedFor?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? undefined;

  return {
    ...(userAgent ? { userAgent } : {}),
    ...(ipAddress ? { ipAddress } : {}),
  };
}

export async function GET(request: Request): Promise<Response> {
  const auth = await guardSession(request);
  if (!auth.isAuthorized || !auth.session) {
    return NextResponse.json({ success: false, session: null }, { status: auth.response?.status ?? 401 });
  }

  return NextResponse.json({
    success: true,
    session: auth.session,
  });
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    rawBody = { mode: 'guest' };
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'mode, displayName, role 형식이 올바르지 않습니다.' },
      { status: 400 },
    );
  }

  const metadata = getRequestMetadata(request);
  const session =
    parsed.data.mode === 'guest'
      ? await issueGuestSession(metadata)
      : await issueUserSession({
          displayName: parsed.data.displayName,
          role: parsed.data.role,
          ...metadata,
        });

  return NextResponse.json({
    success: true,
    session,
  });
}

export async function DELETE(request: Request): Promise<Response> {
  const auth = await guardSession(request);
  if (!auth.isAuthorized || !auth.session) {
    return auth.response ?? NextResponse.json({ success: false }, { status: 401 });
  }

  await revokeSession(auth.session.id);
  return NextResponse.json({ success: true });
}
