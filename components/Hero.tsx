'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);

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
    gsap.set(titleSplit.chars, { yPercent: 100 });
    gsap.set(subtitleSplit.words, { yPercent: 100, opacity: 0 });

    // 3. The Execution Sequence
    tl.to('.clip-panel', {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1.6,
      ease: 'expo.inOut'
    })
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
    <div ref={container} className="relative w-full h-screen flex flex-col items-center justify-center bg-[#030303] overflow-hidden">
      {/* Background Math Grid effect */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '4vw 4vw',
          backgroundPosition: 'center center'
        }} 
      />

      {/* Main Reveal Clip-path Panel */}
      <div className="clip-panel relative z-10 flex flex-col items-center text-center px-4 md:px-0">
        <h1 className="hero-title text-5xl md:text-7xl lg:text-[7rem] font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
          ZhiChao Pan&apos;s<br />
          <span className="text-zinc-600 block mt-2">Digital Lab</span>
        </h1>
        <p className="hero-subtitle max-w-2xl text-sm md:text-xl text-zinc-400 font-mono tracking-widest uppercase">
          [ Applied AI · Multi-Agent Systems · Product Engineering ]
        </p>
      </div>
    </div>
  );
}
