import { NextResponse } from 'next/server';

import { validateApiKeyBootstrap } from '../../../../server/security/authGuard';
import { createSession } from '../../../../server/security/sessionStore';

export async function POST(request: Request): Promise<Response> {
  const auth = validateApiKeyBootstrap(request);
  if (!auth.isAuthorized && auth.response) {
    return auth.response;
  }

  const session = await createSession();
  return NextResponse.json({
    success: true,
    sessionId: session.id,
    expiresAt: session.expiresAt,
  });
}
