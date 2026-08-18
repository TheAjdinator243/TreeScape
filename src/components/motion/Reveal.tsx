'use client';

import { useInView } from './use-in-view';

/** Kako sadržaj ulazi. Sam pokret je opisan u `globals.css`, uz `.reveal`. */
export type RevealVariant =
  /** Blago se digne i pojavi. Zadano — dobro za tekst i kartice. */
  | 'up'
  /** Samo se pojavi, bez pomjeranja. Za sitne oznake uz nešto što se već miče. */
  | 'fade'
  /** Uđe s početka reda — zdesna u arapskom, slijeva u ostalim jezicima. */
  | 'slide'
  /** Otkriva se odozdo, kao da se zavjesa diže. Za fotografije. */
  | 'mask'
  /** Slegne se iz malog uvećanja. Za fotografije koje stoje same. */
  | 'settle';

/**
 * Blago pojavljivanje sadržaja pri skrolanju.
 *
 * Bez animacijske biblioteke: `IntersectionObserver` javi da je element ušao u
 * vidno polje, a sve ostalo — koliko se pomjeri, koliko traje, koliko čeka —
 * stoji u CSS-u uz klasu `.reveal`. Ovdje se postavlja samo jedan atribut.
 *
 * Ko u sistemu ima "smanji animacije", dobija sadržaj bez pokreta; ko je
 * isključio JavaScript, dobija ga odmah (vidi `<noscript>` u `layout.tsx`).
 */
export function Reveal({
  children,
  delay = 0,
  variant = 'up',
  className = '',
}: {
  children: React.ReactNode;
  /** Koliko ovaj element kasni za onim prije njega, u milisekundama. */
  delay?: number;
  variant?: RevealVariant;
  className?: string;
}) {
  const ref = useInView<HTMLDivElement>((node) => {
    node.dataset.shown = 'true';
  });

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-reveal={variant}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
