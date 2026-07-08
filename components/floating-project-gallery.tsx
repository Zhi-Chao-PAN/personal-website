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
    left: '20%',
    top: '76%',
    width: '21rem',
    aspect: '1.78 / 1',
    rotate: -1.6,
    depth: 1.14,
    phase: 0.18,
    span: 0.62,
    x: -530,
    y: 278,
    entryX: -900,
    entryY: 430,
    exitX: 660,
    exitY: -265,
    bendX: -82,
    bendY: -130,
    tilt: 6.8,
    z: 16,
  },
  {
    left: '76%',
    top: '45%',
    width: '13.6rem',
    aspect: '1.58 / 1',
    rotate: 1.2,
    depth: 0.86,
    phase: 0.22,
    span: 0.63,
    x: 520,
    y: -36,
    entryX: 870,
    entryY: 210,
    exitX: -700,
    exitY: 250,
    bendX: 92,
    bendY: -68,
    tilt: -5.8,
    z: 14,
  },
  {
    left: '48%',
    top: '30%',
    width: '12.7rem',
    aspect: '1.62 / 1',
    rotate: -0.9,
    depth: 0.76,
    phase: 0.26,
    span: 0.62,
    x: -155,
    y: -220,
    entryX: -170,
    entryY: -575,
    exitX: 790,
    exitY: 138,
    bendX: -44,
    bendY: 62,
    tilt: 4.2,
    z: 13,
  },
  {
    left: '61%',
    top: '31%',
    width: '13rem',
    aspect: '1.42 / 1',
    rotate: 0.7,
    depth: 0.82,
    phase: 0.3,
    span: 0.62,
    x: 170,
    y: -220,
    entryX: 560,
    entryY: -560,
    exitX: -790,
    exitY: 150,
    bendX: 52,
    bendY: 76,
    tilt: -4.6,
    z: 13,
  },
  {
    left: '91%',
    top: '52%',
    width: '10.8rem',
    aspect: '0.78 / 1',
    rotate: 1.6,
    depth: 0.98,
    phase: 0.34,
    span: 0.62,
    x: 735,
    y: 72,
    entryX: 925,
    entryY: -120,
    exitX: -850,
    exitY: -116,
    bendX: 68,
    bendY: -42,
    tilt: -8.4,
    z: 15,
  },
  {
    left: '69%',
    top: '79%',
    width: '21.5rem',
    aspect: '1.7 / 1',
    rotate: 1.2,
    depth: 1.18,
    phase: 0.38,
    span: 0.63,
    x: 430,
    y: 292,
    entryX: 800,
    entryY: 520,
    exitX: -590,
    exitY: -382,
    bendX: 82,
    bendY: -118,
    tilt: -6.2,
    z: 17,
  },
  {
    left: '9%',
    top: '58%',
    width: '10.8rem',
    aspect: '0.78 / 1',
    rotate: -1.2,
    depth: 0.94,
    phase: 0.42,
    span: 0.62,
    x: -735,
    y: 94,
    entryX: -940,
    entryY: 125,
    exitX: 810,
    exitY: -96,
    bendX: -72,
    bendY: 34,
    tilt: 8.2,
    z: 15,
  },
  {
    left: '27%',
    top: '42%',
    width: '13.5rem',
    aspect: '1.45 / 1',
    rotate: -1.1,
    depth: 0.88,
    phase: 0.46,
    span: 0.6,
    x: -488,
    y: -110,
    entryX: -720,
    entryY: -286,
    exitX: 690,
    exitY: 278,
    bendX: -58,
    bendY: 82,
    tilt: 5.6,
    z: 14,
  },
  {
    left: '48%',
    top: '90%',
    width: '24rem',
    aspect: '1.72 / 1',
    rotate: -0.6,
    depth: 1.22,
    phase: 0.5,
    span: 0.58,
    x: -18,
    y: 430,
    entryX: 80,
    entryY: 680,
    exitX: 555,
    exitY: -455,
    bendX: -74,
    bendY: -120,
    tilt: 4.8,
    z: 18,
  },
  {
    left: '52%',
    top: '15%',
    width: '15rem',
    aspect: '1.45 / 1',
    rotate: 1,
    depth: 0.8,
    phase: 0.54,
    span: 0.56,
    x: 98,
    y: -360,
    entryX: 82,
    entryY: -650,
    exitX: -620,
    exitY: 360,
    bendX: 50,
    bendY: 112,
    tilt: -5.4,
    z: 12,
  },
] as const;

const GALLERY_COUNTER_BASE = 42;
const GALLERY_COUNTER_RANGE = 17;
const GALLERY_PROJECT_PRIORITY = [
  'launchlens-ai',
  'launchlens-research-studio',
  'model-eval-studio',
  'ai-life-progress-coach',
  'vision-centric-financial-swarm',
  'safety-critical-battery-prognostics',
  'deepnerve-3d',
  'codex-zcode-remote-relay',
  'structure-aware-rag-empirical',
  'CampusTradeAI',
] as const;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

