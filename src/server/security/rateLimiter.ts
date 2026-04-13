import { buildErrorResponse, ERROR_CODES } from '../errors/errorCodes';

interface RateEntry {
  windowStartedAt: number;
  requestCount: number;
}

const rateStore = new Map<string, RateEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

async function incrementFromUpstash(clientKey: string): Promise<number | null> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!upstashUrl || !upstashToken) {
    return null;
  }

  const key = `rl:${clientKey}:${Math.floor(Date.now() / WINDOW_MS)}`;
  const incrementResponse = await fetch(`${upstashUrl}/incr/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${upstashToken}`,
    },
  });

  if (!incrementResponse.ok) {
    return null;
  }

  const incrementJson = (await incrementResponse.json()) as { result?: number };
  const count = incrementJson.result;
  if (typeof count !== 'number') {
    return null;
  }

  if (count === 1) {
    await fetch(`${upstashUrl}/expire/${encodeURIComponent(key)}/${Math.ceil(WINDOW_MS / 1000)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    });
  }

  return count;
}

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function guardRateLimit(request: Request): Promise<{ isAllowed: boolean; response?: Response }> {
  const now = Date.now();
  const clientKey = getClientKey(request);

  const redisCount = await incrementFromUpstash(clientKey);
  if (typeof redisCount === 'number') {
    if (redisCount > MAX_REQUESTS_PER_WINDOW) {
      return {
        isAllowed: false,
        response: Response.json(
          buildErrorResponse(ERROR_CODES.RATE_LIMITED, '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'),
          { status: 429 },
        ),
      };
    }
    return { isAllowed: true };
  }

  const previous = rateStore.get(clientKey);

  if (!previous || now - previous.windowStartedAt >= WINDOW_MS) {
    rateStore.set(clientKey, { windowStartedAt: now, requestCount: 1 });
    return { isAllowed: true };
  }

  if (previous.requestCount >= MAX_REQUESTS_PER_WINDOW) {
    return {
      isAllowed: false,
      response: Response.json(
        buildErrorResponse(ERROR_CODES.RATE_LIMITED, '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'),
        { status: 429 },
      ),
    };
  }

  rateStore.set(clientKey, {
    windowStartedAt: previous.windowStartedAt,
    requestCount: previous.requestCount + 1,
  });

  return { isAllowed: true };
}

export function resetRateLimitStore(): void {
  rateStore.clear();
}
