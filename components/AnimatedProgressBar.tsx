'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedProgressBarProps {
  percent: number;
  height?: string;
  className?: string;
}

export function AnimatedProgressBar({ percent, height = 'h-2', className = '' }: AnimatedProgressBarProps) {
  const [displayPercent, setDisplayPercent] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevPercent = useRef(0);

  useEffect(() => {
    // Animate to new value
    setDisplayPercent(percent);

    // Flash red if newly over 100
    if (percent > 100 && prevPercent.current <= 100) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 800);
    }
    prevPercent.current = percent;
  }, [percent]);

  const colorClass = percent > 100
    ? 'bg-destructive'
    : percent > 80
    ? 'bg-orange-500'
    : 'bg-primary';

  return (
    <div className={`w-full ${height} bg-muted rounded-full overflow-hidden ${className}`}>
      <div
        className={`${height} rounded-full progress-bar-animated ${colorClass} ${isFlashing ? 'flash-red' : ''}`}
        style={{ width: `${Math.min(displayPercent, 100)}%` }}
      />
    </div>
  );
}
