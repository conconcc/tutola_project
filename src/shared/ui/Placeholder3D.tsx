import React from 'react';

interface Placeholder3DProps {
  skillId?: string;
}

export function Placeholder3D({ skillId }: Placeholder3DProps) {
  let title = 'Scenario';
  let icon = '📦';

  if (skillId === 'coffee') {
    title = 'Coffee';
    icon = '☕';
  } else if (skillId === 'laundry') {
    title = 'Laundry';
    icon = '🧺';
  } else if (skillId === 'cooking') {
    title = 'Cooking';
    icon = '🍳';
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-foreground/40 bg-foreground/[0.02]">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-border/20">
        <span className="text-5xl opacity-80">{icon}</span>
      </div>
      <div className="font-bold text-xl tracking-widest uppercase">{title} Mode</div>
      <div className="text-sm mt-2">Waiting for 3D Assets...</div>
    </div>
  );
}
