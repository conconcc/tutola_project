'use client';

import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, RoundedBox, Cylinder, Html } from '@react-three/drei';
import type { CameraView } from '@/features/scenario-engine/domain/types';
import * as THREE from 'three';
import { Info } from 'lucide-react';

/* ── Camera preset positions ── */
const CAMERA_PRESETS: Record<CameraView, { position: [number, number, number]; target: [number, number, number] }> = {
  front: { position: [0, 1.5, 4], target: [0, 0, 0] },
  top:   { position: [0, 5, 0.1], target: [0, 0, 0] },
  side:  { position: [4, 1.5, 0], target: [0, 0, 0] },
  zoom:  { position: [0, 0.5, 2], target: [0, 0, 0] },
};

/* ── Simple placeholder 3D scene: dripper on a cup ── */
function CoffeeScene() {
  const dripperRef = useRef<THREE.Mesh>(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  useFrame((state) => {
    if (dripperRef.current) {
      dripperRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 6, 4]} intensity={1.2} castShadow />
      <Environment preset="studio" />

      {/* Cup base */}
      <Cylinder args={[0.5, 0.45, 0.9, 32]} position={[0, -0.8, 0]} receiveShadow>
        <meshStandardMaterial color="#e8d5c0" roughness={0.3} metalness={0.05} />
      </Cylinder>

      {/* Server / carafe body */}
      <Cylinder args={[0.48, 0.38, 0.5, 32]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#c8b5a0" roughness={0.2} />
        
        {/* Pot Hotspot */}
        <Html position={[0.55, 0, 0]} center>
           <button 
             onClick={() => setActiveHotspot(activeHotspot === 'server' ? null : 'server')}
             className="w-8 h-8 rounded-full bg-white/80 active:bg-white backdrop-blur-md shadow-xl border border-brand/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
           >
             <div className="w-3 h-3 bg-brand rounded-full animate-pulse" />
           </button>
           {activeHotspot === 'server' && (
             <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 bg-white/95 p-3 rounded-2xl shadow-xl text-xs text-brand font-medium border border-brand/20 text-center pointer-events-none">
               Maintain temp with a pre-warmed server.
             </div>
           )}
        </Html>
      </Cylinder>

      {/* Dripper cone */}
      <mesh ref={dripperRef} position={[0, 0.55, 0]} castShadow>
        <coneGeometry args={[0.42, 0.7, 32, 1, true]} />
        <meshStandardMaterial color="#b07040" side={THREE.DoubleSide} roughness={0.4} />

        {/* Dripper Hotspot */}
        <Html position={[-0.5, 0.3, 0]} center>
           <button 
             onClick={() => setActiveHotspot(activeHotspot === 'dripper' ? null : 'dripper')}
             className="w-8 h-8 rounded-full bg-white/80 active:bg-white backdrop-blur-md shadow-xl border border-brand/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
           >
             <Info size={16} className="text-brand animate-pulse" />
           </button>
           {activeHotspot === 'dripper' && (
             <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-white/95 p-3 rounded-2xl shadow-xl text-xs text-brand font-medium border border-brand/20 pointer-events-none">
               <b>Tip:</b> Pour gently in circles avoiding the outer filter edges!
             </div>
           )}
        </Html>
      </mesh>

      {/* Filter paper */}
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[0.36, 0.6, 32, 1, true]} />
        <meshStandardMaterial color="#f5e9d0" side={THREE.DoubleSide} roughness={0.8} opacity={0.9} transparent />
      </mesh>

      {/* Coffee grounds (small dark cylinder) */}
      <Cylinder args={[0.18, 0.18, 0.12, 24]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#2d1a0e" roughness={0.9} />
      </Cylinder>

      {/* Water drop indicator */}
      <RoundedBox args={[0.05, 0.25, 0.05]} radius={0.02} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.75} roughness={0.1} />
      </RoundedBox>

      {/* Table */}
      <mesh position={[0, -1.35, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.08, 64]} />
        <meshStandardMaterial color="#f8f0e8" roughness={0.5} />
      </mesh>
    </>
  );
}

interface CoffeeCanvasProps {
  currentView?: CameraView;
}

export function CoffeeCanvas({ currentView = 'front' }: CoffeeCanvasProps) {
  const preset = CAMERA_PRESETS[currentView];

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: preset.position, fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: 'transparent' }}
      >
        <CoffeeScene />
        <OrbitControls
          target={preset.target}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
