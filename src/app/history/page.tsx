'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Clock, Play, Share2 } from 'lucide-react';

import { useAuth, fetchWithSession } from '@/shared/auth/AuthContext';

interface HistoryRecord {
  id: string;
  scenarioKey: string;
  customName?: string | null;
  parameters: Record<string, unknown>;
  planSteps: Array<{ id: string; title: string }>;
  completedAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadHistory(): Promise<void> {
      const response = await fetchWithSession('/api/history');
      const data = (await response.json()) as { results?: HistoryRecord[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? '기록을 불러오지 못했습니다.');
        return;
      }

      setHistory(data.results ?? []);
    }

    void loadHistory();
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="px-6 py-20 text-center text-foreground/50">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
        <Bookmark size={44} className="text-brand" />
        <h1 className="text-3xl font-bold">기록은 로그인 후에 볼 수 있어요</h1>
        <p className="max-w-md text-foreground/60">
          게스트 모드에서는 실습 체험만 가능하고, 기록 저장과 공유는 로그인 사용자에게만 열려 있습니다.
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="rounded-full bg-brand px-6 py-3 font-bold text-white"
        >
          프로필에서 로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10 pb-24">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">내 기록</h1>
        <p className="text-foreground/60">최근 실습 기록과 공유 가능한 레슨 템플릿의 원본이 여기에 쌓입니다.</p>
      </div>

      {error ? <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="rounded-[2rem] border border-border/30 bg-white p-10 text-center text-foreground/50">
            아직 저장된 기록이 없습니다.
          </div>
        ) : (
          history.map((record) => (
            <div key={record.id} className="rounded-[2rem] border border-border/30 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{record.scenarioKey}</div>
                  <h2 className="text-2xl font-bold">{record.customName ?? `${record.scenarioKey} lesson`}</h2>
                  <div className="flex items-center gap-2 text-sm text-foreground/50">
                    <Clock size={16} />
                    {new Date(record.completedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/setup/${record.scenarioKey}`)}
                  className="rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand"
                >
                  <Play size={16} className="mr-1 inline" />
                  다시 실행
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {record.planSteps.slice(0, 4).map((step) => (
                  <span key={step.id} className="rounded-full bg-foreground/[0.04] px-3 py-1 text-xs text-foreground/60">
                    {step.title}
                  </span>
                ))}
                {record.planSteps.length > 4 ? (
                  <span className="rounded-full bg-foreground/[0.04] px-3 py-1 text-xs text-foreground/60">
                    +{record.planSteps.length - 4} steps
                  </span>
                ) : null}
              </div>
              <div className="mt-5 text-xs font-medium text-foreground/45">
                <Share2 size={14} className="mr-1 inline" />
                공유 가능한 템플릿은 실습 완료 후 저장 화면에서 생성할 수 있습니다.
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
