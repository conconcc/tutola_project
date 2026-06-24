'use client';

import { Suspense, Component, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import type { CameraView } from '@/features/scenario-engine/domain/types';
import { Placeholder3D } from '@/shared/ui/Placeholder3D';

const CAMERA_PRESETS: Record<CameraView, { position: [number, number, number]; target: [number, number, number] }> = {
  front: { position: [0, 1.5, 4], target: [0, 0, 0] },
  top:   { position: [0, 5, 0.1], target: [0, 0, 0] },
  side:  { position: [4, 1.5, 0], target: [0, 0, 0] },
  zoom:  { position: [0, 0.5, 2], target: [0, 0, 0] },
};

function GLBModel({ path }: { path: string }) {
  // [SWAP POINT] path 는 modelRegistry.ts 에서 주입됩니다.
  // 현재: '/models/...' (Next.js public static)
  // S3 전환 후: 'https://<bucket>.s3.amazonaws.com/models/...'
  const { scene } = useGLTF(path);
  return <Center><primitive object={scene} /></Center>;
}

interface ErrorBoundaryState { hasError: boolean }
interface ErrorBoundaryProps { children: ReactNode; fallback: ReactNode }

class GLBErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface SceneViewerProps {
  modelPath: string;
  currentView?: CameraView;
  skillId?: string;
}

export function SceneViewer({ modelPath, currentView = 'front', skillId }: SceneViewerProps) {
  const preset = CAMERA_PRESETS[currentView];

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: preset.position, fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 6, 4]} intensity={1.2} castShadow />
        <Environment preset="studio" />
        <GLBErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <GLBModel path={modelPath} />
          </Suspense>
        </GLBErrorBoundary>
        <OrbitControls
          target={preset.target}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
