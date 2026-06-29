'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { GITHUB_OWNER, CONTACT_EMAIL } from '@/lib/projects';

gsap.registerPlugin(ScrollTrigger);

/** `whoami` terminal readout rows — left column of the About section. */
const WHOAMI: { k: string; v: string }[] = [
  { k: 'name', v: 'ZhiChao Pan · 潘志超' },
  { k: 'loc', v: '江苏, 扬州, 中国' },
  { k: 'edu', v: '扬州大学 · 计算机科学与技术' },
  { k: 'role', v: 'aspiring_ai_product_engineer' },
  { k: 'goal', v: 'ai_product_engineer | full_stack_agent_architect' },
  { k: 'stack', v: 'ts · next · python · langgraph' },
  { k: 'thesis', v: 'measurable · reproducible · useful' },
  { k: 'status', v: 'applying_ms_ai_2027 · open_to_collab' },
];

/** Current focus — five lines drawn from the GitHub profile README. */
const FOCUS: string[] = [
  '应用型 AI 系统 & AI 产品工程',
  '多智能体编排 · LangGraph + 工具调用 + 结构化输出',
  '检索增强生成 / 文档智能 / 评测',
  '全栈 TypeScript · Next.js · Prisma · Vercel',
  '可靠机器学习 / 不确定性量化 / 可复现实验',
];

/** Timeline accent — goal split into "mid" and "long" so the signal is
 *  instantly readable by recruiters, admissions, and investors. */
const TIMELINE: { k: string; v: string }[] = [
  { k: 'mid', v: 'applying overseas MS in AI · intake 2027' },
  { k: 'long', v: 'applied ai · multi-agent · ai product engineering' },
];

/**
 * AboutSection — the "who" chapter, sitting between the Hero landing and
 * the Projects canvas.
 *
 * Narrative arc:  who → why/how → what → next.
 *
 * The section mirrors the site's terminal aesthetic: a `whoami` readout
 * in a faux-terminal card on the left (engineer signal), and the personal
 * thesis in large Chinese type on the right (accessible to non-technical
 * visitors). The thesis — "measurable · reproducible · useful beyond demos"
 * — is the single line that lands for both audiences: insiders read rigor,
 * everyone else reads "not a toy".
 *
 * Animation: SplitType char-stagger for the thesis (matches Hero/Outro),
 * a sequential type-in feel for the terminal rows, fired on scroll-into-view
 * via ScrollTrigger. Respects prefers-reduced-motion (content shows as-is).
 */
