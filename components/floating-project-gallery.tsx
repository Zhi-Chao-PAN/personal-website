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
    width: '13rem',
    aspect: '1.45 / 1',
    rotate: -14,
    depth: 0.88,
    start: 0.18,
    end: 0.66,
    fromX: -250,
    fromY: 28,
    travelX: 360,
    travelY: -152,
    phase: 0.1,
    z: 15,
  },
  {
    left: '14%',
    top: '39%',
    width: '13.4rem',
    aspect: '1.35 / 1',
    rotate: 4,
    depth: 0.82,
    start: 0.26,
    end: 0.82,
    fromX: -330,
    fromY: -36,
    travelX: 520,
    travelY: -108,
    phase: 0.36,
    z: 14,
  },
  {
    left: '33%',
    top: '31%',
    width: '12.4rem',
    aspect: '1.62 / 1',
    rotate: -3,
    depth: 0.72,
    start: 0.34,
    end: 0.86,
    fromX: -120,
    fromY: -108,
    travelX: 220,
    travelY: 24,
    phase: 0.62,
    z: 13,
  },
  {
    left: '52%',
    top: '30%',
    width: '14.2rem',
    aspect: '1.28 / 1',
    rotate: 3,
    depth: 0.78,
    start: 0.38,
    end: 0.92,
    fromX: 110,
    fromY: -118,
    travelX: -74,
    travelY: 86,
    phase: 0.92,
    z: 13,
  },
  {
    left: '75%',
    top: '40%',
    width: '13.4rem',
    aspect: '1.7 / 1',
    rotate: 7,
    depth: 0.86,
    start: 0.32,
    end: 0.9,
    fromX: 330,
    fromY: -12,
    travelX: -350,
    travelY: 14,
    phase: 1.18,
    z: 15,
  },
  {
    left: '94%',
    top: '51%',
    width: '12.2rem',
    aspect: '0.82 / 1',
    rotate: 16,
    depth: 1,
    start: 0.38,
    end: 0.96,
    fromX: 270,
    fromY: -20,
    travelX: -410,
    travelY: 168,
    phase: 1.44,
    z: 16,
  },
  {
    left: '10%',
    top: '77%',
    width: '23rem',
    aspect: '1.78 / 1',
    rotate: -5,
    depth: 1.14,
    start: 0.48,
    end: 1,
    fromX: -430,
    fromY: 320,
    travelX: 730,
    travelY: -250,
    phase: 1.72,
    z: 18,
  },
  {
    left: '58%',
    top: '78%',
    width: '27rem',
    aspect: '1.7 / 1',
    rotate: -3,
    depth: 1.18,
    start: 0.54,
    end: 1,
    fromX: 380,
    fromY: 285,
    travelX: -360,
    travelY: -165,
    phase: 1.98,
    z: 17,
  },
  {
    left: '86%',
    top: '74%',
    width: '16rem',
    aspect: '0.78 / 1',
    rotate: 10,
    depth: 1.06,
    start: 0.5,
    end: 1,
    fromX: 320,
    fromY: 215,
    travelX: -160,
    travelY: -230,
    phase: 2.2,
    z: 16,
  },
  {
    left: '45%',
    top: '78%',
    width: '22rem',
    aspect: '1.45 / 1',
    rotate: 2,
    depth: 1.1,
    start: 0.1,
    end: 0.48,
    fromX: 40,
    fromY: 360,
    travelX: 120,
    travelY: -540,
    phase: 2.54,
    z: 14,
  },
] as const;

const GALLERY_COUNTER_BASE = 42;
const GALLERY_COUNTER_RANGE = 17;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
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

  const galleryProjects = useMemo(() => projects.slice(0, Math.min(10, projects.length)), [projects]);

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
          const eased = smoothstep(local);
          const gateIn = smoothstep((progress - layout.start) / 0.08);
          const gateOut = 1 - smoothstep((progress - layout.end) / 0.1);
          const visible = gateIn * gateOut;
          const direction = index % 2 === 0 ? 1 : -1;
          const wave = progress * Math.PI * 2.2 + layout.phase * Math.PI;
          const driftX =
            layout.fromX +
            layout.travelX * eased +
            Math.sin(wave) * (18 + layout.depth * 22);
          const driftY =
            layout.fromY +
            layout.travelY * eased +
            Math.cos(wave * 0.9) * (14 + layout.depth * 18);
          const rotate = layout.rotate + direction * (local - 0.5) * (16 + layout.depth * 12);
          const scale = 0.82 + layout.depth * 0.22 + visible * 0.08;
          const z = (layout.depth - 1) * 84;
          const opacity = visible * Math.min(1, 0.58 + layout.depth * 0.42);

          card.style.zIndex = String(layout.z);
          card.style.transform = `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, ${z.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          card.style.opacity = opacity.toFixed(3);
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=3300',
        pin,
        scrub: 0.92,
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
                    className="object-cover"
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
