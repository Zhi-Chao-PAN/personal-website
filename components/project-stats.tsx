'use client';

interface ProjectStatsProps {
  sizeHuman: string;
  commits: number;
  pushedRelative: string;
  ageInDays: number;
  license: string | null;
}

/** Bottom row of stats — size + commit dot matrix + recency + age + license.
 *  Lab-readout feel: each metric monospace, separated by `·`.
 */
export function ProjectStats({
  sizeHuman,
  commits,
  pushedRelative,
  ageInDays,
  license,
}: ProjectStatsProps) {
  return (
    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 tracking-wider">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-zinc-400">{sizeHuman}</span>
        <span className="text-zinc-700">·</span>
        <span className="flex items-center gap-1.5">
          <span className="text-zinc-400">{commits || '—'}</span>
          <CommitMatrix count={commits} />
        </span>
        <span className="text-zinc-700">·</span>
        <span className="text-zinc-500">{pushedRelative}</span>
        {license ? (
          <>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600 uppercase">{license}</span>
          </>
        ) : null}
      </div>
      <span className="text-zinc-700 shrink-0">
        {ageInDays}d old
      </span>
    </div>
  );
}

/** Commit dot matrix — visualizes commit count as a row of fading dots.
 *  Up to 30 dots, last one is always solid.
 */
function CommitMatrix({ count }: { count: number }) {
  if (!count || count <= 0) return null;
  const displayed = Math.min(count, 30);
  const dots = Array.from({ length: displayed }, (_, i) => i);
  return (
    <span className="inline-flex items-center gap-px" aria-hidden>
      {dots.map((i) => {
        // Fade from oldest (left) to newest (right)
        const opacity = 0.3 + 0.7 * (i / Math.max(1, displayed - 1));
        return (
          <span
            key={i}
            className="inline-block w-[3px] h-[3px] rounded-[0.5px]"
            style={{ backgroundColor: `rgba(255,255,255,${opacity})` }}
          />
        );
      })}
      {count > 30 ? <span className="text-zinc-700 ml-1">+{count - 30}</span> : null}
    </span>
  );
}