function easeInOutCubic(value: number) {
  const x = clamp01(value);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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

      if (reducedMotion || isCompact) {
        gsap.set(chromeItems, { opacity: 1, y: 0 });
        gsap.set(title, { opacity: 1 });
        gsap.set(ribbon, { opacity: 0 });
        cards.forEach((card, index) => {
          const layout = LAYOUT[index % LAYOUT.length];
          card.style.opacity = String(isCompact ? 0.58 : 1);
          card.style.transform = `translate(-50%, -50%) rotate(${layout.rotate}deg) scale(${isCompact ? 0.86 : 1})`;
        });
        return;
      }

      gsap.set(cards, { opacity: 0 });

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
          const ribbonExit = smoothstep((progress - 0.12) / 0.24);
          const ribbonOpacity = (1 - ribbonExit) * 0.62;
          const ribbonX = -92 - progress * 300;
          const ribbonY = -26 - ribbonExit * 470;
          const ribbonScale = 1.08 - progress * 0.08;
          ribbon.style.opacity = ribbonOpacity.toFixed(3);
          ribbon.style.transform = `translate3d(${ribbonX.toFixed(1)}px, ${ribbonY.toFixed(1)}px, 0) rotate(${(-3.5 - progress * 2.4).toFixed(2)}deg) scale(${ribbonScale.toFixed(3)})`;
        }

        if (title) {
          const revealIn = smoothstep((progress - 0.34) / 0.16);
          const revealOut = 1 - smoothstep((progress - 0.97) / 0.06);
          const reveal = revealIn * revealOut;
          const focus = smoothstep((progress - 0.41) / 0.1);
          const breathe = Math.sin(progress * Math.PI * 1.6) * 2.2;
          const blur = (1 - focus) * reveal * 4.2 + smoothstep((progress - 0.92) / 0.08) * 1.7;
          title.style.opacity = reveal.toFixed(3);
          title.style.setProperty('--floating-title-y', `${(24 - reveal * 24 + breathe).toFixed(2)}px`);
          title.style.setProperty('--floating-title-scale', `${(0.965 + reveal * 0.035).toFixed(3)}`);
          title.style.setProperty('--floating-title-blur', `${blur.toFixed(2)}px`);
        }

        const pinWidth = pin.clientWidth;
        const pinHeight = pin.clientHeight;
        const viewportScale = Math.min(1, Math.max(0.72, pinWidth / 1600));
        const sweep = smoothstep((progress - 0.16) / 0.78);
        const cameraX = lerp(-48, 54, sweep) + Math.sin(progress * Math.PI * 1.15) * 18;
        const cameraY = lerp(82, -72, sweep);

        cards.forEach((card, index) => {
          const layout = LAYOUT[index % LAYOUT.length];
          const local = clamp01((progress - layout.phase) / layout.span);
          const gateIn = smoothstep((progress - layout.phase) / 0.095);
          const gateOut = 1 - smoothstep((progress - (layout.phase + layout.span * 0.9)) / 0.11);
          const visible = gateIn * gateOut;
          const enterT = easeInOutCubic(Math.min(local * 2, 1));
          const exitT = easeInOutCubic(Math.max(local * 2 - 1, 0));
          const passT = smoothstep(local);
          const nearT = Math.sin(local * Math.PI);
          const travelX =
            local < 0.5
              ? lerp(layout.entryX, layout.x, enterT)
              : lerp(layout.x, layout.exitX, exitT);
          const travelY =
            local < 0.5
              ? lerp(layout.entryY, layout.y, enterT)
              : lerp(layout.y, layout.exitY, exitT);
          const arcX = Math.sin(local * Math.PI) * layout.bendX;
          const arcY = Math.sin(local * Math.PI * 1.08) * layout.bendY;
          const targetX = (travelX + arcX + cameraX * (0.5 + layout.depth * 0.24)) * viewportScale;
          const targetY = (travelY + arcY + cameraY * (0.55 + layout.depth * 0.18)) * viewportScale;
          const anchorX = (parseFloat(layout.left) / 100) * pinWidth;
          const anchorY = (parseFloat(layout.top) / 100) * pinHeight;
          const translateX = pinWidth / 2 + targetX - anchorX;
          const translateY = pinHeight / 2 + targetY - anchorY;
          const scale =
            lerp(0.58, 0.88 + layout.depth * 0.12, nearT) *
            (1 - exitT * 0.1);
          const z = lerp(-520, -105 + layout.depth * 156, nearT) - exitT * 170;
          const rotate =
            layout.rotate +
            Math.sin((passT + index * 0.07) * Math.PI * 2) * 1.35 +
            lerp(layout.entryX > layout.x ? 1.2 : -1.2, layout.exitX > layout.x ? 1.1 : -1.1, exitT);
          const mediaRy =
            lerp(layout.tilt, -layout.tilt * 0.72, passT) +
            Math.sin(progress * Math.PI * 1.8 + index) * 0.7;
          const mediaRx =
            lerp(2.2, -1.6, passT) +
            Math.cos(progress * Math.PI * 1.35 + index * 0.4) * 0.45;
          const titleCrossing =
            1 - smoothstep((Math.hypot(targetX / 460, targetY / 260) - 0.62) / 0.6);
          const imageWeight = card.dataset.imageType === 'og-poster' ? 0.95 : 1;
          const titleDim = lerp(1, 0.84, titleCrossing);
          const blur = Math.max(0, lerp(2.3, 0.05, nearT) + exitT * 0.9 - layout.depth * 0.28);
          const opacity =
            visible * Math.min(1, 0.78 + layout.depth * 0.18) * titleDim * imageWeight;

          card.style.zIndex = String(layout.z);
          card.style.setProperty('--fg-card-blur', `${blur.toFixed(2)}px`);
          card.style.setProperty('--fg-media-rx', `${mediaRx.toFixed(2)}deg`);
          card.style.setProperty('--fg-media-ry', `${mediaRy.toFixed(2)}deg`);
          card.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, ${z.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)}) translate(-50%, -50%)`;
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
