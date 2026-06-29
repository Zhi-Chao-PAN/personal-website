'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Project } from '@/lib/projects.types';
import { ProjectCard } from './project-card';
import { SectionHeading } from './section-heading';
import { ProjectModalProvider } from './modal-provider';
import { ProjectModal } from './project-modal';

interface ProjectsSectionProps {
  projects: Project[];
  stats: {
    totalRepos: number;
    totalStars: number;
    liveDemos: number;
  };
}

/**
 * Projects showcase — horizontal pin-scroll canvas.
 *
 * The section is pinned at viewport top, then scrubbed horizontally:
 * 7 project cards stream from right to left as the user scrolls.
 *
 *   [ TITLE — static overlay ]                (always visible)
 *   ┌─────────┐  ┌─────────┐  ┌─────────┐    (horizontal track)
 *   │ card 01 │  │ card 02 │  │ card 03 │ ...
 *   └─────────┘  └─────────┘  └─────────┘
 *
 * Driven by a single ScrollTrigger with `pin: true, scrub: 1`.
 * Background has a subtle moving scanline + a per-card progress indicator
 * (01/07 → 07/07) that interpolates with scroll progress.
 */
export function ProjectsSection({ projects, stats }: ProjectsSectionProps) {
  return (
    <ProjectModalProvider>
      <ProjectsContent projects={projects} stats={stats} />
      <ProjectModal projects={projects} />
    </ProjectModalProvider>
  );
}

function ProjectsContent({ projects, stats }: ProjectsSectionProps) {
  const container = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Read viewport width on the client (avoids SSR mismatch with translateX math).
  const [vw, setVw] = useState(1440);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Card sizing — single column when narrow, slightly larger when wide.
  const cardWidth = Math.max(360, Math.min(720, vw * 0.78));
  const gap = 24; // matches gap-6
  const trackWidth = projects.length * cardWidth + (projects.length - 1) * gap;
  // Distance the track must translate so the LAST card's right edge aligns
  // with the viewport's right edge (with a comfortable inset).
  const inset = 48; // px from viewport edge
  const translateX = Math.max(0, trackWidth - vw + inset * 2);

  useGSAP(
    () => {
      // Skip the heavy pin behavior on short viewports / touch-only devices
      // — fall back to a native horizontal scroll instead.
      const isCompact = window.innerWidth < 768;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isCompact || reducedMotion) return;

      // Initial state: cards faded in by their own translateX position
      // (gives a sense of depth as the track is loaded).
      gsap.set('.project-card', { opacity: 0, x: 60 });
      gsap.set('.pscan-line', { scaleX: 0, transformOrigin: 'left center' });

      const trigger = ScrollTrigger.create({
        trigger: container.current,
        start: 'top top',
        end: () => `+=${translateX + window.innerHeight * 0.6}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          // Drive the track translation
          if (track.current) {
            track.current.style.transform = `translate3d(${-p * translateX}px, 0, 0)`;
          }
          // Drive the position counter (01..07)
          const idx = Math.min(
            projects.length,
            Math.max(1, Math.ceil(p * projects.length) || 1)
          );
          if (counterRef.current) {
            counterRef.current.textContent = String(idx).padStart(2, '0');
          }
          // Drive the scanline (left -> right across the section)
          if (fillRef.current) {
            fillRef.current.style.transform = `scaleX(${p})`;
          }
          // Reveal each card as its left edge crosses the viewport center
          document.querySelectorAll<HTMLElement>('.project-card').forEach((el) => {
            const r = el.getBoundingClientRect();
            const center = window.innerWidth / 2;
            const dist = Math.abs((r.left + r.right) / 2 - center);
            const visible = Math.max(0, 1 - dist / (window.innerWidth * 0.6));
            el.style.opacity = String(Math.max(0.15, visible));
            el.style.transform = `translate3d(0, ${(1 - visible) * 24}px, 0)`;
          });
        },
      });

      // After the first paint, settle into the "rest" state so SSR users
      // see the first card clearly before scrolling starts.
      requestAnimationFrame(() => {
        if (track.current) track.current.style.transform = 'translate3d(0,0,0)';
        const first = document.querySelector<HTMLElement>('.project-card');
        if (first) {
          first.style.opacity = '1';
          first.style.transform = 'translate3d(0,0,0)';
        }
      });

      return () => trigger.kill();
    },
    { scope: container, dependencies: [translateX, projects.length, vw] }
  );

  const subtitle = `[ ${stats.totalRepos}_PUBLIC_REPOS · ${stats.liveDemos}_LIVE_DEMOS · ${stats.totalStars}_STARS_TOTAL ]`;

  return (
    <section
      ref={container}
      id="projects"
      className="relative w-full h-screen overflow-hidden bg-[#030303]"
    >
      {/* Background — subtle moving scanline + grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '4vw 4vw',
        }}
      />
      <div
        ref={fillRef}
        aria-hidden
        className="pscan-line pointer-events-none absolute top-0 left-0 h-px bg-gradient-to-r from-emerald-400/0 via-emerald-400/80 to-emerald-400/0 will-change-transform"
        style={{ width: '100%' }}
      />

      {/* Static top overlay: section heading + counter */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 md:px-12 pt-20 md:pt-24">
        <div className="relative max-w-7xl mx-auto">
          <SectionHeading
            label="[ INDEX_02 — PROJECTS ]"
            title="What I've Shipped"
            subtitle={subtitle}
          />
          {/* Position counter — top right */}
          <div className="hidden md:flex absolute top-0 right-0 items-baseline gap-1 font-mono text-[11px] tracking-[0.3em] text-zinc-500">
            <span
              ref={counterRef}
              className="text-2xl md:text-3xl text-emerald-400 font-black tabular-nums"
            >
              01
            </span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-600 tabular-nums">
              {String(projects.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* SCROLL hint — bottom-left */}
      <div className="absolute bottom-8 left-6 md:left-12 z-20 font-mono text-[10px] tracking-[0.4em] text-zinc-600 uppercase flex items-center gap-2">
        <span>scroll →</span>
        <span className="inline-block w-12 h-px bg-zinc-700" />
      </div>

      {/* Horizontal track — the actual scrollable canvas */}
      <div className="absolute inset-x-0 top-[42%] md:top-[46%] -translate-y-1/2 z-10">
        <div
          ref={track}
          className="flex will-change-transform"
          style={{
            gap: `${gap}px`,
            paddingLeft: `${inset}px`,
            paddingRight: `${inset}px`,
          }}
        >
          {projects.map((project, i) => (
            <div
              key={project.slug}
              className="project-card shrink-0"
              style={{ width: `${cardWidth}px` }}
            >
              <ProjectCard project={project} priorityImage={i < 2} />
            </div>
          ))}
        </div>
      </div>

      {/* End-of-canvas marker */}
      <div className="absolute bottom-8 right-6 md:right-12 z-20 font-mono text-[10px] tracking-[0.4em] text-zinc-600 uppercase">
        <span className="opacity-50">[ end_of_index ]</span>
      </div>
    </section>
  );
}
