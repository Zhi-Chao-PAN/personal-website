'use client';

import type { ProjectLanguageEntry } from '@/lib/projects.types';

interface ProjectLanguageBarProps {
  languages: ProjectLanguageEntry[];
}

/** GitHub-style stacked language bar, scaled to the card width.
 *  4px tall, segmented by language, percentage labels hidden until hover.
 *  Subtle "lab readout" feel — the bar itself is monochrome, language
 *  colors only appear on hover.
 */
export function ProjectLanguageBar({ languages }: ProjectLanguageBarProps) {
  return (
    <div className="relative group/langbar">
      <div
        className="flex w-full h-[3px] rounded-full overflow-hidden bg-white/[0.04]"
        title={languages.map((l) => `${l.name} ${l.percent}%`).join(' · ')}
      >
        {languages.map((lang) => (
          <div
            key={lang.name}
            className="h-full transition-all duration-300 group-hover/langbar:brightness-125"
            style={{
              width: `${lang.percent}%`,
              backgroundColor: lang.color,
              minWidth: lang.percent > 0 ? '2px' : '0',
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        <span>
          {languages[0]?.name}
          {languages[0] && languages[0].percent < 100 ? ` ${languages[0].percent}%` : ''}
        </span>
        {languages.length > 1 ? (
          <span className="text-zinc-700">
            +{languages.length - 1} {languages.length - 1 === 1 ? 'lang' : 'langs'}
          </span>
        ) : null}
      </div>
    </div>
  );
}
