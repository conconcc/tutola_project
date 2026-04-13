'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SessionRole = 'guest' | 'learner' | 'instructor';

export interface SessionData {
  id: string;
  userId?: string | undefined;
  displayName: string;
  role: SessionRole;
  isGuest: boolean;
  createdAt: number;
  expiresAt: number;
}

interface AuthContextValue {
  session: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  ensureGuestSession: () => Promise<SessionData | null>;
  login: (displayName: string, role: 'learner' | 'instructor') => Promise<SessionData>;
  logout: () => Promise<void>;
}

const SESSION_STORAGE_KEY = 'tutola-session-id';
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

function storeSessionId(sessionId: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (sessionId) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

async function createSession(body: Record<string, unknown>): Promise<SessionData> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { session?: SessionData };
  if (!response.ok || !data.session) {
    throw new Error('Failed to create session');
  }

  storeSessionId(data.session.id);
  return data.session;
}

export function getSessionIdForClient(): string | null {
  return readStoredSessionId();
}

export async function fetchWithSession(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers ?? {});
  const sessionId = readStoredSessionId();
  if (sessionId) {
    headers.set('x-session-id', sessionId);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap(): Promise<void> {
      const sessionId = readStoredSessionId();
      if (!sessionId) {
        const guestSession = await createSession({ mode: 'guest' });
        if (!cancelled) {
          setSession(guestSession);
          setIsLoading(false);
        }
        return;
      }

      const response = await fetch('/api/auth/session', {
        headers: {
          'x-session-id': sessionId,
        },
      });

      if (!response.ok) {
        const guestSession = await createSession({ mode: 'guest' });
        if (!cancelled) {
          setSession(guestSession);
          setIsLoading(false);
        }
        return;
      }

      const data = (await response.json()) as { session?: SessionData };
      if (!cancelled) {
        setSession(data.session ?? null);
        setIsLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated: Boolean(session && !session.isGuest),
      ensureGuestSession: async () => {
        if (session) {
          return session;
        }
        const guestSession = await createSession({ mode: 'guest' });
        setSession(guestSession);
        return guestSession;
      },
      login: async (displayName, role) => {
        const nextSession = await createSession({ mode: 'login', displayName, role });
        setSession(nextSession);
        return nextSession;
      },
      logout: async () => {
        const sessionId = readStoredSessionId();
        if (sessionId) {
          await fetch('/api/auth/session', {
            method: 'DELETE',
            headers: {
              'x-session-id': sessionId,
            },
          }).catch(() => undefined);
        }
        storeSessionId(null);
        const guestSession = await createSession({ mode: 'guest' });
        setSession(guestSession);
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
