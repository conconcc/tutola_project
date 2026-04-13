import dynamic from 'next/dynamic';
import type { CameraView } from '@/features/scenario-engine/domain/types';
import { Placeholder3D } from '@/shared/ui/Placeholder3D';

// SSR을 완전히 비활성화하여 Three.js/WebGL 충돌을 방지
// 동적 로딩 시 공통 Placeholder3D 컴포넌트 노출
const CoffeeCanvas = dynamic(
  () => import('./CoffeeCanvas').then((mod) => ({ default: mod.CoffeeCanvas })),
  { 
    ssr: false, 
    loading: () => <Placeholder3D skillId="coffee" /> 
  },
);

interface CoffeeViewerProps {
  currentView?: CameraView;
}

export function CoffeeViewer({ currentView = 'front' }: CoffeeViewerProps) {
  return <CoffeeCanvas currentView={currentView} />;
}
