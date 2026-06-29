'use client';

import { useRef } from 'react';
import type { Project } from '@/lib/projects.types';
import { useProjectModal } from './modal-provider';
import { ProjectStackChips } from './project-stack-chips';
import { ProjectLanguageBar } from './project-language-bar';
import { ProjectHeadlineBox } from './project-headline';
import { ProjectStats } from './project-stats';

interface ProjectCardProps {
  project: Project;
}

/**
 * Project card — matches the Digital Lab dark aesthetic.
 * 8 dimensions of information: language, stack, name+stars, tagline,
 * language breakdown bar, headline metric, topics, repo stats, action row.
 * Hover: subtle lift + border brighten + background grid fade-in.
 * Click anywhere on the card (not on links) → opens the detail modal.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const { open } = useProjectModal();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => open(project.slug);

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
      className="group relative flex flex-col gap-4 p-6 md:p-7 rounded-xl border border-white/5 bg-[#0a0a0a] transition-all duration-300 ease-out cursor-pointer motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/15 motion-safe:hover:bg-[#0e0e10] overflow-hidden focus-visible:outline-none focus-visible:border-emerald-400/50"
    >
      {/* Hover-only background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at top, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 70%)',
        }}
      />

      {/* Top row: LIVE ribbon (if featured) */}
      {project.featured ? (
        <span className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.25em] text-emerald-400/80 uppercase z-10">
          ● live
        </span>
      ) : null}

      {/* Stack chips */}
      <ProjectStackChips stack={project.stack} max={3} />

      {/* Title + stars */}
      <div className="flex items-start gap-3 justify-between">
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
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

      {/* Tagline */}
      <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
        {project.tagline}
      </p>

      {/* Language breakdown bar */}
      <ProjectLanguageBar languages={project.languages} />

      {/* Headline metric (4 of 7 cards) */}
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
              className="flex items-center gap-1.5 text-emerald-400 group-hover:text-emerald-300 transition-colors"
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
            className="flex items-center gap-1.5 text-zinc-500 group-hover:text-white transition-colors"
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
        <span className="text-zinc-600 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
          <span>details</span>
          <span aria-hidden>ⓘ</span>
        </span>
      </div>
    </div>
  );
}
