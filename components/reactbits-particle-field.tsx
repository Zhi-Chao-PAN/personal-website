'use client';

import { useEffect, useRef } from 'react';

interface ParticleFieldProps {
  className?: string;
  maxParticles?: number;
  density?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

const PALETTE = [
  '110, 231, 183',
  '56, 189, 248',
  '244, 114, 182',
  '253, 224, 71',
];

function createParticle(width: number, height: number): Particle {
  const speed = 0.14 + Math.random() * 0.38;
  const angle = Math.random() * Math.PI * 2;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 0.8 + Math.random() * 1.8,
    alpha: 0.18 + Math.random() * 0.54,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  };
}

export function ParticleField({
  className,
  maxParticles = 94,
  density = 12500,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, active: false };
    let particles: Particle[] = [];
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const compactLimit = width < 640 ? 46 : maxParticles;
      const targetCount = Math.max(28, Math.min(compactLimit, Math.floor((width * height) / density)));
      particles = Array.from({ length: targetCount }, () => createParticle(width, height));
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= rect.width &&
        pointer.y <= rect.height;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      const lineDistance = width < 640 ? 96 : 132;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        if (!reducedMotion) {
          if (pointer.active) {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < 220) {
              const force = (1 - distance / 220) * 0.012;
              p.vx += (dx / distance) * force;
              p.vy += (dy / distance) * force;
            }
          }

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.995;
          p.vy *= 0.995;

          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        }

        for (let j = i + 1; j < particles.length; j += 1) {
          const n = particles[j];
          const dx = p.x - n.x;
          const dy = p.y - n.y;
          const distance = Math.hypot(dx, dy);

          if (distance < lineDistance) {
            const alpha = (1 - distance / lineDistance) * 0.16;
            context.strokeStyle = `rgba(110, 231, 183, ${alpha})`;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(n.x, n.y);
            context.stroke();
          }
        }

        context.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        context.beginPath();
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();
      }

      if (pointer.active) {
        const gradient = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          width < 640 ? 110 : 180,
        );
        gradient.addColorStop(0, 'rgba(110, 231, 183, 0.24)');
        gradient.addColorStop(0.4, 'rgba(56, 189, 248, 0.08)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(pointer.x, pointer.y, width < 640 ? 110 : 180, 0, Math.PI * 2);
        context.fill();
      }

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [density, maxParticles]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
    />
  );
}
