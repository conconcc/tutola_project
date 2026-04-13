import { prisma } from '../db/prismaClient';

export interface SecurityEventRecord {
  requestId: string;
  event: string;
  statusCode: number;
  detail?: string | undefined;
}

export async function persistSecurityEvent(event: SecurityEventRecord): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return;
  }

  await prisma.securityEvent.create({
    data: {
      requestId: event.requestId,
      event: event.event,
      statusCode: event.statusCode,
      ...(event.detail ? { detail: event.detail } : {}),
    },
  });
}
