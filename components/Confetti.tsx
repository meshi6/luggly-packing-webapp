'use client';

import { useEffect, useState } from 'react';

const COLORS = [
  'oklch(0.5 0.15 200)',   // primary teal
  'oklch(0.62 0.18 165)',  // accent green
  'oklch(0.7 0.1 200)',    // secondary light blue
  'oklch(0.8 0.15 90)',    // warm yellow
  'oklch(0.65 0.2 30)',    // soft coral
];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  fallDuration: number;
  delay: number;
  rotation: number;
  shape: 'square' | 'circle' | 'rect';
}

export function Confetti({ onComplete }: { onComplete?: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      fallDuration: Math.random() * 1.5 + 1.5,
      delay: Math.random() * 0.4,
      rotation: Math.random() * 360,
      shape: (['square', 'circle', 'rect'] as const)[Math.floor(Math.random() * 3)],
    }));
    setParticles(generated);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.shape === 'rect' ? `${p.size * 1.5}px` : `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            '--fall-duration': `${p.fallDuration}s`,
            '--fall-delay': `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
