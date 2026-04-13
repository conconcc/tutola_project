import type { Session, User } from '@prisma/client';

import { prisma } from '../db/prismaClient';

export type SessionRole = 'guest' | 'learner' | 'instructor';

export interface SessionContext {
  id: string;
  userId?: string | undefined;
  displayName: string;
  role: SessionRole;
  isGuest: boolean;
  createdAt: number;
  expiresAt: number;
}

interface CreateSessionInput {
  role: SessionRole;
  displayName: string;
  userId?: string | undefined;
  isGuest: boolean;
  ttlSeconds?: number | undefined;
  createdBy?: string | undefined;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

interface LoginUserInput {
  displayName: string;
  role: Extract<SessionRole, 'learner' | 'instructor'>;
}

function toSessionContext(record: Session & { user?: User | null }): SessionContext {
  return {
    id: record.id,
    userId: record.userId ?? undefined,
    displayName: record.displayName,
    role: record.role as SessionRole,
    isGuest: record.isGuest,
    createdAt: record.createdAt.getTime(),
    expiresAt: record.expiresAt.getTime(),
  };
}

export async function createSession(input: CreateSessionInput): Promise<SessionContext> {
  const now = Date.now();
  const expiresAt = new Date(now + (input.ttlSeconds ?? 60 * 60 * 24 * 7) * 1000);
  const record = await prisma.session.create({
    data: {
      role: input.role,
      displayName: input.displayName,
      isGuest: input.isGuest,
      expiresAt,
      ...(input.userId ? { userId: input.userId } : {}),
      ...(input.createdBy ? { createdBy: input.createdBy } : {}),
      ...(input.userAgent ? { userAgent: input.userAgent } : {}),
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
    },
  });

  return toSessionContext(record);
}

export async function issueGuestSession(metadata?: {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}): Promise<SessionContext> {
  return createSession({
    role: 'guest',
    displayName: 'Guest',
    isGuest: true,
    userAgent: metadata?.userAgent,
    ipAddress: metadata?.ipAddress,
  });
}

export async function issueUserSession(
  input: LoginUserInput & {
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
  },
): Promise<SessionContext> {
  const normalizedName = input.displayName.trim();
  const user = await prisma.user.upsert({
    where: {
      displayName_role: {
        displayName: normalizedName,
        role: input.role,
      },
    },
    update: {
      updatedAt: new Date(),
    },
    create: {
      displayName: normalizedName,
      role: input.role,
    },
  });

  return createSession({
    role: input.role,
    displayName: user.displayName,
    userId: user.id,
    isGuest: false,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  });
}

export async function validateSession(sessionId: string): Promise<SessionContext | null> {
  const record = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!record) {
    return null;
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
    return null;
  }

  return toSessionContext(record);
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
}

export async function resetSessionStore(): Promise<void> {
  await prisma.session.deleteMany();
  await prisma.user.deleteMany({
    where: {
      role: {
        in: ['learner', 'instructor'],
      },
    },
  });
}
