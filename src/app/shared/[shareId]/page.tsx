'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Play } from 'lucide-react';

interface SharedTemplate {
  id: string;
  title: string;
  scenarioKey: string;
  description?: string | null;
  parameters: Record<string, unknown>;
  planSteps: Array<{ id: string; title: string; description: string }>;
  classTag?: { label: string } | null;
  user: { displayName: string; role: string };
}

export default function SharedLessonPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = (params.shareId as string) ?? '';
  const [template, setTemplate] = useState<SharedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      const response = await fetch(`/api/shared/${shareId}`);
      const data = (await response.json()) as { share?: { template: SharedTemplate }; error?: string };
      if (!response.ok || !data.share) {
        setError(data.error ?? '공유 레슨을 불러오지 못했습니다.');
        return;
      }

      setTemplate(data.share.template);
    }

    if (shareId) {
      void load();
    }
  }, [shareId]);

  if (error) {
    return <div className="px-6 py-20 text-center text-red-500">{error}</div>;
  }

  if (!template) {
    return <div className="px-6 py-20 text-center text-foreground/50">Loading shared lesson...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10 pb-24">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
          <BookOpen size={16} />
          공유 레슨
        </div>
        <h1 className="text-4xl font-bold">{template.title}</h1>
        <p className="text-foreground/60">
          {template.user.displayName} · {template.user.role}
          {template.classTag?.label ? ` · ${template.classTag.label}` : ''}
        </p>
        {template.description ? <p className="max-w-2xl text-foreground/65">{template.description}</p> : null}
      </div>

      <div className="rounded-[2rem] border border-border/30 bg-white p-8 shadow-sm">
        <div className="space-y-4">
          {template.planSteps.map((step, index) => (
            <div key={step.id} className="rounded-3xl bg-foreground/[0.03] p-5">
              <div className="mb-2 text-sm font-bold text-brand">Step {index + 1}</div>
              <h2 className="text-xl font-bold">{step.title}</h2>
              <p className="mt-2 text-foreground/65">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => router.push(`/setup/${template.scenarioKey}`)}
        className="rounded-full bg-brand px-6 py-3 font-bold text-white"
      >
        <Play size={16} className="mr-2 inline" />
        이 시나리오로 연습 시작
      </button>
    </div>
  );
}
