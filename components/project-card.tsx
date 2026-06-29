'use client';

import { useRef } from 'react';
import type { Project } from '@/lib/projects.types';
import { getProjectImage } from '@/lib/project-image';
import { useProjectModal } from './modal-provider';
import { ProjectImage } from './project-image';
import { ProjectStackChips } from './project-stack-chips';
import { ProjectLanguageBar } from './project-language-bar';
import { ProjectHeadlineBox } from './project-headline';
import { ProjectStats } from './project-stats';

interface ProjectCardProps {
  project: Project;
  /** First 4 cards get `priority` so they don't lazy-load above the fold. */
  priorityImage?: boolean;
  /**
   * `compact` mode compresses the card for the horizontal pin-scroll canvas
   * (projects-section) so it fits inside 100vh alongside the static title +
   * SCROLL hint. Modal detail still uses the full layout.
   */
  compact?: boolean;
}

/**
 * Project card — top section is a 16:9 screenshot/OG poster; bottom
 * section preserves the 8-dimension text density (stack / title / tagline /
 * language bar / headline / topics / stats / actions). The whole card is
 * clickable → opens the detail modal.
 */
export function ProjectCard({ project, priorityImage = false, compact = false }: ProjectCardProps) {
  const { open } = useProjectModal();
  const cardRef = useRef<HTMLDivElement>(null);
  const image = getProjectImage(project.slug, project.name);

  const handleOpen = () => open(project.slug);

  // Compact = horizontal canvas (projects-section). Tighter padding & gaps,
  // shorter title, single-line tagline, 2-line Chinese pitch.
  const shellCls = compact
    ? 'group/card relative flex flex-col gap-3 p-3 md:p-4 rounded-xl border border-white/5 bg-[#0a0a0a] transition-all duration-300 ease-out cursor-pointer motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/15 motion-safe:hover:bg-[#0e0e10] overflow-hidden focus-visible:outline-none focus-visible:border-emerald-400/50 h-full'
    : 'group/card relative flex flex-col gap-5 p-4 md:p-5 rounded-xl border border-white/5 bg-[#0a0a0a] transition-all duration-300 ease-out cursor-pointer motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/15 motion-safe:hover:bg-[#0e0e10] overflow-hidden focus-visible:outline-none focus-visible:border-emerald-400/50';

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      className={shellCls}
    >
      {/* Hover-only background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at top, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 70%)',
        }}
      />

      {/* Top: cover image */}
      <div className="relative z-10">
        <ProjectImage image={image} priority={priorityImage} />
      </div>

      {/* Bottom: 8-dimension info block */}
      <div className={compact ? 'relative z-10 flex flex-col gap-2.5' : 'relative z-10 flex flex-col gap-4'}>
        {/* Top row: stack chips + live ribbon */}
        <div className="flex items-start justify-between gap-3">
          <ProjectStackChips stack={project.stack} max={3} />
          {project.featured ? (
            <span className="font-mono text-[9px] tracking-[0.25em] text-emerald-400/80 uppercase shrink-0">
              ● live
            </span>
          ) : null}
        </div>

        {/* Title + stars */}
        <div className="flex items-start gap-3 justify-between">
          <h3 className={compact
            ? 'text-lg md:text-xl font-black text-white tracking-tight leading-tight'
            : 'text-xl md:text-2xl font-black text-white tracking-tight leading-tight'
          }>
            {project.name}
          </h3>
          {project.stars > 0 ? (
            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-400 shrink-0 mt-1">
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor" aria-hidden>
                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
              </svg>
              {project.stars}
            </span>
          ) : null}
        </div>

        {/* Tagline (EN) */}
        <p className={compact
          ? 'text-[13px] text-zinc-400 leading-snug line-clamp-1'
          : 'text-sm text-zinc-400 leading-relaxed line-clamp-2'
        }>
          {project.tagline}
        </p>

        {/* Chinese elevator pitch — written for non-technical visitors
            (investors, recruiters, friends). Visually distinct: emerald
            left accent + lighter text. Renders only when pitchZh is set. */}
        {project.pitchZh ? (
          <div className="relative pl-3 -mt-1">
            <span
              aria-hidden
              className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-emerald-400/60"
            />
            <p className={compact
              ? 'text-[12px] leading-snug text-zinc-300/90 line-clamp-2'
              : 'text-[13px] leading-relaxed text-zinc-300/90 line-clamp-5'
            }>
              {project.pitchZh}
            </p>
          </div>
        ) : null}

        {/* Language breakdown bar */}
        <ProjectLanguageBar languages={project.languages} />

        {/* Headline metric (6 of 7 cards) */}
        {project.headline ? <ProjectHeadlineBox headline={project.headline} /> : null}

        {/* Topics tags */}
        {project.topics.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.topics.map((topic) => (
              <span
                key={topic}
                className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 border border-white/5 bg-white/[0.02] rounded-md px-2 py-1"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : null}

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* Repo stats */}
        <ProjectStats
          sizeHuman={project.sizeHuman}
          commits={project.commits}
          pushedRelative={project.pushedRelative}
          ageInDays={project.ageInDays}
          license={project.license}
        />

        {/* Action row */}
        <div className="flex items-center justify-between gap-3 mt-1 font-mono text-[11px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-4">
            {project.demoUrl ? (
              <span
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-emerald-400 group-hover/card:text-emerald-300 transition-colors"
              >
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <span>live</span>
                  <span aria-hidden>→</span>
                </a>
              </span>
            ) : null}
            <span
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-zinc-500 group-hover/card:text-white transition-colors"
            >
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5"
              >
                <span>github</span>
                <span aria-hidden>↗</span>
              </a>
            </span>
          </div>
          <span className="text-zinc-600 group-hover/card:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span>details</span>
            <span aria-hidden>ⓘ</span>
          </span>
        </div>
      </div>
    </div>
  );
}
