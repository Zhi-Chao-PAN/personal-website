'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import type { Project } from '@/lib/projects.types';
import { getProjectDetail } from '@/lib/project-details';
import { ProjectCaseStudy, SectionLabel } from './project-case-study';
import { useProjectModal } from './modal-provider';

interface ProjectModalProps {
  projects: Project[];
}

export function ProjectModal({ projects }: ProjectModalProps) {
  const { openSlug, open, close } = useProjectModal();
  const project = openSlug ? projects.find((p) => p.slug === openSlug) ?? null : null;
  const detail = openSlug ? getProjectDetail(openSlug) ?? null : null;
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = project !== null;

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Animate modal content on open
  useGSAP(() => {
    if (!isOpen || !project || !panelRef.current) return;
    const split = new SplitType('.modal-title', { types: 'chars,words' });
    gsap.set(split.words, { overflow: 'hidden' });
    gsap.set(split.chars, { yPercent: 100 });
    gsap.set('.modal-section', { opacity: 0, y: 12 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(split.chars, { yPercent: 0, duration: 0.7, stagger: 0.015, ease: 'expo.out' })
      .to('.modal-section', { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, '-=0.4');

    return () => split.revert();
  }, { scope: panelRef, dependencies: [isOpen, project?.slug] });

  if (!isOpen || !project) return null;

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div
      className="ll-modal-backdrop fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        key={project.slug}
        ref={panelRef}
        className="ll-modal-panel relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 my-auto"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            <span className="text-zinc-700">[</span>
            <span>case file</span>
            <span className="text-zinc-700">]</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400">{project.slug}</span>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close modal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2L12 12M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-8 space-y-8">
          {/* Header */}
          <header className="space-y-3 modal-section">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: project.languageColor }}
              />
              <span>{project.language.toLowerCase()}</span>
              {project.license ? (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>{project.license}</span>
                </>
              ) : null}
              {project.featured ? (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-emerald-400/80">● live</span>
                </>
              ) : null}
            </div>
            <h2 id="modal-title" className="modal-title text-3xl md:text-5xl font-black text-white tracking-tighter leading-[0.95]">
              {project.name}
            </h2>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 tracking-wider">
              {project.stars > 0 ? (
                <>
                  <span>★ {project.stars}</span>
                  <span className="text-zinc-700">·</span>
                </>
              ) : null}
              <span>{project.ageInDays}d old</span>
              <span className="text-zinc-700">·</span>
              <span>pushed {project.pushedRelative}</span>
            </div>
            <p className="max-w-2xl text-zinc-300 text-base md:text-lg leading-relaxed">
              {project.pitchZh ?? project.tagline}
            </p>
          </header>

          {/* Tagged */}
          {project.topics.length > 0 ? (
            <section className="modal-section">
              <SectionLabel>tagged</SectionLabel>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.topics.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 border border-white/10 bg-white/[0.02] rounded-md px-2 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <ProjectCaseStudy
            project={project}
            detail={detail}
            className="space-y-8"
            sectionClassName="modal-section"
          />

          {/* References */}
          {project.references && project.references.length > 0 ? (
            <section className="modal-section">
              <SectionLabel>related</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.references.map((refSlug) => {
                  const ref = projects.find((p) => p.slug === refSlug);
                  if (!ref) return null;
                  return (
                    <button
                      key={refSlug}
                      onClick={() => open(refSlug)}
                      className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 border border-white/10 bg-white/[0.02] rounded-md px-3 py-1.5 hover:border-emerald-400/40 hover:text-emerald-300 transition-colors"
                    >
                      ↔ {ref.name}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 px-6 md:px-8 py-5 border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm rounded-b-2xl flex items-center gap-3">
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300 border border-emerald-400/30 hover:border-emerald-400/60 bg-emerald-400/5 hover:bg-emerald-400/10 rounded-md py-2.5 transition-colors"
            >
              <span>live demo</span>
              <span aria-hidden>→</span>
            </a>
          ) : null}
          <Link
            href={`/projects/${project.slug}`}
            className="flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-sky-300 hover:text-sky-200 border border-sky-300/20 hover:border-sky-300/50 bg-sky-300/[0.04] hover:bg-sky-300/[0.08] rounded-md py-2.5 transition-colors"
          >
            <span>case page</span>
            <span aria-hidden>↗</span>
          </Link>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-white border border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] rounded-md py-2.5 transition-colors"
          >
            <span>github repo</span>
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
