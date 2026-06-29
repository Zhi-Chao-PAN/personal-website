'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Project } from '@/lib/projects.types';
import { ProjectCard } from './project-card';
import { SectionHeading } from './section-heading';

interface ProjectsSectionProps {
  projects: Project[];
  stats: {
    totalRepos: number;
    totalStars: number;
    liveDemos: number;
  };
}

/**
 * Projects showcase — the second scroll section.
 * SectionHeading animates its own chars; cards stagger in via ScrollTrigger
 * (once: true, fires when the section enters viewport).
 */
export function ProjectsSection({ projects, stats }: ProjectsSectionProps) {
  const container = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial state: cards hidden & nudged down
    gsap.set('.project-card', { opacity: 0, y: 28 });

    // ScrollTrigger — single trigger for the whole grid
    const trigger = ScrollTrigger.create({
      trigger: container.current,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to('.project-card', {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.06,
        });
      },
    });

    return () => trigger.kill();
  }, { scope: container });

  const subtitle = `[ ${stats.totalRepos}_PUBLIC_REPOS · ${stats.liveDemos}_LIVE_DEMOS · ${stats.totalStars}_STARS_TOTAL ]`;

  return (
    <section
      ref={container}
      id="projects"
      className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-[#030303]"
    >
      {/* Faint background grid (full-bleed) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '4vw 4vw',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeading
          label="[ INDEX_02 — PROJECTS ]"
          title="What I've Shipped"
          subtitle={subtitle}
        />

        <div
          ref={grid}
          className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {projects.map((project) => (
            <div key={project.slug} className="project-card">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-16 text-center font-mono text-xs text-zinc-600 tracking-[0.3em] uppercase">
          <span className="opacity-50">[ end_of_index ]</span>
        </div>
      </div>
    </section>
  );
}
