'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { GITHUB_OWNER, CONTACT_EMAIL } from '@/lib/projects';

interface OutroSectionProps {
  totalRepos: number;
  totalStars: number;
  liveDemos: number;
  totalSizeMb: number;
}

/**
 * OutroSection — the closing chapter after the horizontal canvas.
 *
 * A full 100vh terminal-style page with a massive headline, a poetic
 * closing statement, the lab's aggregate footprint, and a final CTA.
 * Designed as a "gentle descent" from the work: the grid is brighter,
 * the font scale feels heroic, and the emerald glow warms rather than
 * pulses. The user scrolls down from the last project card and lands
 * here — a final, meaningful destination.
 */
export function OutroSection({ totalRepos, totalStars, liveDemos, totalSizeMb }: OutroSectionProps) {
  const container = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const githubUrl = `https://github.com/${GITHUB_OWNER}`;

  useGSAP(() => {
    const headingSplit = new SplitType('.outro-heading', { types: 'chars,words' });
    const subSplit = new SplitType('.outro-subline', { types: 'words' });
    const manifestoSplit = new SplitType('.outro-manifesto-line', {
      types: 'chars',
    });

    gsap.set(headingSplit.chars, { yPercent: 140, opacity: 0 });
    gsap.set(subSplit.words, { yPercent: 100, opacity: 0 });
    gsap.set(manifestoSplit.chars, { opacity: 0 });
    gsap.set('.outro-manifesto-coda', { opacity: 0, y: 14 });
    gsap.set('.outro-stat, .outro-cta', { opacity: 0, y: 24 });
    gsap.set('.outro-credential', { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.3 });
    tl.to('.outro-grid', { opacity: 0.06, duration: 1.2, ease: 'expo.inOut' }, 0)
      // Big English heading reveals first.
      .to(headingSplit.chars, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.03, ease: 'expo.out' }, '-=0.8')
      // Chinese manifesto: each line fades in line-by-line, characters within
      // a line tween quickly so it reads like a stamp, not a typewriter.
      .to(
        manifestoSplit.chars,
        {
          opacity: 1,
          duration: 0.5,
          stagger: { each: 0.005, from: 'start' },
        },
        '-=0.6',
      )
      .to('.outro-manifesto-coda', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
      // English subline then stats and ctas.
      .to(subSplit.words, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out' }, '-=0.4')
      .to('.outro-stat', { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' }, '-=0.3')
      .to('.outro-cta', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, '-=0.2')
      .to('.outro-credential', { opacity: 1, duration: 0.6 }, '-=0.3');

    return () => {
      headingSplit.revert();
      subSplit.revert();
      manifestoSplit.revert();
    };
  }, { scope: container });

  return (
    <section
      ref={container}
      id="outro"
      className="relative w-full h-screen flex flex-col items-center justify-center bg-[#030303] overflow-hidden"
    >
      {/* Background: brighter grid */}
      <div
        ref={gridRef}
        aria-hidden
        className="outro-grid pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '6vw 6vw',
          backgroundPosition: 'center center',
        }}
      />

      {/* Emerald glow — soft radial from center */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Content stack */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Mono label */}
        <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/70 uppercase mb-6">
          [ closing_chapter ]
        </span>

        {/* Massive heading */}
        <h2 className="outro-heading text-5xl md:text-7xl lg:text-[7.5rem] font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
          Let&apos;s build<br />
          <span className="text-zinc-600 block mt-2">something real</span>
        </h2>

        {/* Chinese manifesto — the main emotional close for Chinese readers.
            Each line reveals char-by-char like a stamp, no typewriter jitter.
            Kept short and verb-driven so it lands as posture, not pitch. */}
        <div
          aria-label="致读者"
          className="outro-manifesto max-w-3xl mx-auto mb-8 space-y-1.5 text-left md:text-center"
        >
          {[
            '这个网站不会停在“展示我做过什么”。',
            '它会继续记录我怎样把问题拆开、把系统搭起来，',
            '再把 AI 从演示推进到可验证、可交付、可迭代的产品。',
            '如果你也在做应用型 AI、多智能体工作流、RAG、评测或产品工程，欢迎带着一个真实问题来聊。',
          ].map((line) => (
            <p
              key={line}
              className="outro-manifesto-line text-zinc-200/95 text-base md:text-lg leading-[1.65] tracking-wide"
            >
              {line}
            </p>
          ))}
          <p className="outro-manifesto-coda mt-3 text-emerald-300 font-black text-base md:text-xl tracking-wide">
            我们可以从一个小问题开始，把它打磨成真正能用的东西。
          </p>
        </div>

        {/* English subline — visually downgraded, kept as a softer alternate
            channel for non-Chinese readers. */}
        <p className="outro-subline max-w-3xl text-[11px] md:text-xs text-zinc-500 font-mono tracking-wider leading-relaxed mb-8">
          [ open to collaboration on applied AI, multi-agent workflows, RAG,
          evaluation, and product engineering.{' '}
          <span className="text-emerald-400/90">bring a real problem</span>. ]
        </p>

        {/* Aggregate stats */}
        <div className="outro-stats flex flex-wrap justify-center gap-6 md:gap-12 mb-8">
          {[
            { v: String(totalRepos), l: 'PUBLIC REPOS' },
            { v: String(totalStars), l: 'STARS TOTAL' },
            { v: String(liveDemos), l: 'LIVE DEMOS' },
            { v: totalSizeMb > 0 ? `${totalSizeMb.toFixed(1)}` : '—', l: 'MB SHIPPED' },
          ].map((s) => (
            <div key={s.l} className="outro-stat text-center">
              <div className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tight">
                {s.v}
              </div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase mt-1">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* CTA links */}
        <div className="outro-cta flex items-center gap-6 md:gap-10">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] tracking-[0.3em] text-emerald-400 hover:text-emerald-300 transition-colors uppercase flex items-center gap-2"
          >
            <span>github</span>
            <span aria-hidden>↗</span>
          </a>
          <span className="w-px h-4 bg-zinc-700" />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-[11px] tracking-[0.3em] text-zinc-500 hover:text-white transition-colors uppercase flex items-center gap-2"
          >
            <span>back to start</span>
            <span aria-hidden>↑</span>
          </button>
          <span className="w-px h-4 bg-zinc-700" />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-[11px] tracking-[0.3em] text-zinc-500 hover:text-zinc-300 transition-colors uppercase flex items-center gap-2"
          >
            <span>say hello</span>
            <span aria-hidden>→</span>
          </a>
        </div>

        {/* Bottom credential — sits at the bottom of the content stack so
            everything shares the 100vh budget instead of fighting pixels. */}
        <div className="outro-credential mt-6 font-mono text-[9px] tracking-[0.3em] text-zinc-700 uppercase">
          [ panzhichao.com / digital_lab / 2026 ]
        </div>
      </div>
    </section>
  );
}
