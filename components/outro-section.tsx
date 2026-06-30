'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { CONTACT_EMAIL, GITHUB_OWNER } from '@/lib/projects';
import { ParticleField } from './reactbits-particle-field';

gsap.registerPlugin(ScrollTrigger);

interface OutroSectionProps {
  totalRepos: number;
  totalStars: number;
  liveDemos: number;
  totalSizeMb: number;
}

const FINALE_LINES = [
  '我不想把 AI 停留在演示里。',
  '我要把它推进到可以验证、可以交付、可以被真实使用的系统。',
  '如果你也在做应用型 AI、多智能体工作流、RAG、评测或产品工程，',
  '带一个真实问题来，我们从那里开始。',
] as const;

export function OutroSection({
  totalRepos,
  totalStars,
  liveDemos,
  totalSizeMb,
}: OutroSectionProps) {
  const container = useRef<HTMLElement>(null);
  const githubUrl = `https://github.com/${GITHUB_OWNER}`;

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const titleSplit = new SplitType('.finale-title', { types: 'chars,words' });
      const lineSplit = new SplitType('.finale-line', { types: 'chars' });

      if (reducedMotion) {
        return () => {
          titleSplit.revert();
          lineSplit.revert();
        };
      }

      gsap.set(titleSplit.words, { overflow: 'hidden' });
      gsap.set(titleSplit.chars, { yPercent: 120, opacity: 0 });
      gsap.set(lineSplit.chars, { opacity: 0, y: 8 });
      gsap.set(
        '.finale-label, .finale-core, .finale-microcopy, .finale-stat, .finale-action, .finale-credit',
        { opacity: 0, y: 22 },
      );
      gsap.set('.finale-rings span', { scale: 0.72, opacity: 0 });
      gsap.set('.finale-beam', { scaleX: 0, transformOrigin: 'center' });

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        scrollTrigger: {
          trigger: container.current,
          start: 'top 62%',
          once: true,
        },
      });

      tl.to('.finale-beam', { scaleX: 1, duration: 0.8, ease: 'expo.inOut' })
        .to('.finale-label', { opacity: 1, y: 0, duration: 0.45 }, '-=0.3')
        .to(
          titleSplit.chars,
          { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.018, ease: 'expo.out' },
          '-=0.2',
        )
        .to(
          '.finale-rings span',
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(1.4)' },
          '-=0.72',
        )
        .to('.finale-core', { opacity: 1, y: 0, duration: 0.65 }, '-=0.55')
        .to(
          lineSplit.chars,
          { opacity: 1, y: 0, duration: 0.34, stagger: { each: 0.004, from: 'start' } },
          '-=0.35',
        )
        .to('.finale-microcopy', { opacity: 1, y: 0, duration: 0.55 }, '-=0.18')
        .to(
          '.finale-stat',
          { opacity: 1, y: 0, duration: 0.52, stagger: 0.055, ease: 'power3.out' },
          '-=0.24',
        )
        .to(
          '.finale-action',
          { opacity: 1, y: 0, duration: 0.46, stagger: 0.08, ease: 'power3.out' },
          '-=0.22',
        )
        .to('.finale-credit', { opacity: 1, y: 0, duration: 0.48 }, '-=0.25');

      return () => {
        titleSplit.revert();
        lineSplit.revert();
      };
    },
    { scope: container },
  );

  const stats = [
    { value: String(totalRepos), label: 'public repos' },
    { value: String(totalStars), label: 'stars total' },
    { value: String(liveDemos), label: 'live demos' },
    { value: totalSizeMb > 0 ? totalSizeMb.toFixed(1) : '-', label: 'mb shipped' },
  ];

  return (
    <section
      ref={container}
      id="outro"
      className="finale-section relative flex min-h-[100svh] w-full items-center overflow-hidden bg-[#030303] py-20 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '4vw 4vw',
          backgroundPosition: 'center center',
        }}
      />
      <ParticleField className="finale-particles" maxParticles={72} density={15000} />
      <div aria-hidden className="finale-field" />
      <div aria-hidden className="finale-beam" />
      <div aria-hidden className="finale-rings">
        <span />
        <span />
        <span />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14">
        <div>
          <span className="finale-label block font-mono text-[11px] uppercase tracking-[0.36em] text-emerald-300/80">
            [ final signal / next system ]
          </span>

          <h2 className="finale-title mt-5 max-w-5xl text-[clamp(3rem,8.2vw,8.2rem)] font-black uppercase leading-[0.86] tracking-normal text-white">
            Not a demo.
            <span className="finale-title-accent block">A system.</span>
          </h2>

          <div className="mt-6 max-w-3xl space-y-1.5">
            {FINALE_LINES.map((line) => (
              <p
                key={line}
                className="finale-line text-base font-semibold leading-[1.55] tracking-wide text-zinc-100 md:text-lg"
              >
                {line}
              </p>
            ))}
          </div>

          <p className="finale-microcopy mt-4 max-w-2xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.24em] text-zinc-500 md:text-xs">
            bring a real problem / make the boundary explicit / ship the useful version
          </p>
        </div>

        <div className="finale-core relative overflow-hidden rounded-md border border-white/[0.08] bg-black/45 p-5 shadow-2xl shadow-black/45 backdrop-blur-sm md:p-6">
          <div className="finale-core-grid" aria-hidden />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              <span>system handoff</span>
              <span className="text-emerald-300">ready</span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-5">
              {stats.map((stat) => (
                <div key={stat.label} className="finale-stat border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-y border-white/[0.08] py-5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              <div className="flex items-center justify-between gap-4">
                <span>focus</span>
                <span className="text-zinc-200">applied AI / agents / evaluation</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>direction</span>
                <span className="text-zinc-200">overseas graduate study in AI / computing</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>mode</span>
                <span className="text-emerald-300">build, verify, iterate</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="finale-action border border-emerald-300/35 bg-emerald-300/[0.08] px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200 transition-colors hover:border-emerald-200/70"
              >
                github
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="finale-action border border-white/[0.09] bg-white/[0.025] px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-200 transition-colors hover:border-white/30"
              >
                email
              </a>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="finale-action border border-white/[0.09] bg-white/[0.025] px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:border-white/30 hover:text-white"
              >
                restart
              </button>
            </div>

            <div className="finale-credit mt-5 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-700">
              [ panzhichao.com / digital_lab / 2026 ]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
