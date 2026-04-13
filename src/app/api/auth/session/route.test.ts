import { beforeEach, describe, expect, it } from 'vitest';

import { GET, POST } from './route';
import { resetSessionStore } from '../../../../server/security/sessionStore';

beforeEach(async () => {
  await resetSessionStore();
});

describe('POST /api/auth/session', () => {
  it('guest 세션을 발급한다', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({ mode: 'guest' }),
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const data = (await response.json()) as { success: boolean; session?: { id: string; isGuest: boolean } };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(typeof data.session?.id).toBe('string');
    expect(data.session?.isGuest).toBe(true);
  });

  it('임시 로그인 세션을 발급한다', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({ mode: 'login', displayName: 'Tester', role: 'learner' }),
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const data = (await response.json()) as { success: boolean; session?: { id: string; isGuest: boolean; role: string } };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(typeof data.session?.id).toBe('string');
    expect(data.session?.isGuest).toBe(false);
    expect(data.session?.role).toBe('learner');
  });

  it('발급한 세션을 조회한다', async () => {
    const created = await POST(
      new Request('http://localhost:3000/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({ mode: 'guest' }),
        headers: {
          'content-type': 'application/json',
        },
      }),
    );
    const createdData = (await created.json()) as { session?: { id: string } };

    const response = await GET(
      new Request('http://localhost:3000/api/auth/session', {
        headers: {
          'x-session-id': createdData.session?.id ?? '',
        },
      }),
    );

    const data = (await response.json()) as { success: boolean; session?: { id: string } };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.session?.id).toBe(createdData.session?.id);
  });
});
