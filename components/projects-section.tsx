'use client';

import { useRef } from 'react';
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

  // The horizontal track has N project cards (no trailing outro — that's
  // now a standalone 100vh section after the canvas).
  const totalCards = projects.length;

  // Layout constants — chosen to look great on a 1440×900 viewport and
  // gracefully degrade on smaller screens. No need for state — these
  // values are stable across resizes, and the few that DO need to track
  // viewport width (translateX) are recomputed inside the GSAP effect.
  const cardWidth = 640;
  const gap = 24;

  // Compute sideInset at render time using window (safe because we render
  // on the client; SSR uses the default 1440 which is fine — the effect
  // refreshes on mount). Centers the first/last card at canvas boundaries.
  const sideInset =
    typeof window === 'undefined'
      ? (1440 - cardWidth) / 2
      : (window.innerWidth - cardWidth) / 2;

  useGSAP(
    () => {
      // Skip the heavy pin behavior on short viewports / touch-only devices
      // — fall back to a native horizontal scroll instead.
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isCompact = vw < 768;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isCompact || reducedMotion) return;

      // Compute track width at effect-time (not render-time) so it always
      // reflects the current viewport, even after resize / orientation.
      const trackWidth = totalCards * cardWidth + (totalCards - 1) * gap;
      // sideInset is computed at the component level (so SSR + JSX agree)
      // and closed over here for the ScrollTrigger math.
      const translateX = Math.max(0, trackWidth - vw + sideInset * 2);
      const endDistance = translateX + vh * 0.6;

      // Initial state: cards faded in by their own translateX position
      // (gives a sense of depth as the track is loaded).
      gsap.set('.project-card', { opacity: 0, x: 60 });
      gsap.set('.pscan-line', { scaleX: 0, transformOrigin: 'left center' });

      const trigger = ScrollTrigger.create({
        trigger: container.current,
        start: 'top top',
        end: `+=${endDistance}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          // GSAP normally auto-expands the .pin-spacer to end-start, but
          // Lenis + some Next 16 builds swallow the resize observer tick
          // and the spacer stays at the section's natural height — which
          // means the user can't scroll the canvas. Force it explicitly.
          const pinEl = self.pin as { spacer?: HTMLElement } | undefined;
          if (pinEl?.spacer) {
            pinEl.spacer.style.height = `${self.end - self.start}px`;
          }
        },
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
          // Drive per-card focus: the card nearest the viewport center is
          // the "spotlight" — it scales up, lifts, glows emerald, and
          // reaches full opacity. Cards further away fade, shrink back,
          // and lose the glow. All four properties interpolate from a
          // single `t` (closeness, 0..1) so the motion is smooth & unified.
          const centerX = window.innerWidth / 2;
          const focusRadius = window.innerWidth * 0.32; // how far the focus reaches
          document.querySelectorAll<HTMLElement>('.project-card').forEach((el) => {
            const r = el.getBoundingClientRect();
            const cardCenter = (r.left + r.right) / 2;
            const dist = Math.abs(cardCenter - centerX);
            // t=1 at center, t=0 at focusRadius or beyond (eased so falloff
            // feels natural rather than linear).
            const raw = Math.max(0, 1 - dist / focusRadius);
            const t = raw * raw * (3 - 2 * raw); // smoothstep
            // Scale 1.0 → 1.15, lift 0 → -14px, opacity 0.3 → 1.0
            const scale = 1 + 0.15 * t;
            const y = -14 * t;
            const opacity = 0.3 + 0.7 * t;
            el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
            el.style.opacity = String(opacity);
            // Emerald glow only on the focused card (t > 0.55)
            if (t > 0.55) {
              const glow = (t - 0.55) / 0.45; // 0..1
              const blur = 8 + glow * 20; // 8..28px
              el.style.boxShadow = `0 0 ${blur}px rgba(52,211,153,${0.18 + glow * 0.32})`;
              el.style.borderColor = `rgba(52,211,153,${0.25 + glow * 0.45})`;
              el.style.zIndex = String(10 + Math.round(glow * 10));
            } else {
              el.style.boxShadow = 'none';
              el.style.borderColor = '';
              el.style.zIndex = '';
            }
          });
        },
      });

      // Settle into the "rest" state so SSR users see the first card
      // clearly before scrolling starts. The focus interpolation in
      // onUpdate will set the actual scale/lift/opacity once layout
      // settles; here we just clear the initial gsap.set() hide.
      requestAnimationFrame(() => {
        if (track.current) track.current.style.transform = 'translate3d(0,0,0)';
        // Force ScrollTrigger to recompute pin spacer + run onUpdate
        // (cards are 640px wide and may shift the section's bounding box,
        // and the gsap.set opacity:0 we did above needs to be overwritten
        // with the per-card focus values).
        ScrollTrigger.refresh();
      });

      return () => trigger.kill();
    },
    { scope: container, dependencies: [totalCards, sideInset] }
  );

  const subtitle = `[ ${stats.totalRepos}_PUBLIC_REPOS · ${stats.liveDemos}_LIVE_DEMOS · ${stats.totalStars}_STARS_TOTAL ]`;

  return (
    <section
      ref={container}
      id="projects"
      className="relative w-full h-screen overflow-hidden bg-[#030303] flex flex-col"
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
      <div className="relative z-20 px-6 md:px-12 pt-20 md:pt-24 shrink-0">
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

      {/* Horizontal track — vertically centered in remaining space.
          flex-1 + items-center + h-full lets the track inherit the
          leftover height under the static header. */}
      <div className="relative z-10 flex-1 flex items-center min-h-0">
        <div
          ref={track}
          className="flex will-change-transform"
          style={{
            gap: `${gap}px`,
            paddingLeft: `${sideInset}px`,
            paddingRight: `${sideInset}px`,
          }}
        >
          {projects.map((project, i) => (
            <div
              key={project.slug}
              className="project-card shrink-0 origin-center will-change-transform"
              style={{ width: `${cardWidth}px` }}
            >
              <ProjectCard project={project} priorityImage={i < 2} compact />
            </div>
          ))}
        </div>
      </div>

      {/* SCROLL hint — bottom-left */}
      <div className="relative z-20 px-6 md:px-12 pb-8 shrink-0 font-mono text-[10px] tracking-[0.4em] text-zinc-600 uppercase flex items-center gap-2">
        <span>scroll → explore</span>
        <span className="inline-block w-12 h-px bg-zinc-700" />
      </div>
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
