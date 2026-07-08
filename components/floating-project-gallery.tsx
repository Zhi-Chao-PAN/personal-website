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
  { left: '12%', top: '40%', width: '13rem', rotate: -12, depth: 0.9, y: -190, x: -90 },
  { left: '30%', top: '22%', width: '13.5rem', rotate: 4, depth: 0.58, y: -120, x: -50 },
  { left: '49%', top: '20%', width: '13rem', rotate: -2, depth: 0.72, y: -160, x: 44 },
  { left: '68%', top: '29%', width: '13.2rem', rotate: 6, depth: 0.64, y: -110, x: 72 },
  { left: '84%', top: '46%', width: '12.4rem', rotate: 12, depth: 0.92, y: -70, x: 118 },
  { left: '18%', top: '70%', width: '15rem', rotate: 8, depth: 1.04, y: 150, x: -130 },
  { left: '43%', top: '78%', width: '21rem', rotate: -4, depth: 1.12, y: 170, x: 24 },
  { left: '78%', top: '72%', width: '17rem', rotate: -7, depth: 0.98, y: 135, x: 96 },
  { left: '6%', top: '62%', width: '10.5rem', rotate: -18, depth: 0.82, y: 75, x: -70 },
  { left: '91%', top: '78%', width: '13rem', rotate: 2, depth: 1.08, y: 205, x: 150 },
] as const;

const GALLERY_COUNTER_BASE = 53;
const GALLERY_COUNTER_RANGE = 8;

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
      const introItems = Array.from(section.querySelectorAll<HTMLElement>('.floating-gallery-kicker, .floating-gallery-title, .floating-gallery-side'));

      gsap.set(introItems, { opacity: 0, y: 18 });
      gsap.set(cards, { opacity: 0, y: 90, scale: 0.9 });

      if (reducedMotion || isCompact) {
        gsap.set(introItems, { opacity: 1, y: 0 });
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
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
        .to(introItems, { opacity: 1, y: 0, duration: 0.72, stagger: 0.08 })
        .to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.045, ease: 'expo.out' }, '-=0.48');

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=2600',
        pin,
        scrub: 0.78,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
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
            railFillRef.current.style.transform = `scaleY(${Math.max(0.04, progress)})`;
          }

          cards.forEach((card, index) => {
            const layout = LAYOUT[index % LAYOUT.length];
            const direction = index % 2 === 0 ? 1 : -1;
            const phase = progress * Math.PI * 2 + index * 0.52;
            const driftX = layout.x + Math.sin(phase) * (20 + layout.depth * 26);
            const driftY = layout.y + (progress - 0.5) * (520 + layout.depth * 380);
            const rotate = layout.rotate + direction * (progress - 0.5) * (18 + layout.depth * 16);
            const scale = 0.82 + layout.depth * 0.22 + Math.cos(phase) * 0.025;
            const opacity = Math.min(1, 0.56 + layout.depth * 0.42);

            card.style.transform = `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
            card.style.opacity = opacity.toFixed(3);
          });
        },
      });

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

        <span className="floating-gallery-kicker" aria-hidden>
          (<span ref={leftCounterRef}>{GALLERY_COUNTER_BASE}</span>)
        </span>

        <div className="floating-gallery-title pointer-events-none absolute inset-x-0 top-1/2 z-20 mx-auto -translate-y-1/2 px-6 text-center">
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

        <div className="floating-gallery-footer">
          <span>{stats.totalRepos} public repos</span>
          <span>{stats.liveDemos} live demos</span>
          <span>scroll to orbit the work</span>
        </div>
      </div>
    </section>
  );
}
