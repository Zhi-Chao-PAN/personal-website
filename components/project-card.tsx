'use client';

import type { Project } from '@/lib/projects.types';

interface ProjectCardProps {
  project: Project;
}

/**
 * Project card — matches the Digital Lab dark aesthetic.
 * Hover: subtle lift (-translate-y-0.5), border brightens, background grid fades in.
 * Respects prefers-reduced-motion.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const { name, tagline, language, languageColor, stars, topics, githubUrl, demoUrl, featured } = project;

  return (
    <article
      className="group relative flex flex-col gap-4 p-6 md:p-7 rounded-xl border border-white/5 bg-[#0a0a0a] transition-all duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/15 motion-safe:hover:bg-[#0e0e10] overflow-hidden"
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

      {/* Featured ribbon (top-right) */}
      {featured ? (
        <span className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.25em] text-emerald-400/80 uppercase">
          ● live
        </span>
      ) : null}

      {/* Top row: language dot + slug + stars */}
      <div className="relative flex items-center gap-2.5 font-mono text-[11px] text-zinc-500 tracking-wider">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: languageColor }}
          aria-label={language}
        />
        <span className="truncate">{language.toLowerCase()}</span>
        <span className="text-zinc-700">/</span>
        {stars > 0 ? (
          <span className="flex items-center gap-1 text-zinc-400">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor" aria-hidden>
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
            </svg>
            {stars}
          </span>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="relative text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
        {name}
      </h3>

      {/* Tagline */}
      <p className="relative text-sm text-zinc-400 leading-relaxed line-clamp-3 min-h-[3.75rem]">
        {tagline}
      </p>

      {/* Topics */}
      {topics.length > 0 ? (
        <div className="relative flex flex-wrap gap-1.5">
          {topics.map((topic) => (
            <span
              key={topic}
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 border border-white/5 bg-white/[0.02] rounded-md px-2 py-1"
            >
              {topic}
            </span>
          ))}
        </div>
      ) : null}

      {/* Action row */}
      <div className="relative flex items-center gap-5 mt-2 pt-4 border-t border-white/5 font-mono text-[11px] uppercase tracking-[0.2em]">
        {demoUrl ? (
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>live demo</span>
            <span aria-hidden>→</span>
          </a>
        ) : null}
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
        >
          <span>github</span>
          <span aria-hidden>↗</span>
        </a>
      </div>
    </article>
  );
}
