'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { ProjectDetail } from '@/lib/project-details';
import { getProjectImage } from '@/lib/project-image';
import type { Project } from '@/lib/projects.types';

gsap.registerPlugin(ScrollTrigger);

interface SignatureCase {
  project: Project;
  detail: ProjectDetail | null;
}

interface SignatureProjectsStageProps {
  cases: SignatureCase[];
}

const CASE_ACCENTS: Record<
  string,
  { axis: string; signal: string; proof: string; tone: string; impact: string }
> = {
  'launchlens-ai': {
    axis: 'AI product engineering',
    signal: 'from fuzzy idea to GTM brief',
    proof: 'structured workflow',
    tone: '#38bdf8',
    impact: '把市场调研、用户画像、竞品拆解和定位交付压进一条可复用的产品工作流。',
  },
  'vision-centric-financial-swarm': {
    axis: 'multimodal financial RAG',
    signal: 'PDF pages as visual evidence',
    proof: 'ColPali + ROI + agents',
    tone: '#6ee7b7',
    impact: '让财报中的图表、表格和页面布局保留为可追溯证据，而不是在文本切块里被抹平。',
  },
  'deepnerve-3d': {
    axis: 'medical AI prototype',
    signal: 'tiny 3D target, topology first',
    proof: 'SwinUNETR pipeline',
    tone: '#c4b5fd',
    impact: '用研究工程纪律处理低对比、低前景占比的 3D 医学影像问题，不用演示效果替代约束说明。',
  },
  'codex-zcode-remote-relay': {
    axis: 'agent orchestration',
    signal: 'bounded delegation for real work',
    proof: 'worker ledger + gates',
    tone: '#fde68a',
    impact: '把多模型协作从临时聊天变成有边界、有账本、有验收的本地工作流水线。',
  },
};

