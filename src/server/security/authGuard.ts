import { buildErrorResponse, ERROR_CODES } from '../errors/errorCodes';
import { validateSession, type SessionContext } from './sessionStore';

export interface AuthGuardResult {
  isAuthorized: boolean;
  session?: SessionContext | undefined;
  response?: Response;
}

function unauthorizedResponse(status: 401 | 403, errorCode: keyof typeof ERROR_CODES, message: string): Response {
  return Response.json(buildErrorResponse(ERROR_CODES[errorCode], message), { status });
}

export async function guardSession(request: Request): Promise<AuthGuardResult> {
  const sessionHeader = request.headers.get('x-session-id');
  if (!sessionHeader) {
    return {
      isAuthorized: false,
      response: unauthorizedResponse(401, 'AUTH_REQUIRED', '세션 정보가 필요합니다.'),
    };
  }

  const session = await validateSession(sessionHeader.trim());
  if (!session) {
    return {
      isAuthorized: false,
      response: unauthorizedResponse(403, 'INVALID_SESSION', '유효하지 않은 세션입니다.'),
    };
  }

  return {
    isAuthorized: true,
    session,
  };
}

export async function requireUserSession(request: Request): Promise<AuthGuardResult> {
  const result = await guardSession(request);
  if (!result.isAuthorized || !result.session) {
    return result;
  }

  if (result.session.isGuest || !result.session.userId) {
    return {
      isAuthorized: false,
      response: unauthorizedResponse(403, 'AUTH_REQUIRED', '로그인한 사용자만 접근할 수 있습니다.'),
    };
  }

  return result;
}
