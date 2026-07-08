'use client';

import Image from 'next/image';
import { useMemo, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getProjectImage } from '@/lib/project-image';
import type { Project } from '@/lib/projects.types';
import { ProjectModalProvider, useProjectModal } from './modal-provider';
import { ProjectModal } from './project-modal';

gsap.registerPlugin(ScrollTrigger);

interface FloatingProjectGalleryProps {
  projects: Project[];
  stats: {
    totalRepos: number;
    liveDemos: number;
  };
}

const LAYOUT = [
  {
    left: '-1%',
    top: '48%',
    width: '12.6rem',
    aspect: '1.45 / 1',
    rotate: -3,
    depth: 0.88,
    start: 0.08,
    end: 0.58,
    entryX: -820,
    entryY: 34,
    exitX: 820,
    exitY: -280,
    radiusX: 575,
    radiusY: 205,
    angle: 2.96,
    turn: -0.86,
    lift: -18,
    z: 15,
  },
  {
    left: '14%',
    top: '39%',
    width: '12.4rem',
    aspect: '1.35 / 1',
    rotate: 2,
    depth: 0.82,
    start: 0.14,
    end: 0.68,
    entryX: -760,
    entryY: 290,
    exitX: 680,
    exitY: -340,
    radiusX: 520,
    radiusY: 178,
    angle: 2.38,
    turn: -0.94,
    lift: -38,
    z: 14,
  },
  {
    left: '33%',
    top: '31%',
    width: '12rem',
    aspect: '1.62 / 1',
    rotate: -2,
    depth: 0.72,
    start: 0.2,
    end: 0.74,
    entryX: -320,
    entryY: -430,
    exitX: 760,
    exitY: 180,
    radiusX: 465,
    radiusY: 148,
    angle: 1.75,
    turn: -0.9,
    lift: -78,
    z: 13,
  },
  {
    left: '52%',
    top: '30%',
    width: '12.8rem',
    aspect: '1.28 / 1',
    rotate: 1,
    depth: 0.78,
    start: 0.26,
    end: 0.82,
    entryX: 160,
    entryY: -460,
    exitX: -740,
    exitY: 240,
    radiusX: 442,
    radiusY: 170,
    angle: 0.98,
    turn: -0.96,
    lift: -62,
    z: 13,
  },
  {
    left: '75%',
    top: '40%',
    width: '12.8rem',
    aspect: '1.7 / 1',
    rotate: 2,
    depth: 0.86,
    start: 0.32,
    end: 0.9,
    entryX: 820,
    entryY: -180,
    exitX: -760,
    exitY: -120,
    radiusX: 520,
    radiusY: 186,
    angle: 0.24,
    turn: -0.88,
    lift: -30,
    z: 15,
  },
  {
    left: '94%',
    top: '51%',
    width: '11.6rem',
    aspect: '0.82 / 1',
    rotate: 3,
    depth: 1,
    start: 0.38,
    end: 0.98,
    entryX: 850,
    entryY: 120,
    exitX: -840,
    exitY: 330,
    radiusX: 610,
    radiusY: 240,
    angle: -0.34,
    turn: -0.92,
    lift: 8,
    z: 16,
  },
  {
    left: '10%',
    top: '77%',
    width: '18.5rem',
    aspect: '1.78 / 1',
    rotate: -2,
    depth: 1.14,
    start: 0.44,
    end: 1,
    entryX: -860,
    entryY: 520,
    exitX: 760,
    exitY: -420,
    radiusX: 650,
    radiusY: 270,
    angle: -1.12,
    turn: -0.82,
    lift: 54,
    z: 18,
  },
  {
    left: '58%',
    top: '78%',
    width: '19.5rem',
    aspect: '1.7 / 1',
    rotate: -1,
    depth: 1.18,
    start: 0.5,
    end: 1,
    entryX: 820,
    entryY: 520,
    exitX: -780,
    exitY: -390,
    radiusX: 690,
    radiusY: 294,
    angle: -1.72,
    turn: -0.86,
    lift: 74,
    z: 17,
  },
  {
    left: '86%',
    top: '74%',
    width: '13.2rem',
    aspect: '0.78 / 1',
    rotate: 2,
    depth: 1.06,
    start: 0.54,
    end: 1,
    entryX: 900,
    entryY: 360,
    exitX: -520,
    exitY: -500,
    radiusX: 620,
    radiusY: 280,
    angle: -2.3,
    turn: -0.8,
    lift: 34,
    z: 16,
  },
  {
    left: '45%',
    top: '78%',
    width: '17.5rem',
    aspect: '1.45 / 1',
    rotate: 1,
    depth: 1.1,
    start: 0.02,
    end: 0.46,
    entryX: 120,
    entryY: 620,
    exitX: 760,
    exitY: -500,
    radiusX: 600,
    radiusY: 250,
    angle: -1.52,
    turn: -0.9,
    lift: 42,
    z: 14,
  },
] as const;

