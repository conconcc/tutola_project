import { persistSecurityEvent } from './securityEventRepository';

interface SecurityLogInput {
  requestId: string;
  event: string;
  statusCode: number;
  detail?: string | undefined;
}

export function logSecurityEvent(input: SecurityLogInput): void {
  const payload = {
    category: 'security',
    requestId: input.requestId,
    event: input.event,
    statusCode: input.statusCode,
    detail: input.detail,
    timestamp: new Date().toISOString(),
  };

  console.warn(JSON.stringify(payload));

  void persistSecurityEvent({
    requestId: input.requestId,
    event: input.event,
    statusCode: input.statusCode,
    detail: input.detail,
  }).catch(() => {
    // Intentionally ignore DB sink errors.
  });

  const webhookUrl = process.env.SECURITY_LOG_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  void fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Intentionally ignore sink errors to avoid blocking main request flow.
  });
}
