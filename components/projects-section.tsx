'use client';

import { useRef, useState, useEffect } from 'react';
import { GITHUB_OWNER } from '@/lib/projects';
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
    totalSizeMb: number;
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

  // The horizontal track has N project cards + 1 closing "outro" card.
  // The outro reuses the same 720px-wide slot and lands at the very end of
  // the canvas — so users never see an empty black void after the last card.
  const totalCards = projects.length + 1;

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
  const trackWidth = totalCards * cardWidth + (totalCards - 1) * gap;
  // Distance the track must translate so the LAST (outro) card's right edge
  // aligns with the viewport's right edge (with a comfortable inset).
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
          // Drive the position counter (01..08 — includes the outro)
          const idx = Math.min(
            totalCards,
            Math.max(1, Math.ceil(p * totalCards) || 1)
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
    { scope: container, dependencies: [translateX, totalCards, vw] }
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
              {String(totalCards).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* SCROLL hint — bottom-left */}
      <div className="absolute bottom-8 left-6 md:left-12 z-20 font-mono text-[10px] tracking-[0.4em] text-zinc-600 uppercase flex items-center gap-2">
        <span>scroll → explore</span>
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

          {/* Outro card — lands at the end of the canvas so the user
              never sees an empty black void after the last project. */}
          <div
            className="project-card shrink-0"
            style={{ width: `${cardWidth}px` }}
          >
            <OutroCard
              totalRepos={stats.totalRepos}
              totalStars={stats.totalStars}
              liveDemos={stats.liveDemos}
              totalSizeMb={stats.totalSizeMb}
            />
          </div>
        </div>
      </div>

      {/* End-of-canvas marker — moved to the outro card itself */}
    </section>
  );
}

/**
 * OutroCard — the closing card at the end of the horizontal track.
 *
 * Lands at the tail of the canvas so users never see an empty black void
 * after the last project. Shows aggregate stats + a "let's build" CTA +
 * contact / GitHub links. Mirrors the visual language of ProjectCard
 * (image-area placeholder, emerald corner ticks, monospace metadata) so
 * the canvas reads as one continuous stream.
 */
interface OutroCardProps {
  totalRepos: number;
  totalStars: number;
  liveDemos: number;
  totalSizeMb: number;
}

function OutroCard({ totalRepos, totalStars, liveDemos, totalSizeMb }: OutroCardProps) {
  const githubUrl = `https://github.com/${GITHUB_OWNER}`;
  // Replace with the user's real contact channel if/when available.
  // Kept as a "say hello" CTA so the link target can be added later
  // without a code change.
  return (
    <div className="group/card relative flex flex-col gap-5 p-4 md:p-5 rounded-xl border border-white/10 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-emerald-950/30 transition-all duration-300 ease-out overflow-hidden h-full">
      {/* Cover-area placeholder — keeps the slot 16:9 so the visual rhythm
          matches ProjectCard's cover, but is filled with a subtle emerald
          radial + a large closing glyph. */}
      <div className="relative aspect-video w-full overflow-hidden rounded-md border border-white/10 bg-[#0a0a0a]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(52,211,153,0.18), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(52,211,153,0.08), transparent 50%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.25em] text-white/90 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
          [ end_of_index ]
        </span>
        <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-400/50" />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-400/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/80 uppercase">
            [ thanks_for_watching ]
          </span>
        </div>
      </div>

      {/* Body — aggregate stats + CTA */}
      <div className="relative z-10 flex flex-col gap-4">
        <span className="font-mono text-[9px] tracking-[0.25em] text-emerald-400/80 uppercase">
          ● the_lab_at_a_glance
        </span>

        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
          Let's build the next one
        </h3>

        <p className="text-sm text-zinc-400 leading-relaxed">
          七个项目只是开始。如果你正在做一个值得认真做的产品、想聊 AI 协作、
          或者只是想交换一些想法，我都在。
        </p>

        {/* Chinese elevator-pitch style: a 4-up stat grid */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          {[
            { k: 'repos', v: String(totalRepos), u: 'public' },
            { k: 'stars', v: String(totalStars), u: 'total' },
            { k: 'demos', v: String(liveDemos), u: 'live' },
            { k: 'loc', v: totalSizeMb > 0 ? `${totalSizeMb.toFixed(1)}` : '—', u: 'MB ship' },
          ].map((s) => (
            <div
              key={s.k}
              className="border border-white/5 bg-white/[0.02] rounded-md p-3"
            >
              <div className="font-mono text-[9px] tracking-[0.25em] text-zinc-500 uppercase">
                {s.k}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-white tabular-nums">
                  {s.v}
                </span>
                <span className="font-mono text-[9px] text-zinc-500 uppercase">
                  {s.u}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between gap-3 mt-1 font-mono text-[11px] uppercase tracking-[0.2em]">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>github</span>
            <span aria-hidden>↗</span>
          </a>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
          >
            <span>back to top</span>
            <span aria-hidden>↑</span>
          </a>
        </div>
      </div>
    </div>
  );
}
