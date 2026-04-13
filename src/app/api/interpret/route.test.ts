import { beforeEach, describe, expect, it } from 'vitest';

import { POST } from './route';
import { ERROR_CODES } from '../../../server/errors/errorCodes';
import { resetRateLimitStore } from '../../../server/security/rateLimiter';
import { resetSessionStore } from '../../../server/security/sessionStore';
import { POST as createSession } from '../auth/session/route';

beforeEach(() => {
  delete process.env.API_PROVIDER_API_KEY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  resetRateLimitStore();
  resetSessionStore();
});

async function issueSessionId(): Promise<string> {
  process.env.API_PROVIDER_API_KEY = 'test-secret';
  const sessionResponse = await createSession(
    new Request('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
      },
    }),
  );
  const sessionData = (await sessionResponse.json()) as { success: boolean; sessionId?: string };
  if (!sessionData.sessionId) {
    throw new Error('session id issue failed');
  }
  return sessionData.sessionId;
}

describe('POST /api/interpret', () => {
  it('유효한 요청이면 success true와 command를 반환한다', async () => {
    const sessionId = await issueSessionId();
    const request = new Request('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: JSON.stringify({
        scenarioType: 'coffee',
        naturalLanguageInput: '위에서 보여줘',
        currentState: { currentView: 'front' },
      }),
      headers: {
        'content-type': 'application/json',
        'x-session-id': sessionId,
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; command?: { intent: string } };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.command?.intent).toBe('change_view');
    expect(response.headers.get('x-request-id')).toBeTruthy();
  });

  it('요청 형식이 잘못되면 400을 반환한다', async () => {
    const sessionId = await issueSessionId();
    const request = new Request('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: JSON.stringify({
        scenarioType: 'coffee',
      }),
      headers: {
        'content-type': 'application/json',
        'x-session-id': sessionId,
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; errorCode?: string; message?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe(ERROR_CODES.INVALID_REQUEST_SCHEMA);
    expect(typeof data.message).toBe('string');
  });

  it('malformed JSON이면 400을 반환한다', async () => {
    const sessionId = await issueSessionId();
    const request = new Request('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: '{"scenarioType":"coffee",',
      headers: {
        'content-type': 'application/json',
        'x-session-id': sessionId,
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; errorCode?: string; message?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe(ERROR_CODES.INVALID_JSON);
  });

  it('content-type이 application/json이 아니면 415를 반환한다', async () => {
    const sessionId = await issueSessionId();
    const request = new Request('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: 'scenarioType=coffee',
      headers: {
        'content-type': 'text/plain',
        'x-session-id': sessionId,
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; errorCode?: string };

    expect(response.status).toBe(415);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe(ERROR_CODES.UNSUPPORTED_MEDIA_TYPE);
  });

  it('naturalLanguageInput이 과도하게 길면 400을 반환한다', async () => {
    const sessionId = await issueSessionId();
    const request = new Request('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: JSON.stringify({
        scenarioType: 'coffee',
        naturalLanguageInput: 'a'.repeat(501),
        currentState: {},
      }),
      headers: {
        'content-type': 'application/json',
        'x-session-id': sessionId,
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; errorCode?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe(ERROR_CODES.INVALID_REQUEST_SCHEMA);
  });

  it('세션 헤더가 없으면 401을 반환한다', async () => {
    const request = new Request('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: JSON.stringify({
        scenarioType: 'coffee',
        naturalLanguageInput: '위에서 보여줘',
        currentState: { currentView: 'front' },
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; errorCode?: string };
    expect(response.status).toBe(401);
    expect(data.errorCode).toBe(ERROR_CODES.AUTH_REQUIRED);
  });

  it('유효하지 않은 세션이면 403을 반환한다', async () => {
    const request = new Request('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: JSON.stringify({
        scenarioType: 'coffee',
        naturalLanguageInput: '위에서 보여줘',
        currentState: { currentView: 'front' },
      }),
      headers: {
        'content-type': 'application/json',
        'x-session-id': 'invalid-session-id',
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { success: boolean; errorCode?: string };
    expect(response.status).toBe(403);
    expect(data.errorCode).toBe(ERROR_CODES.INVALID_SESSION);
  });

  it('동일 클라이언트가 과도 요청하면 429를 반환한다', async () => {
    const sessionId = await issueSessionId();
    const makeRequest = (): Request =>
      new Request('http://localhost:3000/api/interpret', {
        method: 'POST',
        body: JSON.stringify({
          scenarioType: 'coffee',
          naturalLanguageInput: '위에서 보여줘',
          currentState: { currentView: 'front' },
        }),
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '1.2.3.4',
          'x-session-id': sessionId,
        },
      });

    let finalResponse: Response | undefined;
    for (let attempt = 0; attempt < 31; attempt += 1) {
      finalResponse = await POST(makeRequest());
    }

    const data = (await finalResponse?.json()) as { success: boolean; errorCode?: string };
    expect(finalResponse?.status).toBe(429);
    expect(data.errorCode).toBe(ERROR_CODES.RATE_LIMITED);
  });
});
