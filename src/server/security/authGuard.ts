import { buildErrorResponse, ERROR_CODES } from '../errors/errorCodes';
import { validateSession } from './sessionStore';

export interface AuthGuardResult {
  isAuthorized: boolean;
  response?: Response;
}

function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
}

export async function guardSession(request: Request): Promise<AuthGuardResult> {
  const sessionHeader = request.headers.get('x-session-id');
  if (!sessionHeader) {
    return {
      isAuthorized: false,
      response: Response.json(buildErrorResponse(ERROR_CODES.AUTH_REQUIRED, '세션 정보가 필요합니다.'), {
        status: 401,
      }),
    };
  }

  const isValid = await validateSession(sessionHeader.trim());
  if (!isValid) {
    return {
      isAuthorized: false,
      response: Response.json(buildErrorResponse(ERROR_CODES.INVALID_SESSION, '유효하지 않은 세션입니다.'), {
        status: 403,
      }),
    };
  }

  return { isAuthorized: true };
}

export function validateApiKeyBootstrap(request: Request): AuthGuardResult {
  const configuredApiKey = process.env.API_PROVIDER_API_KEY;
  if (!configuredApiKey) {
    return {
      isAuthorized: false,
      response: Response.json(
        buildErrorResponse(ERROR_CODES.AUTH_REQUIRED, '서버에 API_PROVIDER_API_KEY가 설정되어야 합니다.'),
        { status: 401 },
      ),
    };
  }

  const token = getBearerToken(request.headers.get('authorization'));
  if (!token) {
    return {
      isAuthorized: false,
      response: Response.json(buildErrorResponse(ERROR_CODES.AUTH_REQUIRED, '인증 정보가 필요합니다.'), {
        status: 401,
      }),
    };
  }

  if (token !== configuredApiKey) {
    return {
      isAuthorized: false,
      response: Response.json(buildErrorResponse(ERROR_CODES.INVALID_API_KEY, '유효하지 않은 API 키입니다.'), {
        status: 403,
      }),
    };
  }

  return { isAuthorized: true };
}
