'use client';

import type { ProjectStackEntry } from '@/lib/projects.types';

interface ProjectStackChipsProps {
  stack: ProjectStackEntry[];
  /** Max number of chips to show (default 3). */
  max?: number;
}

/** Stack chips — read top dependencies from package.json / pyproject. */
export function ProjectStackChips({ stack, max = 3 }: ProjectStackChipsProps) {
  const visible = stack.slice(0, max);
  if (visible.length === 0) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-700 border border-white/5 bg-white/[0.01] rounded-md px-2 py-1">
          no manifest
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {visible.map((entry, i) => (
        <span
          key={entry.name}
          className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 border border-white/10 bg-white/[0.02] rounded-md px-2 py-1"
        >
          {entry.name}
        </span>
      ))}
      {stack.length > max ? (
        <span className="font-mono text-[10px] text-zinc-600">+{stack.length - max}</span>
      ) : null}
    </div>
  );
}
