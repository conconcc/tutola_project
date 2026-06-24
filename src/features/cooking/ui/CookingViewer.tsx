import dynamic from 'next/dynamic';
import type { CameraView } from '@/features/scenario-engine/domain/types';
import { Placeholder3D } from '@/shared/ui/Placeholder3D';
import {
  COOKING_STEP_MODELS,
  COOKING_DEFAULT_MODEL,
} from '@/shared/config/modelRegistry';
// [SWAP POINT] 모델 경로는 modelRegistry.ts 의 BASE URL 한 곳에서 관리합니다.
// 로컬 → S3 전환 시 해당 파일의 BASE 상수만 변경하면 됩니다.

const SceneViewer = dynamic(
  () => import('@/shared/ui/SceneViewer').then((m) => ({ default: m.SceneViewer })),
  { ssr: false, loading: () => <Placeholder3D skillId="cooking" /> },
);

interface CookingViewerProps {
  currentView?: CameraView;
  stepId?: string | undefined;
}

export function CookingViewer({ currentView = 'front', stepId }: CookingViewerProps) {
  const modelPath = (stepId && COOKING_STEP_MODELS[stepId]) ?? COOKING_DEFAULT_MODEL;
  return <SceneViewer modelPath={modelPath} currentView={currentView} skillId="cooking" />;
}
