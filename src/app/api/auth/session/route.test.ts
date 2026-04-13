import { beforeEach, describe, expect, it } from 'vitest';

import { POST } from './route';
import { ERROR_CODES } from '../../../../server/errors/errorCodes';
import { resetSessionStore } from '../../../../server/security/sessionStore';

beforeEach(() => {
  delete process.env.API_PROVIDER_API_KEY;
  resetSessionStore();
});

describe('POST /api/auth/session', () => {
  it('API 키가 맞으면 sessionId를 발급한다', async () => {
    process.env.API_PROVIDER_API_KEY = 'test-secret';
    const request = new Request('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; sessionId?: string };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(typeof data.sessionId).toBe('string');
  });

  it('API 키가 없으면 401을 반환한다', async () => {
    const request = new Request('http://localhost:3000/api/auth/session', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; errorCode?: string };

    expect(response.status).toBe(401);
    expect(data.errorCode).toBe(ERROR_CODES.AUTH_REQUIRED);
  });
});
