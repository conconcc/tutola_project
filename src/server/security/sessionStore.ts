import { Prisma } from '@prisma/client';
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

interface MemoryUserRecord {
  id: string;
  displayName: string;
  role: Extract<SessionRole, 'learner' | 'instructor'>;
}

const memorySessions = new Map<string, SessionContext>();
const memoryUsers = new Map<string, MemoryUserRecord>();
let forceMemoryStore = false;

function isDatabaseConfigured(): boolean {
  return typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.trim().length > 0;
}

function shouldUseMemoryStore(): boolean {
  return forceMemoryStore || !isDatabaseConfigured();
}

function markMemoryFallback(error: unknown): void {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    forceMemoryStore = true;
  }
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

function buildMemorySession(input: CreateSessionInput): SessionContext {
  const now = Date.now();
  const session: SessionContext = {
    id: crypto.randomUUID(),
    userId: input.userId,
    displayName: input.displayName,
    role: input.role,
    isGuest: input.isGuest,
    createdAt: now,
    expiresAt: now + (input.ttlSeconds ?? 60 * 60 * 24 * 7) * 1000,
  };

  memorySessions.set(session.id, session);
  return session;
}

async function createDatabaseSession(input: CreateSessionInput): Promise<SessionContext> {
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

export async function createSession(input: CreateSessionInput): Promise<SessionContext> {
  if (shouldUseMemoryStore()) {
    return buildMemorySession(input);
  }

  try {
    return await createDatabaseSession(input);
  } catch (error) {
    markMemoryFallback(error);
    return buildMemorySession(input);
  }
}

export async function issueGuestSession(metadata?: {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}): Promise<SessionContext> {
  return createSession({
    role: 'guest',
    displayName: 'Guest',
    isGuest: true,
    ...(metadata?.userAgent ? { userAgent: metadata.userAgent } : {}),
    ...(metadata?.ipAddress ? { ipAddress: metadata.ipAddress } : {}),
  });
}

async function issueDatabaseUserSession(
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

  return createDatabaseSession({
    role: input.role,
    displayName: user.displayName,
    userId: user.id,
    isGuest: false,
    ...(input.userAgent ? { userAgent: input.userAgent } : {}),
    ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
  });
}

function issueMemoryUserSession(input: LoginUserInput): SessionContext {
  const normalizedName = input.displayName.trim();
  const key = `${normalizedName}:${input.role}`;
  const existing = memoryUsers.get(key);
  const user =
    existing ??
    (() => {
      const created: MemoryUserRecord = {
        id: crypto.randomUUID(),
        displayName: normalizedName,
        role: input.role,
      };
      memoryUsers.set(key, created);
      return created;
    })();

  return buildMemorySession({
    role: input.role,
    displayName: user.displayName,
    userId: user.id,
    isGuest: false,
  });
}

export async function issueUserSession(
  input: LoginUserInput & {
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
  },
): Promise<SessionContext> {
  if (shouldUseMemoryStore()) {
    return issueMemoryUserSession(input);
  }

  try {
    return await issueDatabaseUserSession(input);
  } catch (error) {
    markMemoryFallback(error);
    return issueMemoryUserSession(input);
  }
}

export async function validateSession(sessionId: string): Promise<SessionContext | null> {
  if (shouldUseMemoryStore()) {
    const session = memorySessions.get(sessionId) ?? null;
    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      memorySessions.delete(sessionId);
      return null;
    }

    return session;
  }

  let record: Session | null;
  try {
    record = await prisma.session.findUnique({
      where: { id: sessionId },
    });
  } catch (error) {
    markMemoryFallback(error);
    const session = memorySessions.get(sessionId) ?? null;
    if (!session) {
      return null;
    }
    if (session.expiresAt <= Date.now()) {
      memorySessions.delete(sessionId);
      return null;
    }
    return session;
  }

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
  if (shouldUseMemoryStore()) {
    memorySessions.delete(sessionId);
    return;
  }

  await prisma.session.delete({ where: { id: sessionId } }).catch((error) => {
    markMemoryFallback(error);
    memorySessions.delete(sessionId);
  });
}

export async function resetSessionStore(): Promise<void> {
  if (shouldUseMemoryStore()) {
    memorySessions.clear();
    memoryUsers.clear();
    return;
  }

  try {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany({
      where: {
        role: {
          in: ['learner', 'instructor'],
        },
      },
    });
  } catch (error) {
    markMemoryFallback(error);
    memorySessions.clear();
    memoryUsers.clear();
  }
}
