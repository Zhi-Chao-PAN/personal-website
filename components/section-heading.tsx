'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeadingProps {
  /** Bracketed label like "[ INDEX_02_PROJECTS ]" — terminal-style cue. */
  label: string;
  /** Big bold title — animated with character stagger. */
  title: string;
  /** Optional mono-styled subtitle / stats line. */
  subtitle?: string;
  /** Center align (default: left). */
  align?: 'left' | 'center';
}

/**
 * Reusable section heading. Mirrors Hero's character-stagger reveal pattern
 * (SplitType chars → yPercent 100 → 0 with expo.out ease).
 */
export function SectionHeading({ label, title, subtitle, align = 'left' }: SectionHeadingProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const title = container.current?.querySelector<HTMLElement>('.section-title');
    if (!title) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const split = new SplitType(title, { types: 'chars,words' });

    if (reducedMotion) {
      return () => split.revert();
    }

    gsap.set(split.words, { overflow: 'hidden' });
    gsap.set(split.chars, { yPercent: 100 });
    gsap.set('.section-label, .section-subtitle', { opacity: 0, y: 8 });

    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      scrollTrigger: {
        trigger: container.current,
        start: 'top 82%',
        once: true,
      },
    });
    tl.to('.section-label', { opacity: 1, y: 0, duration: 0.5 })
      .to(split.chars, { yPercent: 0, duration: 0.9, stagger: 0.02, ease: 'expo.out' }, '-=0.2')
      .to('.section-subtitle', { opacity: 1, y: 0, duration: 0.5 }, '-=0.5');

    return () => {
      tl.scrollTrigger?.kill();
      split.revert();
    };
  }, { scope: container });

  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div ref={container} className={`flex flex-col ${alignment} gap-4 max-w-5xl mx-auto w-full`}>
      <span className="section-label font-mono text-[11px] md:text-xs text-zinc-600 tracking-[0.3em] uppercase">
        {label}
      </span>
      <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95]">
        {title}
      </h2>
      {subtitle ? (
        <p className="section-subtitle font-mono text-xs md:text-sm text-zinc-500 tracking-widest uppercase">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
