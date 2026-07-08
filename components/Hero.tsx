'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import { ParticleField } from './reactbits-particle-field';

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = container.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.dataset.active = entry.isIntersecting ? 'true' : 'false';
      },
      { rootMargin: '160px 0px', threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    // 1. Text Splitting for Character-level & Word-level animation
    const titleSplit = new SplitType('.hero-title', { types: 'chars,words' });
    const subtitleSplit = new SplitType('.hero-subtitle', { types: 'lines,words' });
    
    // Set immediate CSS to ensure overflow hidden for the stagger reveal effect
    gsap.set(titleSplit.words, { overflow: 'hidden' });
    gsap.set(subtitleSplit.lines, { overflow: 'hidden' });
    
    // 2. Timeline Matrix setup
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Initial hardware-accelerated states
    gsap.set('.clip-panel', { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' });
    gsap.set('.hero-liquid-blob', { scale: 0.86, opacity: 0, filter: 'blur(58px)' });
    gsap.set('.hero-intro-note, .hero-bottom-rail', { opacity: 0, y: 18 });
    gsap.set(titleSplit.chars, { yPercent: 100 });
    gsap.set(subtitleSplit.words, { yPercent: 100, opacity: 0 });

    // 3. The Execution Sequence
    tl.to('.hero-liquid-blob', {
      scale: 1,
      opacity: 1,
      filter: 'blur(34px)',
      duration: 1.4,
      stagger: 0.08,
      ease: 'expo.out'
    })
    .to('.clip-panel', {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1.6,
      ease: 'expo.inOut'
    }, '-=1.05')
    .to('.hero-intro-note, .hero-bottom-rail', {
      opacity: 1,
      y: 0,
      duration: 0.72,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=1.2')
    .to(titleSplit.chars, {
      yPercent: 0,
      duration: 1.2,
      stagger: 0.03,
      ease: 'expo.out'
    }, '-=0.6')
    .to(subtitleSplit.words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.015,
      ease: 'power3.out'
    }, '-=0.9');

    // Cleanup split text on unmount
    return () => {
      titleSplit.revert();
      subtitleSplit.revert();
    };
  }, { scope: container });

  return (
    <div
      ref={container}
      data-active="true"
      className="reactbits-hero-shell relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#030303]"
    >
      {/* Background Math Grid effect */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '4vw 4vw',
          backgroundPosition: 'center center'
        }} 
      />
      <div aria-hidden className="hero-liquid-stage">
        <span className="hero-liquid-blob hero-liquid-blob--one" />
        <span className="hero-liquid-blob hero-liquid-blob--two" />
        <span className="hero-liquid-blob hero-liquid-blob--three" />
      </div>
      <div aria-hidden className="reactbits-hero-aurora" />
      <div aria-hidden className="reactbits-hero-scan" />
      <ParticleField className="reactbits-hero-particles" />
      <div aria-hidden className="reactbits-hero-frame">
        <span />
        <span />
        <span />
      </div>
      <div className="hero-intro-note absolute left-6 top-8 z-20 max-w-xs text-sm font-semibold leading-relaxed text-zinc-200 md:left-12 md:top-12 md:max-w-sm">
        Applied AI systems with product taste, evidence, and shipping discipline.
      </div>

      {/* Main Reveal Clip-path Panel */}
      <div className="clip-panel relative z-10 flex flex-col items-center px-4 text-center md:px-0">
        <h1 className="hero-title hero-display-title mb-8 text-white">
          <span className="hero-title-line hero-title-line--sans">ZhiChao</span>
          <span className="hero-title-line hero-title-line--serif reactbits-title-glow">Pan</span>
        </h1>
        <p className="hero-subtitle max-w-2xl text-sm md:text-xl text-zinc-300 font-mono tracking-widest uppercase">
          [ Applied AI · Multi-Agent Systems · Product Engineering ]
        </p>
      </div>

      <div className="hero-bottom-rail absolute inset-x-6 bottom-6 z-20 border-t border-white/25 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300 md:inset-x-12 md:bottom-8 md:text-xs">
        <span>v3.2</span>
        <nav aria-label="Primary sections" className="hero-bottom-links">
          <a href="#signature-projects">work</a>
          <a href="#projects">index</a>
          <a href="#outro">contact</a>
        </nav>
      </div>
    </div>
  );
}
