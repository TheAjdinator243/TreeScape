'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Javi se jednom, kad element prvi put uđe u vidno polje.
 *
 * Namjerno ne vraća stanje nego samo poziva funkciju: pojavljivanje je čista
 * prezentacija, pa nema razloga da zbog njega React ponovo iscrtava komponentu.
 * Ono što treba promijeniti — atribut, tekst, stil — mijenja se direktno na
 * DOM čvoru.
 *
 * Posmatrač se odmah odjavljuje nakon prvog ulaska. Sadržaj koji se pojavio
 * više se ne skriva kad gost skrola nazad; da se skriva, čitanje stranice
 * gore-dolje pretvorilo bi se u treptanje.
 */
export function useInView<T extends HTMLElement>(
  onEnter: (node: T) => void,
  options?: { threshold?: number; rootMargin?: string }
): RefObject<T | null> {
  const ref = useRef<T>(null);

  // Posljednja verzija funkcije, ali upisana u efektu — pisanje u `ref` usred
  // iscrtavanja React zabranjuje, a i ne treba nam prije nego što se pojavi.
  const latest = useRef(onEnter);
  useEffect(() => {
    latest.current = onEnter;
  });

  const threshold = options?.threshold ?? 0.15;
  const rootMargin = options?.rootMargin ?? '0px 0px -8% 0px';

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Preglednik bez `IntersectionObserver`-a dobija sve odmah — animacija je
    // ukras, sadržaj je poenta.
    if (typeof IntersectionObserver === 'undefined') {
      latest.current(node);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        latest.current(node);
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
