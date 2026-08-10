'use client';

import { useEffect, useRef } from 'react';

/**
 * Vlas-linija koja pokazuje koliko je stranice prošlo.
 *
 * Stoji uz donju ivicu navigacije i jedina je stvar koja se na sajtu kreće
 * bez povoda posjetioca — zato je i tanka kao vlas i u boji koja ne viče.
 *
 * Kao i paralaksa: mjeri se u `scroll`, crta u `requestAnimationFrame`, a
 * pomjera se samo `transform` (`scaleX`), nikad `width`. Mijenjanje širine bi
 * pri svakom kadru tjeralo preglednik da ponovo rasporedi stranicu.
 *
 * `prefers-reduced-motion` se ovdje ne provjerava: traka ne animira ništa
 * svojom voljom nego prati prst na ekranu — kao i sam skrol.
 */
export function ScrollProgress({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;

    const draw = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // Stranica kraća od ekrana nema šta pokazivati.
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      node.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`origin-[left_center] rtl:origin-[right_center] ${className}`}
      style={{ transform: 'scaleX(0)', willChange: 'transform' }}
    />
  );
}
