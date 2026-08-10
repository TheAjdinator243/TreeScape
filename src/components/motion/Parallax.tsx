'use client';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from './use-reduced-motion';

/**
 * Sadržaj koji se pri skrolanju kreće sporije od stranice.
 *
 * Tri pravila zbog kojih ovo ne trza:
 *
 *  1. Mjeri se u `scroll`, a crta u `requestAnimationFrame`. Skrol umije
 *     okinuti i po stotinu puta u sekundi; preglednik crta šezdeset. Bez ovog
 *     razdvajanja se isti piksel prepiše dvaput prije nego se ijednom vidi.
 *  2. Pomjera se SAMO `translate3d`, nikad `top` ni `margin`. Prvo radi
 *     grafička kartica; drugo tjera preglednik da ponovo rasporedi cijelu
 *     stranicu, u svakom kadru.
 *  3. `getBoundingClientRect` se čita jednom po kadru, prije upisa. Čitanje
 *     nakon upisa tjera preglednik da račun odmah izvrši ("layout thrashing").
 *
 * Slika mora biti VIŠA od svog okvira (npr. `scale-110`), inače se pri
 * pomjeranju vidi rub ispod nje.
 */
export function Parallax({
  children,
  /** Koliko sporije od stranice. 0.2 = kreće se petinom brzine skrola. */
  speed = 0.2,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    let frame = 0;

    const draw = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();

      // Ništa se ne računa dok se ploha ne vidi — na dugoj stranici to je
      // većina vremena.
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      // Nula kad je sredina plohe na sredini ekrana, pa pomak na obje strane.
      const fromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      node.style.transform = `translate3d(0, ${(-fromCenter * speed).toFixed(2)}px, 0)`;
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
  }, [speed, reduced]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
