'use client';

import { useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

type SurfaceTag = 'div' | 'article' | 'section' | 'li';

interface SpotlightCardProps {
  as?: SurfaceTag;
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export function SpotlightCard({
  as = 'div',
  children,
  className = '',
  spotlightColor = 'rgba(52, 211, 153, 0.18)',
  spotlightSize = 520,
}: SpotlightCardProps) {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const setRef = (node: HTMLElement | null) => {
    surfaceRef.current = node;
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const rect = surface.getBoundingClientRect();
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const commonProps = {
    ref: setRef,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setOpacity(1),
    onMouseLeave: () => setOpacity(0),
    onFocus: () => setOpacity(1),
    onBlur: () => setOpacity(0),
    className: `reactbits-spotlight relative isolate overflow-hidden ${className}`,
  };

  const content = (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 58%)`,
        }}
      />
      {children}
    </>
  );

  if (as === 'article') return <article {...commonProps}>{content}</article>;
  if (as === 'section') return <section {...commonProps}>{content}</section>;
  if (as === 'li') return <li {...commonProps}>{content}</li>;
  return <div {...commonProps}>{content}</div>;
}
