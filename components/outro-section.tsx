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

interface AsciiHandCanvasProps {
  side: 'left' | 'right';
}

const ASCII_CHARS = ' .,:;irsXA253hMHGS#@';

function createHandSvg(side: 'left' | 'right') {
  const flip = side === 'right' ? 'transform="translate(520 0) scale(-1 1)"' : '';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 760">
      <rect width="520" height="760" fill="none"/>
      <g ${flip} fill="#fff">
        <rect x="-58" y="548" width="282" height="128" rx="62"/>
        <ellipse cx="210" cy="462" rx="126" ry="154"/>
        <rect x="134" y="118" width="58" height="310" rx="29" transform="rotate(-13 163 274)"/>
        <rect x="204" y="74" width="60" height="352" rx="30" transform="rotate(-4 234 250)"/>
        <rect x="276" y="104" width="57" height="322" rx="28.5" transform="rotate(7 305 260)"/>
        <rect x="342" y="165" width="52" height="264" rx="26" transform="rotate(16 368 296)"/>
        <path d="M96 434C48 404 31 357 47 322C65 282 121 319 157 382C176 416 155 463 96 434Z"/>
        <path d="M115 610C147 669 206 700 292 692C225 738 104 720 30 666Z"/>
      </g>
    </svg>
  `)}`;
}

function AsciiHandCanvas({ side }: AsciiHandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const image = new Image();
    image.decoding = 'async';
    image.src = createHandSvg(side);

    const sampleCanvas = document.createElement('canvas');
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return;

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
    let sampleData: Uint8ClampedArray | null = null;
    let imageReady = false;
    let isVisible = false;
    let animationFrame = 0;
    let lastDraw = 0;

    const rebuildSamples = () => {
      if (!imageReady || width <= 0 || height <= 0) return;

      columns = Math.min(92, Math.max(18, Math.floor(width / cellSize)));
      rows = Math.min(118, Math.max(20, Math.floor(height / cellSize)));
      sampleCanvas.width = columns;
      sampleCanvas.height = rows;
      sampleContext.clearRect(0, 0, columns, rows);
      sampleContext.drawImage(image, 0, 0, columns, rows);
      sampleData = sampleContext.getImageData(0, 0, columns, rows).data;
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
      if (!sampleData) return;

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
          const index = (row * columns + column) * 4;
          const alpha = sampleData[index + 3] / 255;
          if (alpha < 0.08) continue;

          const x = column * cellSize + cellSize * 0.5 + parallaxX;
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
            Math.floor(alpha * (ASCII_CHARS.length - 1)),
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

    image.onload = () => {
      imageReady = true;
      resize();
      draw();
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

  return <canvas ref={canvasRef} aria-hidden className="ascii-hand__canvas" />;
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
        gsap.set('.ascii-footer-stage, .ascii-hand, .ascii-footer-nav a, .ascii-footer-kicker, .ascii-footer-copy, .ascii-footer-meta, .ascii-footer-stat, .ascii-footer-credit', {
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
      gsap.set('.ascii-hand--left', { xPercent: -32, yPercent: 8, rotate: -4, opacity: 0 });
      gsap.set('.ascii-hand--right', { xPercent: 32, yPercent: 8, rotate: 4, opacity: 0 });
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
          '.ascii-hand--left',
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 0.92, duration: 0.34 },
          0.04,
        )
        .to(
          '.ascii-hand--right',
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 0.92, duration: 0.34 },
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
          <div className="ascii-footer-hands" aria-hidden>
            <div className="ascii-hand ascii-hand--left">
              <AsciiHandCanvas side="left" />
            </div>
            <div className="ascii-hand ascii-hand--right">
              <AsciiHandCanvas side="right" />
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
