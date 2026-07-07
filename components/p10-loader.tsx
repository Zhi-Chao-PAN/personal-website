'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const SESSION_KEY = 'panzhichao-p10-loader-seen';

export function P10Loader() {
  const [isVisible, setIsVisible] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const shouldAnimateRef = useRef(false);

  useEffect(() => {
    const forceIntro = new URLSearchParams(window.location.search).has('intro');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = window.sessionStorage.getItem(SESSION_KEY) === '1';

    if ((alreadySeen || reducedMotion) && !forceIntro) return;

    shouldAnimateRef.current = true;
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isVisible || !shouldAnimateRef.current) return;
    const loader = loaderRef.current;
    if (!loader) return;

    const html = document.documentElement;
    html.classList.add('p10-loader-active');

    const progress = { value: 0 };
    const updateProgress = () => {
      const value = Math.round(progress.value);
      if (counterRef.current) {
        counterRef.current.textContent = `${String(value).padStart(3, '0')}%`;
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${value / 100})`;
      }
    };

    const ctx = gsap.context(() => {
      gsap.set('.p10-loader__word', { yPercent: 112 });
      gsap.set('.p10-loader__meta span, .p10-loader__bottom', { opacity: 0, y: 18 });
      gsap.set('.p10-loader__cut', { scaleX: 0 });
      gsap.set(loader, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        onComplete: () => {
          window.sessionStorage.setItem(SESSION_KEY, '1');
          html.classList.remove('p10-loader-active');
          setIsVisible(false);
        },
      });

      tl.to('.p10-loader__word', {
        yPercent: 0,
        duration: 0.72,
        stagger: 0.055,
        ease: 'expo.out',
      })
        .to(
          '.p10-loader__meta span, .p10-loader__bottom',
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 },
          '-=0.46',
        )
        .to(
          progress,
          {
            value: 100,
            duration: 1.18,
            ease: 'power2.inOut',
            onUpdate: updateProgress,
          },
          '-=0.12',
        )
        .to(
          '.p10-loader__number',
          { yPercent: -106, duration: 0.5, ease: 'expo.in' },
          '-=0.2',
        )
        .to(
          '.p10-loader__word',
          { yPercent: -118, duration: 0.55, stagger: 0.035, ease: 'expo.in' },
          '<',
        )
        .to(
          '.p10-loader__cut',
          {
            scaleX: 1,
            duration: 0.74,
            stagger: { each: 0.045, from: 'edges' },
            ease: 'expo.inOut',
          },
          '-=0.28',
        )
        .to(loader, {
          clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
          duration: 0.78,
          ease: 'expo.inOut',
        });
    }, loader);

    updateProgress();

    return () => {
      ctx.revert();
      html.classList.remove('p10-loader-active');
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div ref={loaderRef} className="p10-loader" role="status" aria-label="Loading portfolio">
      <div className="p10-loader__grain" aria-hidden />
      <div className="p10-loader__rail" aria-hidden />

      <div className="p10-loader__meta" aria-hidden>
        <span>[ panzhichao.com ]</span>
        <span>applied ai / agent systems / product engineering</span>
      </div>

      <div className="p10-loader__stage" aria-hidden>
        <div ref={counterRef} className="p10-loader__number">
          000%
        </div>
        <div className="p10-loader__title">
          <div className="p10-loader__mask">
            <span className="p10-loader__word">ZHI</span>
          </div>
          <div className="p10-loader__mask">
            <span className="p10-loader__word">CHAO</span>
          </div>
          <div className="p10-loader__mask">
            <span className="p10-loader__word">PAN</span>
          </div>
        </div>
      </div>

      <div className="p10-loader__bottom" aria-hidden>
        <span>building the useful version</span>
        <span className="p10-loader__bar">
          <span ref={barRef} />
        </span>
        <span>loading evidence</span>
      </div>

      <div className="p10-loader__cuts" aria-hidden>
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="p10-loader__cut" />
        ))}
      </div>
    </div>
  );
}