export function AboutSection() {
  const container = useRef<HTMLElement>(null);
  const githubUrl = `https://github.com/${GITHUB_OWNER}`;

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const promptSplit = new SplitType('.about-prompt', { types: 'chars' });
      const thesisSplit = new SplitType('.about-thesis', {
        types: 'chars,words',
      });

      if (reducedMotion) {
        return () => {
          promptSplit.revert();
          thesisSplit.revert();
        };
      }

      // Initial hidden states.
      gsap.set(thesisSplit.words, { overflow: 'hidden' });
      gsap.set(promptSplit.chars, { opacity: 0 });
      gsap.set(thesisSplit.chars, { yPercent: 110, opacity: 0 });
      gsap.set('.about-accent > div', { opacity: 0, y: 8 });
      gsap.set(
        '.about-label, .about-line, .about-secondary, .about-focus-item, .about-contact',
        { opacity: 0, y: 12 },
      );

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        scrollTrigger: {
          trigger: container.current,
          start: 'top 72%',
          once: true,
        },
      });

      tl.to('.about-label', { opacity: 1, y: 0, duration: 0.5 })
        // `$ whoami` types in, char by char.
        .to(
          promptSplit.chars,
          { opacity: 1, duration: 0.03, stagger: 0.04 },
          '-=0.2',
        )
        // Terminal readout rows cascade like a boot log.
        .to(
          '.about-line',
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 },
          '-=0.1',
        )
        // The thesis — hero char-stagger, the emotional centerpiece.
        .to(
          thesisSplit.chars,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.025,
            ease: 'expo.out',
          },
          '-=0.3',
        )
        .to('.about-secondary', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(
          '.about-accent > div',
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
          '-=0.3',
        )
        .to(
          '.about-focus-item',
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 },
          '-=0.3',
        )
        .to('.about-contact', { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

      return () => {
        promptSplit.revert();
        thesisSplit.revert();
      };
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      id="about"
      className="relative w-full min-h-screen flex items-center bg-[#030303] overflow-hidden py-24 md:py-32"
    >
      {/* Background math grid — same family as Hero/Outro. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '4vw 4vw',
          backgroundPosition: 'center center',
        }}
      />

      {/* Emerald glow — anchored behind the terminal card (left). */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-[6%] -translate-y-1/2 w-[42vmin] h-[42vmin] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Two-column layout: terminal readout · personal thesis */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-16 items-start">
        {/* ── Left: whoami terminal card ───────────────────────────── */}
        <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 font-mono text-xs md:text-sm shadow-2xl shadow-black/40">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/5">
            <span className="size-2.5 rounded-full bg-red-500/70" />
            <span className="size-2.5 rounded-full bg-yellow-500/70" />
            <span className="size-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-zinc-600 text-[10px] tracking-[0.2em]">
              ~/panzhichao/whoami
            </span>
          </div>

          {/* Prompt */}
          <div className="about-prompt text-emerald-400 mb-3">
            $ whoami
          </div>

          {/* Readout rows */}
          <div className="space-y-1.5">
            {WHOAMI.map((row) => (
              <div key={row.k} className="about-line flex gap-2">
                <span className="text-zinc-600 select-none">{'>'}</span>
                <span className="text-zinc-500 min-w-[3.5rem]">{row.k}</span>
                <span className="text-zinc-600">:</span>
                <span className="text-zinc-200">{row.v}</span>
              </div>
            ))}
          </div>

          {/* Blinking ready cursor */}
          <div className="about-line mt-3 text-emerald-400">
            <span className="ll-cursor">▋</span>
          </div>
        </div>

        {/* ── Right: personal thesis + focus ──────────────────────── */}
        <div>
          <span className="about-label block font-mono text-[11px] tracking-[0.3em] text-emerald-400/70 uppercase">
            [ INDEX_01 — WHO ]
          </span>

          <h2 className="about-thesis mt-6 text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.18]">
            我做能被衡量、能被复现、
            <br />
            能真正用起来的 AI 系统。
          </h2>

          <p className="about-secondary mt-6 text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl">
            从研报里的结构化检索，到多智能体的协作编排，到电池寿命的安全预测——AI
            的价值不在炫技，而在说得清它为什么对、做得出它能用、守得住它不翻车。
          </p>

          {/* Timeline accent — split into mid / long for instant scan by
              recruiters, admissions, and investors. */}
          <div className="about-accent mt-5 space-y-1.5 font-mono text-xs md:text-sm tracking-wider">
            {TIMELINE.map((row) => (
              <div key={row.k} className="flex gap-2 text-emerald-400/85">
                <span className="text-zinc-600 select-none">//</span>
                <span className="text-zinc-500 min-w-[3.5rem]">{row.k}</span>
                <span className="text-zinc-600">:</span>
                <span>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Current focus */}
          <div className="mt-10">
            <div className="font-mono text-[11px] tracking-[0.3em] text-zinc-600 uppercase mb-4">
              ▸ current focus
            </div>
            <ul className="space-y-2.5">
              {FOCUS.map((item) => (
                <li
                  key={item}
                  className="about-focus-item flex gap-3 text-sm md:text-base text-zinc-300"
                >
                  <span className="text-emerald-400/60 mt-0.5 select-none">
                    ▸
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Subtle contact row — the big CTA stays in the Outro. */}
          <div className="about-contact mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono tracking-wider">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <span>github</span>
              <span aria-hidden>↗</span>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            <span className="text-zinc-600">open to collaboration</span>
          </div>
        </div>
      </div>
    </section>
  );
}
