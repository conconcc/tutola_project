'use client';

import { useState } from 'react';
import { LogOut, UserCircle2, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/shared/auth/AuthContext';

export default function ProfilePage() {
  const { session, isAuthenticated, isLoading, login, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'learner' | 'instructor'>('learner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(): Promise<void> {
    if (!displayName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(displayName.trim(), role);
      setDisplayName('');
    } catch {
      setError('로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="px-6 py-20 text-center text-foreground/50">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-10 pb-24">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">프로필</h1>
        <p className="text-foreground/60">게스트는 체험만 할 수 있고, 로그인하면 기록 저장과 레슨 공유가 열립니다.</p>
      </div>

      <div className="rounded-[2rem] border border-border/30 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-full bg-brand/10 p-4 text-brand">
            {isAuthenticated ? <ShieldCheck size={28} /> : <UserCircle2 size={28} />}
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              {isAuthenticated ? 'Signed In' : 'Guest Mode'}
            </div>
            <div className="text-2xl font-bold">
              {session?.displayName ?? 'Guest'}
            </div>
            <div className="text-sm text-foreground/50">
              {session?.role ?? 'guest'}
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-foreground/60">
              이제 기록 저장, 템플릿 만들기, 공유 링크 생성, 프로필/히스토리 접근이 가능합니다.
            </p>
            <button
              onClick={() => void logout()}
              className="rounded-full border border-border/30 px-5 py-3 font-bold text-foreground/70"
            >
              <LogOut size={16} className="mr-2 inline" />
              로그아웃
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/70">표시 이름</label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="예: 김수강"
                className="w-full rounded-2xl border border-border/30 px-4 py-3 outline-none focus:border-brand"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/70">역할</label>
              <div className="flex gap-3">
                {(['learner', 'instructor'] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setRole(item)}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      role === item ? 'bg-brand text-white' : 'bg-foreground/[0.05] text-foreground/60'
                    }`}
                  >
                    {item === 'learner' ? '수강생' : '강사'}
                  </button>
                ))}
              </div>
            </div>
            {error ? <div className="text-sm text-red-500">{error}</div> : null}
            <button
              disabled={isSubmitting}
              onClick={() => void handleLogin()}
              className="rounded-full bg-brand px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {isSubmitting ? '로그인 중...' : '임시 로그인'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
