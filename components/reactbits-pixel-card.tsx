'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type SurfaceTag = 'div' | 'article' | 'section' | 'li';

class Pixel {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly x: number;
  private readonly y: number;
  private readonly color: string;
  private readonly speed: number;
  private readonly sizeStep: number;
  private readonly minSize = 0.5;
  private readonly maxSizeInteger = 2;
  private readonly maxSize: number;
  private readonly delay: number;
  private readonly counterStep: number;
  private counter = 0;
  private size = 0;
  private isReverse = false;
  private isShimmer = false;
  isIdle = false;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.random(0.1, 0.9) * speed;
    this.sizeStep = Math.random() * 0.4;
    this.maxSize = this.random(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counterStep = Math.random() * 4 + (canvas.width + canvas.height) * 0.01;
  }

  private random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  private draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }

    if (this.size >= this.maxSize) this.isShimmer = true;

    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }

    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;

    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }

    this.size -= 0.1;
    this.draw();
  }

  private shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }

    this.size += this.isReverse ? -this.speed : this.speed;
  }
}

interface PixelCardProps {
  as?: SurfaceTag;
  children: ReactNode;
  className?: string;
  colors?: string;
  gap?: number;
  speed?: number;
}

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  if (value <= 0 || reducedMotion) return 0;
  return value * 0.001;
}

export function PixelCard({
  as = 'div',
  children,
  className = '',
  colors = '#6ee7b7,#38bdf8,#fde68a,#f0abfc',
  gap = 12,
  speed = 28,
}: PixelCardProps) {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const previousTimeRef = useRef(0);

  const setRef = (node: HTMLElement | null) => {
    surfaceRef.current = node;
  };

  const initPixels = useCallback(() => {
    const surface = surfaceRef.current;
    const canvas = canvasRef.current;
    if (!surface || !canvas) return;

    const rect = surface.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const palette = colors.split(',').map((color) => color.trim()).filter(Boolean);
    const nextPixels: Pixel[] = [];
    const finalGap = Math.max(4, Math.floor(gap));

    for (let x = 0; x < width; x += finalGap) {
      for (let y = 0; y < height; y += finalGap) {
        const color = palette[Math.floor(Math.random() * palette.length)] ?? '#6ee7b7';
        const dx = x - width / 2;
        const dy = y - height / 2;
        const delay = reducedMotion ? 0 : Math.sqrt(dx * dx + dy * dy);
        nextPixels.push(
          new Pixel(canvas, ctx, x, y, color, getEffectiveSpeed(speed, reducedMotion), delay),
        );
      }
    }

    pixelsRef.current = nextPixels;
  }, [colors, gap, speed]);

  const animate = (mode: 'appear' | 'disappear', now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    animationRef.current = requestAnimationFrame((nextTime) => animate(mode, nextTime));
    const interval = 1000 / 60;
    const previous = previousTimeRef.current || now;
    const elapsed = now - previous;
    if (elapsed < interval) return;
    previousTimeRef.current = now - (elapsed % interval);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allIdle = true;
    for (const pixel of pixelsRef.current) {
      if (mode === 'appear') pixel.appear();
      if (mode === 'disappear') pixel.disappear();
      if (!pixel.isIdle) allIdle = false;
    }

    if (allIdle && animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const startAnimation = (mode: 'appear' | 'disappear') => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    previousTimeRef.current = 0;
    animationRef.current = requestAnimationFrame((time) => animate(mode, time));
  };

  useEffect(() => {
    initPixels();

    const surface = surfaceRef.current;
    if (!surface || typeof ResizeObserver === 'undefined') {
      return () => {
        if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      };
    }

    const observer = new ResizeObserver(() => initPixels());
    observer.observe(surface);

    return () => {
      observer.disconnect();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [initPixels]);

  const commonProps = {
    ref: setRef,
    onMouseEnter: () => startAnimation('appear'),
    onMouseLeave: () => startAnimation('disappear'),
    onFocusCapture: () => startAnimation('appear'),
    onBlurCapture: () => startAnimation('disappear'),
    className: `reactbits-pixel-card relative isolate overflow-hidden ${className}`,
  };

  const content = (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-60 mix-blend-screen"
      />
      <div className="relative z-10">{children}</div>
    </>
  );

  if (as === 'article') return <article {...commonProps}>{content}</article>;
  if (as === 'section') return <section {...commonProps}>{content}</section>;
  if (as === 'li') return <li {...commonProps}>{content}</li>;
  return <div {...commonProps}>{content}</div>;
}