export function SignatureProjectsStage({ cases }: SignatureProjectsStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const theaterRef = useRef<HTMLDivElement>(null);
  const active = cases[activeIndex] ?? cases[0];

  const activeImage = useMemo(
    () => (active ? getProjectImage(active.project.slug, active.project.name) : null),
    [active],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.dataset.active = entry.isIntersecting ? 'true' : 'false';
      },
      { rootMargin: '180px 0px', threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) return;

      gsap.set(
        '.signature-kicker, .signature-title, .signature-copy, .signature-selector, .signature-theater, .signature-proof-panel',
        { opacity: 0, y: 28 },
      );
      gsap.set('.signature-depth-card', { opacity: 0, y: 36, rotateX: -12 });

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          once: true,
        },
      });

      tl.to('.signature-kicker', { opacity: 1, y: 0, duration: 0.45 })
        .to('.signature-title', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
        .to('.signature-copy', { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
        .to('.signature-selector', { opacity: 1, y: 0, duration: 0.58 }, '-=0.28')
        .to('.signature-depth-card', { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.07 }, '-=0.3')
        .to('.signature-theater', { opacity: 1, y: 0, duration: 0.7 }, '-=0.58')
        .to('.signature-proof-panel', { opacity: 1, y: 0, duration: 0.58 }, '-=0.42');
    },
    { scope: sectionRef },
  );

  if (!active || !activeImage) return null;

  const accent = CASE_ACCENTS[active.project.slug] ?? {
    axis: active.project.language,
    signal: active.project.tagline,
    proof: active.project.headline?.label ?? 'case proof',
    tone: active.project.languageColor,
    impact: active.project.pitchZh ?? active.project.tagline,
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = theaterRef.current;
    if (!el || event.pointerType === 'touch') return;

    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.style.setProperty('--rx', `${((0.5 - py) * 7).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`);
  };

  const resetTilt = () => {
    const el = theaterRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '42%');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <section
      ref={sectionRef}
      id="signature-projects"
      data-active="false"
      className="signature-stage relative min-h-[100svh] overflow-hidden border-y border-white/[0.06] bg-[#030303] py-20 md:py-24"
      style={{ ['--signature-tone' as string]: accent.tone }}
    >
      <div aria-hidden className="signature-grid" />
      <div aria-hidden className="signature-beam-plane">
        <span />
        <span />
        <span />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-6 xl:grid-cols-[0.72fr_1.18fr_0.78fr] xl:items-center">
        <div className="min-w-0">
          <span className="signature-kicker block font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-600">
            [ index_02 / signature systems ]
          </span>
          <h2 className="signature-title mt-5 text-[clamp(2.75rem,6.2vw,6.9rem)] font-black uppercase leading-[0.86] tracking-normal text-white">
            Proof
            <span className="block text-zinc-500">with depth</span>
          </h2>
          <p className="signature-copy mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            这里集中展示四个最能说明能力边界的项目：从产品工程、视觉文档理解，到医学影像原型和多智能体协作。每个案例都能看到问题、系统做法和可验证结果。
          </p>

          <div className="signature-selector mt-8 grid gap-2">
            {cases.map(({ project }, index) => {
              const itemAccent = CASE_ACCENTS[project.slug] ?? {
                axis: project.language,
                signal: project.tagline,
                proof: project.headline?.label ?? 'case proof',
                tone: project.languageColor,
                impact: project.pitchZh ?? project.tagline,
              };
              const isActive = index === activeIndex;

              return (
                <button
                  key={project.slug}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="signature-select-row group grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.018] px-3 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.035]"
                >
                  <span
                    className="font-mono text-[11px] font-black tracking-[0.22em]"
                    style={{ color: isActive ? itemAccent.tone : 'rgba(113,113,122,0.9)' }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black tracking-tight text-zinc-100 md:text-base">
                      {project.name}
                    </span>
                    <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
                      {itemAccent.axis}
                    </span>
                  </span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600 md:block">
                    open
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={theaterRef}
          className="signature-theater relative min-h-[30rem] md:min-h-[38rem]"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
        >
          <div className="signature-orbit" aria-hidden>
            <span />
            <span />
            <span />
          </div>

          <div className="signature-depth-stack" aria-hidden>
            {cases.map(({ project }, index) => (
              <span
                key={project.slug}
                className="signature-depth-card"
                style={{
                  ['--depth-index' as string]: String(index),
                  ['--depth-offset' as string]: `${(index - activeIndex) * 18}px`,
                  ['--depth-tone' as string]: CASE_ACCENTS[project.slug]?.tone ?? project.languageColor,
                }}
              />
            ))}
          </div>

          <div className="signature-screen" key={active.project.slug}>
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority={activeIndex === 0}
              sizes="(min-width: 1280px) 44rem, 100vw"
              className="object-cover"
              unoptimized={
                activeImage.src.startsWith('/api/og') ||
                activeImage.src.startsWith('https://raw.githubusercontent.com')
              }
            />
            <div aria-hidden className="signature-screen-shade" />
            <div aria-hidden className="signature-screen-scan" />

            <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-400 md:left-5 md:right-5 md:top-5">
              <span className="rounded bg-black/60 px-2 py-1 text-white/85 backdrop-blur-sm">
                {activeImage.label}
              </span>
              <span className="rounded border border-white/10 bg-black/45 px-2 py-1 backdrop-blur-sm">
                {accent.proof}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
              <div className="max-w-2xl">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--signature-tone)]">
                  {accent.signal}
                </div>
                <h3 className="mt-3 max-w-2xl text-2xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">
                  {active.project.name}
                </h3>
                <p className="mt-3 line-clamp-2 max-w-xl text-xs leading-relaxed text-zinc-200 md:mt-4 md:line-clamp-3 md:text-base">
                  {active.project.pitchZh ?? active.project.tagline}
                </p>
              </div>
            </div>
          </div>

          <div className="signature-metric-tower">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
              headline
            </span>
            <strong>{active.project.headline?.value ?? active.project.pushedRelative}</strong>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
              {active.project.headline?.label ?? 'updated'}
            </span>
          </div>
        </div>

        <aside className="signature-proof-panel min-w-0 rounded-md border border-white/[0.08] bg-black/35 p-5 backdrop-blur-sm md:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              evidence core
            </span>
            <span className="signature-status-dot" />
          </div>

          <div className="mt-5 space-y-4">
            <ProofLane index="01" label="problem" text={active.detail?.problem ?? active.project.tagline} />
            <ProofLane index="02" label="system" text={active.detail?.approach ?? accent.signal} />
            <ProofLane index="03" label="proof" text={active.detail?.outcome ?? active.project.tagline} active />
          </div>

          <div className="signature-impact-callout mt-5 rounded-md p-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">
              why this matters
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-200">{accent.impact}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniStat label="commits" value={String(active.project.commits || '-')} />
            <MiniStat label="repo size" value={active.project.sizeHuman} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {active.project.stack.slice(0, 4).map((item) => (
              <span
                key={item.name}
                className="rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400"
              >
                {item.name}
              </span>
            ))}
          </div>

          <Link
            href={`/projects/${active.project.slug}`}
            className="signature-case-link mt-6 flex items-center justify-center gap-2 rounded-md bg-white/[0.03] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.07]"
          >
            open case file
            <span aria-hidden>-&gt;</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}

function ProofLane({
  index,
  label,
  text,
  active = false,
}: {
  index: string;
  label: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={
        active
          ? 'signature-proof-lane-active relative rounded-md bg-white/[0.045] p-4'
          : 'relative rounded-md border border-white/[0.07] bg-white/[0.02] p-4'
      }
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] font-black tracking-[0.22em] text-[color:var(--signature-tone)]">
          {index}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">
          {label}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xl font-black tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}
