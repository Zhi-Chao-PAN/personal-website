'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { CONTACT_EMAIL, GITHUB_OWNER } from '@/lib/projects';

gsap.registerPlugin(ScrollTrigger);

interface OutroSectionProps {
  totalRepos: number;
  totalStars: number;
  liveDemos: number;
  totalSizeMb: number;
}

interface AsciiVeilCanvasProps {
  side: 'left' | 'right';
}

const ASCII_CHARS = ' .,:;irsXA253hMHGS#@';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function gaussian(value: number, center: number, width: number) {
  return Math.exp(-((value - center) ** 2) / width);
}

function createVeilDensity(side: 'left' | 'right', x: number, y: number) {
  const sx = side === 'left' ? x : 1 - x;
  const verticalFade = smoothstep(0.02, 0.14, y) * (1 - smoothstep(0.88, 1, y));
  const sideFade = 1 - smoothstep(0.58, 0.95, sx);
  const aperture =
    0.46 +
    Math.sin(y * 6.4 + (side === 'left' ? 0.8 : 2.1)) * 0.08 +
    Math.sin(y * 17.5 + (side === 'left' ? 1.4 : 0.2)) * 0.035;
  const edgeGlow =
    gaussian(sx, aperture, 0.0046) * 0.58 +
    gaussian(sx, aperture + 0.08, 0.018) * 0.2;

  let strands = 0;
  for (let i = 0; i < 7; i += 1) {
    const offset = 0.06 + i * 0.066;
    const phase = i * 1.37 + (side === 'left' ? 0 : 0.82);
    const curve =
      offset +
      Math.sin(y * (5.2 + i * 0.43) + phase) * (0.026 + i * 0.002) +
      Math.sin(y * (13.5 - i * 0.5) + phase * 1.7) * 0.011;
    strands += gaussian(sx, curve, 0.00062 + i * 0.00016) * (0.72 - i * 0.045);
  }

  const chamber =
    gaussian(sx, 0.24 + Math.sin(y * 8.8) * 0.025, 0.009) * 0.24 +
    gaussian(sx, 0.38 + Math.sin(y * 4.1 + 1.4) * 0.05, 0.018) * 0.18;
  const etchedNoise =
    Math.sin((x * 71.3 + y * 117.9) * Math.PI) *
    Math.sin((x * 29.7 - y * 83.1) * Math.PI) *
    0.08;
  const lowerWeight = 0.78 + smoothstep(0.44, 0.86, y) * 0.32;

  return clamp01(
    verticalFade *
      sideFade *
      lowerWeight *
      (edgeGlow + strands * 0.88 + chamber + Math.max(0, etchedNoise)),
  );
}

