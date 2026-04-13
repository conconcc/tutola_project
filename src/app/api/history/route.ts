import { NextRequest, NextResponse } from 'next/server';
import { guardSession } from '../../../server/security/authGuard';

export async function GET(request: NextRequest) {
  const authResult = await guardSession(request);
  if (!authResult.isAuthorized) {
    return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Example: Fetch user-specific history from the database
  const userHistory = [
    { id: 1, title: '김치파스타', date: '2026-04-12' },
    { id: 2, title: '핸드드립 커피', date: '2026-04-10' },
  ];

  return NextResponse.json(userHistory);
}