const GALLERY_COUNTER_BASE = 42;
const GALLERY_COUNTER_RANGE = 17;
const GALLERY_PROJECT_PRIORITY = [
  'launchlens-ai',
  'launchlens-research-studio',
  'model-eval-studio',
  'ai-life-progress-coach',
  'safety-critical-battery-prognostics',
  'structure-aware-rag-empirical',
  'vision-centric-financial-swarm',
  'deepnerve-3d',
  'CampusTradeAI',
  'codex-zcode-remote-relay',
] as const;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

function lerp(start: number, end: number, value: number) {
  return start + (end - start) * value;
}

export function FloatingProjectGallery({ projects, stats }: FloatingProjectGalleryProps) {
  return (
    <ProjectModalProvider>
      <FloatingProjectGalleryContent projects={projects} stats={stats} />
      <ProjectModal projects={projects} />
    </ProjectModalProvider>
  );
}

function FloatingProjectGalleryContent({ projects, stats }: FloatingProjectGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const leftCounterRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const railFillRef = useRef<HTMLSpanElement>(null);
  const { open } = useProjectModal();

  const galleryProjects = useMemo(() => {
    const priority = new Map<string, number>(
      GALLERY_PROJECT_PRIORITY.map((slug, index) => [slug, index]),
    );
    return [...projects]
      .sort((a, b) => {
        const aRank = priority.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
        const bRank = priority.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
        return aRank - bRank;
      })
      .slice(0, Math.min(LAYOUT.length, projects.length));
  }, [projects]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const pin = pinRef.current;
      if (!section || !pin) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isCompact = window.innerWidth < 768;
      const cards = Array.from(section.querySelectorAll<HTMLElement>('.floating-gallery-card'));
      const chromeItems = Array.from(section.querySelectorAll<HTMLElement>('.floating-gallery-kicker, .floating-gallery-side'));
      const title = titleRef.current;
      const ribbon = ribbonRef.current;

      gsap.set(chromeItems, { opacity: 0, y: 18 });
      gsap.set(title, { opacity: 0 });
      gsap.set(cards, { opacity: 0, y: 90, scale: 0.9 });

      if (reducedMotion || isCompact) {
        gsap.set(chromeItems, { opacity: 1, y: 0 });
        gsap.set(title, { opacity: 1 });
        gsap.set(ribbon, { opacity: 0 });
        gsap.set(cards, { opacity: isCompact ? 0.64 : 1, y: 0, scale: 1 });
        return;
      }

      const enter = gsap.timeline({
        defaults: { ease: 'power4.out' },
        scrollTrigger: {
          trigger: section,
          start: 'top 76%',
          once: true,
        },
      });

      enter
        .to(chromeItems, { opacity: 1, y: 0, duration: 0.72, stagger: 0.08 })
        .to(ribbon, { opacity: 1, duration: 0.48 }, '-=0.54');

      const updateGallery = (progress: number) => {
        section.style.setProperty('--floating-progress', progress.toFixed(3));

        const count = String(
          Math.round(GALLERY_COUNTER_BASE + progress * GALLERY_COUNTER_RANGE),
        ).padStart(2, '0');
        if (counterRef.current) {
          counterRef.current.textContent = count;
        }
        if (leftCounterRef.current) {
          leftCounterRef.current.textContent = count;
        }

        if (railFillRef.current) {
          railFillRef.current.style.transform = `scaleY(${Math.max(0.035, progress)})`;
        }

        if (ribbon) {
          const ribbonExit = smoothstep((progress - 0.08) / 0.28);
          const ribbonOpacity = 1 - ribbonExit;
          const ribbonX = -70 - progress * 340;
          const ribbonY = -18 - ribbonExit * 500;
          const ribbonScale = 1.07 - progress * 0.1;
          ribbon.style.opacity = (ribbonOpacity * 0.98).toFixed(3);
          ribbon.style.transform = `translate3d(${ribbonX.toFixed(1)}px, ${ribbonY.toFixed(1)}px, 0) rotate(${(-4 - progress * 5).toFixed(2)}deg) scale(${ribbonScale.toFixed(3)})`;
        }

        if (title) {
          const revealIn = smoothstep((progress - 0.3) / 0.18);
          const revealOut = 1 - smoothstep((progress - 0.94) / 0.08);
          const reveal = revealIn * revealOut;
          const breathe = Math.sin(progress * Math.PI * 2) * 3;
          title.style.opacity = reveal.toFixed(3);
          title.style.setProperty('--floating-title-y', `${(24 - reveal * 24 + breathe).toFixed(2)}px`);
          title.style.setProperty('--floating-title-scale', `${(0.94 + reveal * 0.06).toFixed(3)}`);
        }

        cards.forEach((card, index) => {
          const layout = LAYOUT[index % LAYOUT.length];
          const span = layout.end - layout.start;
          const local = clamp01((progress - layout.start) / span);
          const gateIn = smoothstep((progress - layout.start) / 0.08);
          const gateOut = 1 - smoothstep((progress - layout.end) / 0.1);
          const visible = gateIn * gateOut;
          const enterT = smoothstep(local / 0.18);
          const orbitT = smoothstep((local - 0.12) / 0.7);
          const exitT = smoothstep((local - 0.84) / 0.16);
          const angle = layout.angle + orbitT * layout.turn * Math.PI * 1.86;
          const orbitX = Math.cos(angle) * layout.radiusX;
          const orbitY = Math.sin(angle) * layout.radiusY + layout.lift;
          const pullX = lerp(layout.entryX, orbitX, enterT);
          const pullY = lerp(layout.entryY, orbitY, enterT);
          const targetX = lerp(pullX, layout.exitX, exitT) * 0.88;
          const targetY = lerp(pullY, layout.exitY, exitT) * 0.84;
          const wave = Math.sin(progress * Math.PI * 4 + index * 0.74);
          const pinWidth = pin.clientWidth;
          const pinHeight = pin.clientHeight;
          const anchorX = (parseFloat(layout.left) / 100) * pinWidth;
          const anchorY = (parseFloat(layout.top) / 100) * pinHeight;
          const cardWidth = card.offsetWidth;
          const cardHeight = card.offsetHeight;
          const translateX = pinWidth / 2 + targetX - anchorX - cardWidth / 2;
          const translateY = pinHeight / 2 + targetY - anchorY - cardHeight / 2;
          const frontness = (Math.sin(angle) + 1) / 2;
          const scale =
            lerp(0.58, 0.82 + layout.depth * 0.08 + frontness * 0.1, enterT) *
            (1 - exitT * 0.08);
          const z = lerp(-260, -64 + layout.depth * 72 + frontness * 118, enterT) - exitT * 108;
          const rotate =
            layout.rotate +
            Math.sin(angle) * (1.4 + layout.depth * 1.4) +
            orbitT * layout.turn * 5 +
            exitT * layout.turn * 3;
          const mediaRy =
            Math.cos(angle) * (5 + layout.depth * 4) +
            lerp(layout.entryX > 0 ? 4 : -4, layout.exitX > 0 ? -4 : 4, exitT) * (1 - orbitT);
          const mediaRx = -1 + frontness * 3 + wave * 0.55;
          const titleCrossing = 1 - smoothstep((Math.hypot(targetX / 430, targetY / 245) - 0.58) / 0.78);
          const titleDim = lerp(1, 0.62 + frontness * 0.16, titleCrossing);
          const imageWeight = card.dataset.imageType === 'og-poster' ? 0.72 : 1;
          const opacity =
            visible * Math.min(1, 0.56 + layout.depth * 0.12 + frontness * 0.22) * titleDim * imageWeight;

          card.style.zIndex = String(layout.z);
          card.style.setProperty('--fg-media-rx', `${mediaRx.toFixed(2)}deg`);
          card.style.setProperty('--fg-media-ry', `${mediaRy.toFixed(2)}deg`);
          card.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, ${z.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          card.style.opacity = opacity.toFixed(3);
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=4300',
        pin,
        scrub: 1.08,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateGallery(self.progress);
        },
      });

      updateGallery(0);
      ScrollTrigger.refresh();

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [galleryProjects.length] },
  );

  return (
    <section
      ref={sectionRef}
      id="floating-gallery"
      className="floating-gallery-section relative bg-[#030303]"
      aria-label="Project gallery"
    >
      <div ref={pinRef} className="floating-gallery-pin relative min-h-[100svh] overflow-hidden">
        <div className="floating-gallery-noise" aria-hidden />
        <div className="floating-gallery-vignette" aria-hidden />
        <div ref={ribbonRef} className="floating-gallery-ribbon" aria-hidden>
          <svg viewBox="0 0 1440 960" preserveAspectRatio="none">
            <path d="M -160 -70 C 112 210 300 472 592 488 C 846 502 944 274 1188 252 C 1354 237 1516 286 1624 326" />
          </svg>
        </div>

        <span className="floating-gallery-kicker" aria-hidden>
          (<span ref={leftCounterRef}>{GALLERY_COUNTER_BASE}</span>)
        </span>

        <div ref={titleRef} className="floating-gallery-title pointer-events-none absolute inset-x-0 top-1/2 z-20 mx-auto px-6 text-center">
          <h2 className="floating-gallery-title-text mx-auto max-w-6xl font-medium leading-[1.08] tracking-normal text-white">
            Each project is a chance
            <span className="block">
              to <em>learn, experiment</em> and
            </span>
            <span className="block">push my limits.</span>
          </h2>
        </div>

        <div className="floating-gallery-side">
          <div className="floating-gallery-side__rail" aria-hidden>
            <span ref={railFillRef} />
          </div>
          <span className="floating-gallery-side__label">Gallery</span>
          <span ref={counterRef} className="floating-gallery-side__count">
            {GALLERY_COUNTER_BASE}
          </span>
        </div>

        <div className="floating-gallery-cloud">
          {galleryProjects.map((project, index) => {
            const image = getProjectImage(project.slug, project.name);
            const layout = LAYOUT[index % LAYOUT.length];

            return (
              <button
                key={project.slug}
                type="button"
                className="floating-gallery-card group"
                data-image-type={image.type}
                onClick={() => open(project.slug)}
                style={
                  {
                    '--fg-left': layout.left,
                    '--fg-top': layout.top,
                    '--fg-width': layout.width,
                    '--fg-aspect': layout.aspect,
                    '--fg-z': String(layout.z),
                    '--fg-rotate': `${layout.rotate}deg`,
                    '--fg-depth': String(layout.depth),
                  } as CSSProperties
                }
                aria-label={`Open ${project.name} case study`}
              >
                <span className="floating-gallery-card__media">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 24vw, 54vw"
                    className={image.type === 'og-poster' ? 'object-contain' : 'object-cover'}
                    priority={index < 4}
                    unoptimized={
                      image.src.startsWith('/api/og') ||
                      image.src.startsWith('https://raw.githubusercontent.com')
                    }
                  />
                </span>
                <span className="floating-gallery-card__caption">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {project.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="sr-only">
          Gallery contains {stats.totalRepos} public repositories and {stats.liveDemos} live demos.
        </p>
      </div>
    </section>
  );
}
