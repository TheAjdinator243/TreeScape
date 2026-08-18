'use client';

import { useEffect, useRef } from 'react';

import { calmMotion } from './ticker';
import { useInView } from './use-in-view';

/**
 * Broj koji se odbroji do svoje vrijednosti kad dođe na red.
 *
 * Konačna vrijednost je ispisana već na serveru, pa je pretraživač i posjetilac
 * bez JavaScripta odmah vide — odbrojavanje je samo ukras preko gotovog broja,
 * a ne način na koji broj uopće nastane.
 *
 * Usporava prema kraju (`1 - (1-t)^3`): brojač koji ide ravnomjerno izgleda kao
 * mjerač na pumpi, a ovaj kao da se zaustavlja na broju.
 */
export function Counter({
  to,
  duration = 1000,
  className = '',
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const running = useRef(0);

  // Odbrojavanje mora stati kad element nestane sa stranice — inače bi kadar
  // za kadrom upisivao broj u čvor kojeg na stranici više nema.
  useEffect(() => () => cancelAnimationFrame(running.current), []);

  const ref = useInView<HTMLSpanElement>((node) => {
    if (calmMotion()) return;

    const started = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = String(Math.round(to * eased));
      if (t < 1) running.current = requestAnimationFrame(step);
    };

    // Krene od nule tek sad, kad se element ionako tek pojavljuje — do ovog
    // trenutka je na svom mjestu stajala konačna vrijednost.
    node.textContent = '0';
    running.current = requestAnimationFrame(step);
  });

  return (
    <span ref={ref} className={className}>
      {to}
    </span>
  );
}