function AsciiVeilCanvas({ side }: AsciiVeilCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
    };

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let cellSize = 12;
    let columns = 0;
    let rows = 0;
    let densityData: Float32Array | null = null;
    let isVisible = false;
    let animationFrame = 0;
    let lastDraw = 0;

    const rebuildSamples = () => {
      if (width <= 0 || height <= 0) return;

      columns = Math.min(92, Math.max(18, Math.floor(width / cellSize)));
      rows = Math.min(118, Math.max(20, Math.floor(height / cellSize)));
      densityData = new Float32Array(columns * rows);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = columns <= 1 ? 0 : column / (columns - 1);
          const y = rows <= 1 ? 0 : row / (rows - 1);
          densityData[row * columns + column] = createVeilDensity(side, x, y);
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const maxWidth = Math.min(window.innerWidth * 0.72, 920);
      const maxHeight = Math.min(window.innerHeight * 0.82, 820);
      width = Math.max(1, Math.min(rect.width, maxWidth));
      height = Math.max(1, Math.min(rect.height, maxHeight));
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.45);
      cellSize = width < 420 ? 13 : width < 720 ? 12 : 11;

      const backingWidth = Math.min(1400, Math.floor(width * pixelRatio));
      const backingHeight = Math.min(1400, Math.floor(height * pixelRatio));
      canvas.width = backingWidth;
      canvas.height = backingHeight;
      context.setTransform(backingWidth / width, 0, 0, backingHeight / height, 0, 0);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `${width < 420 ? 700 : 800} ${Math.max(8, cellSize - 1)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

      if (!pointer.active) {
        pointer.x = width / 2;
        pointer.y = height / 2;
        pointer.targetX = pointer.x;
        pointer.targetY = pointer.y;
      }

      rebuildSamples();
    };

    const stopAnimation = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const schedule = () => {
      if (!isVisible || document.hidden || animationFrame) return;
      animationFrame = requestAnimationFrame(draw);
    };

    const draw = (time = performance.now()) => {
      animationFrame = 0;
      if (!densityData) return;

      if (time - lastDraw < 30 && !reducedMotion) {
        schedule();
        return;
      }

      lastDraw = time;
      context.clearRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * 0.16;
      pointer.y += (pointer.targetY - pointer.y) * 0.16;

      const drift = Math.sin(time / 1800) * 4;
      const parallaxX = pointer.active
        ? ((pointer.x / width) - 0.5) * (side === 'left' ? -28 : 28)
        : drift;
      const parallaxY = pointer.active ? ((pointer.y / height) - 0.5) * -18 : Math.cos(time / 2100) * 5;
      const radius = width < 520 ? 96 : 154;
      const radiusSquared = radius * radius;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const alpha = densityData[row * columns + column];
          if (alpha < 0.08) continue;

          const wave = Math.sin(time / 1150 + row * 0.23 + column * 0.07) * 1.5;
          const x = column * cellSize + cellSize * 0.5 + parallaxX + wave;
          const y = row * cellSize + cellSize * 0.5 + parallaxY;
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const distanceSquared = dx * dx + dy * dy;
          const heat = pointer.active && distanceSquared < radiusSquared
            ? 1 - Math.sqrt(distanceSquared) / radius
            : 0;
          const cluster =
            heat > 0 &&
            Math.sin(column * 12.9898 + row * 78.233 + time * 0.006) >
              0.34 - heat * 0.68;
          const charIndex = Math.min(
            ASCII_CHARS.length - 1,
            Math.floor((alpha ** 0.74) * (ASCII_CHARS.length - 1)),
          );

          context.fillStyle = cluster
            ? `rgba(255, 129, 71, ${0.42 + heat * 0.58})`
            : `rgba(245, 245, 244, ${0.16 + alpha * 0.66})`;
          context.shadowBlur = cluster ? 14 : 0;
          context.shadowColor = cluster ? 'rgba(255, 129, 71, 0.65)' : 'transparent';
          context.fillText(cluster ? ASCII_CHARS[ASCII_CHARS.length - 1] : ASCII_CHARS[charIndex], x, y);
        }
      }

      context.shadowBlur = 0;
      if (!reducedMotion) schedule();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = event.clientX - rect.left;
      pointer.targetY = event.clientY - rect.top;
      pointer.active =
        pointer.targetX >= 0 &&
        pointer.targetY >= 0 &&
        pointer.targetX <= rect.width &&
        pointer.targetY <= rect.height;
      schedule();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const activate = () => {
      if (isVisible) return;
      isVisible = true;
      draw();
      if (!reducedMotion) schedule();
    };

    const deactivate = () => {
      isVisible = false;
      stopAnimation();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else if (isVisible) schedule();
    };

    resize();
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            resize();
            if (isVisible) draw();
          });
    resizeObserver?.observe(canvas);

    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) activate();
              else deactivate();
            },
            { rootMargin: '180px 0px', threshold: 0.01 },
          );

    if (intersectionObserver) intersectionObserver.observe(canvas);
    else activate();

    return () => {
      deactivate();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [side]);

  return <canvas ref={canvasRef} aria-hidden className="ascii-veil__canvas" />;
}

export function OutroSection({
  totalRepos,
  totalStars,
  liveDemos,
  totalSizeMb,
}: OutroSectionProps) {
  const container = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const githubUrl = `https://github.com/${GITHUB_OWNER}`;

  useEffect(() => {
    const section = container.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.dataset.active = entry.isIntersecting ? 'true' : 'false';
      },
      { rootMargin: '180px 0px', threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = container.current;
      const pin = pinRef.current;
      if (!section || !pin) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isCompact = window.innerWidth < 768;
      const titleSplit = new SplitType('.ascii-footer-title', { types: 'lines,words,chars' });
      const copySplit = new SplitType('.ascii-footer-copy', { types: 'lines' });
      const titleChars = titleSplit.chars ?? [];
      const copyLines = copySplit.lines ?? [];

      if (reducedMotion) {
        gsap.set('.ascii-footer-stage, .ascii-veil, .ascii-footer-nav a, .ascii-footer-kicker, .ascii-footer-copy, .ascii-footer-meta, .ascii-footer-stat, .ascii-footer-credit', {
          opacity: 1,
          clearProps: 'transform,clipPath',
        });
        return () => {
          titleSplit.revert();
          copySplit.revert();
        };
      }

      gsap.set('.ascii-footer-stage', {
        clipPath: isCompact ? 'inset(0% 0% 0% 0%)' : 'inset(18% 8% 18% 8%)',
        scale: isCompact ? 1 : 0.965,
      });
      gsap.set('.ascii-veil--left', { xPercent: -30, yPercent: 5, rotate: -2.5, opacity: 0 });
      gsap.set('.ascii-veil--right', { xPercent: 30, yPercent: 5, rotate: 2.5, opacity: 0 });
      gsap.set(titleChars, { yPercent: 112, opacity: 0 });
      gsap.set(copyLines, { y: 36, opacity: 0 });
      gsap.set(
        '.ascii-footer-kicker, .ascii-footer-nav a, .ascii-footer-meta, .ascii-footer-stat, .ascii-footer-credit',
        { y: 22, opacity: 0 },
      );
      gsap.set('.ascii-footer-rule', { scaleX: 0, transformOrigin: 'left center' });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: isCompact
          ? {
              trigger: section,
              start: 'top 78%',
              once: true,
            }
          : {
              trigger: section,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 0.95,
              invalidateOnRefresh: true,
            },
      });

      tl.to('.ascii-footer-stage', {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        duration: 0.28,
        ease: 'expo.inOut',
      })
        .to(
          '.ascii-veil--left',
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 0.9, duration: 0.34 },
          0.04,
        )
        .to(
          '.ascii-veil--right',
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 0.9, duration: 0.34 },
          0.06,
        )
        .to('.ascii-footer-rule', { scaleX: 1, duration: 0.22, ease: 'expo.inOut' }, 0.15)
        .to(
          '.ascii-footer-kicker, .ascii-footer-nav a',
          { y: 0, opacity: 1, duration: 0.2, stagger: 0.018 },
          0.18,
        )
        .to(
          titleChars,
          { yPercent: 0, opacity: 1, duration: 0.42, stagger: 0.008, ease: 'expo.out' },
          0.24,
        )
        .to(copyLines, { y: 0, opacity: 1, duration: 0.24, stagger: 0.045 }, 0.42)
        .to('.ascii-footer-meta, .ascii-footer-stat', { y: 0, opacity: 1, duration: 0.22, stagger: 0.035 }, 0.5)
        .to('.ascii-footer-credit', { y: 0, opacity: 1, duration: 0.2 }, 0.62);

      ScrollTrigger.refresh();

      return () => {
        titleSplit.revert();
        copySplit.revert();
      };
    },
    { scope: container },
  );

  const stats = [
    { value: String(totalRepos), label: 'public repos' },
    { value: String(liveDemos), label: 'live demos' },
    { value: String(totalStars), label: 'stars' },
    { value: totalSizeMb > 0 ? totalSizeMb.toFixed(1) : '-', label: 'mb shipped' },
  ];

  return (
    <footer
      ref={container}
      id="outro"
      data-active="false"
      className="finale-section ascii-footer relative bg-[#030303] text-white"
    >
      <div ref={pinRef} className="ascii-footer-pin relative overflow-hidden">
        <div className="ascii-footer-stage">
          <div className="ascii-footer-grain" aria-hidden />
          <div className="ascii-footer-veils" aria-hidden>
            <div className="ascii-veil ascii-veil--left">
              <AsciiVeilCanvas side="left" />
            </div>
            <div className="ascii-veil ascii-veil--right">
              <AsciiVeilCanvas side="right" />
            </div>
          </div>

          <div className="ascii-footer-content">
            <header className="ascii-footer-top">
              <span className="ascii-footer-kicker">ZhiChao Pan / Digital Lab</span>
              <nav className="ascii-footer-nav" aria-label="Footer navigation">
                <a href="#projects">Projects</a>
                <a href="#focus">Focus</a>
                <a href={githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
              </nav>
            </header>

            <span className="ascii-footer-rule" aria-hidden />

            <div className="ascii-footer-body">
              <div className="ascii-footer-copy-block">
                <p className="ascii-footer-meta">Applied AI / agent systems / product engineering</p>
                <p className="ascii-footer-copy">
                  A small studio surface for turning blank requirements into working systems.
                  I build with agents, RAG, evaluation, and full-stack product loops, then keep
                  the proof close enough for people to inspect.
                </p>
              </div>

              <div className="ascii-footer-stats" aria-label="Site metrics">
                {stats.map((stat) => (
                  <div key={stat.label} className="ascii-footer-stat">
                    <span>{stat.value}</span>
                    <small>{stat.label}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="ascii-footer-title-wrap">
              <h2 className="ascii-footer-title">
                Blank <span>/</span> Canvas
              </h2>
            </div>

            <div className="ascii-footer-bottom">
              <p className="ascii-footer-credit">Bring a real problem. Leave with a system boundary.</p>
              <button
                type="button"
                className="ascii-footer-credit ascii-footer-restart"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
