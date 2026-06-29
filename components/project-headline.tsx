'use client';

import type { ProjectHeadline as Headline } from '@/lib/projects.types';

interface ProjectHeadlineProps {
  headline: Headline;
}

/** Terminal-style "key figure" box. Renders nothing if headline is null. */
export function ProjectHeadlineBox({ headline }: ProjectHeadlineProps) {
  return (
    <div className="relative border border-white/10 bg-white/[0.02] rounded-md px-3 py-2.5 flex items-baseline gap-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600 shrink-0">
        {headline.label}
      </div>
      <div className="font-mono text-base md:text-lg font-black text-white tracking-tight truncate">
        {headline.value}
      </div>
      {/* Corner tick — lab readout feel */}
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-emerald-400/40" />
    </div>
  );
}
