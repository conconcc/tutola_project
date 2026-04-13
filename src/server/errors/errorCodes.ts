export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_SESSION: 'INVALID_SESSION',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_JSON: 'INVALID_JSON',
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
  INVALID_REQUEST_SCHEMA: 'INVALID_REQUEST_SCHEMA',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ErrorResponse {
  success: false;
  errorCode: ErrorCode;
  message: string;
}

export function buildErrorResponse(errorCode: ErrorCode, message: string): ErrorResponse {
  return {
    success: false,
    errorCode,
    message,
  };
}
