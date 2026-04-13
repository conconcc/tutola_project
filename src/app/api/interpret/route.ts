import { NextResponse } from 'next/server';

import { interpretRequestSchema } from '../../../features/scenario-engine/domain/schemas';
import { interpretCommand } from '../../../server/services/commandInterpreter';
import { buildErrorResponse, ERROR_CODES } from '../../../server/errors/errorCodes';
import { guardSession } from '../../../server/security/authGuard';
import { guardRateLimit } from '../../../server/security/rateLimiter';
import { logSecurityEvent } from '../../../server/security/securityLogger';

function withRequestId(response: Response, requestId: string): Response {
  response.headers.set('x-request-id', requestId);
  return response;
}

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();

  const auth = await guardSession(request);
  if (!auth.isAuthorized && auth.response) {
    logSecurityEvent({ requestId, event: 'auth_rejected', statusCode: auth.response.status });
    return withRequestId(auth.response, requestId);
  }

  const rateLimit = await guardRateLimit(request);
  if (!rateLimit.isAllowed && rateLimit.response) {
    logSecurityEvent({ requestId, event: 'rate_limited', statusCode: rateLimit.response.status });
    return withRequestId(rateLimit.response, requestId);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const response = NextResponse.json(
      buildErrorResponse(ERROR_CODES.UNSUPPORTED_MEDIA_TYPE, 'content-type은 application/json 이어야 합니다.'),
      { status: 415 },
    );
    logSecurityEvent({ requestId, event: 'invalid_content_type', statusCode: 415 });
    return withRequestId(response, requestId);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    const response = NextResponse.json(
      buildErrorResponse(ERROR_CODES.INVALID_JSON, '요청 본문(JSON)을 해석할 수 없습니다.'),
      { status: 400 },
    );
    logSecurityEvent({ requestId, event: 'invalid_json', statusCode: 400 });
    return withRequestId(response, requestId);
  }

  const parsedRequest = interpretRequestSchema.safeParse(rawBody);
  if (!parsedRequest.success) {
    const response = NextResponse.json(
      buildErrorResponse(ERROR_CODES.INVALID_REQUEST_SCHEMA, '요청 형식이 올바르지 않습니다.'),
      { status: 400 },
    );
    logSecurityEvent({ requestId, event: 'invalid_schema', statusCode: 400 });
    return withRequestId(response, requestId);
  }

  try {
    const command = await interpretCommand(parsedRequest.data);
    const response = NextResponse.json({
      success: true,
      command,
    });
    response.headers.set('x-request-id', requestId);
    return response;
  } catch {
    const response = NextResponse.json(
      buildErrorResponse(ERROR_CODES.INTERNAL_ERROR, '서버 내부 오류가 발생했습니다.'),
      { status: 500 },
    );
    logSecurityEvent({ requestId, event: 'internal_error', statusCode: 500 });
    return withRequestId(response, requestId);
  }
}
