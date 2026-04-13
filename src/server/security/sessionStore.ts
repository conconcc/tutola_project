export interface SessionRecord {
  id: string;
  createdAt: number;
  expiresAt: number;
}

interface SessionStore {
  create(ttlSeconds: number): Promise<SessionRecord>;
  validate(sessionId: string): Promise<boolean>;
  clear(): void;
}

class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionRecord>();

  async create(ttlSeconds: number): Promise<SessionRecord> {
    const now = Date.now();
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
    };
    this.sessions.set(record.id, record);
    return record;
  }

  async validate(sessionId: string): Promise<boolean> {
    const now = Date.now();
    const record = this.sessions.get(sessionId);
    if (!record) {
      return false;
    }

    if (record.expiresAt <= now) {
      this.sessions.delete(sessionId);
      return false;
    }

    return true;
  }

  clear(): void {
    this.sessions.clear();
  }
}

const sessionStore = new InMemorySessionStore();

export async function createSession(ttlSeconds = 60 * 60): Promise<SessionRecord> {
  return sessionStore.create(ttlSeconds);
}

export async function validateSession(sessionId: string): Promise<boolean> {
  return sessionStore.validate(sessionId);
}

export function resetSessionStore(): void {
  sessionStore.clear();
}
