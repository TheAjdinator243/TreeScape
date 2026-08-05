'use client';

import { useEffect, useRef } from 'react';

/**
 * Blago pojavljivanje sadržaja pri skrolanju.
 *
 * Namjerno bez animacijske biblioteke — IntersectionObserver i dvije CSS
 * osobine rade isti posao. Vidljivost se postavlja direktno na DOM čvor, a ne
 * kroz React stanje: animacija je čista prezentacija, pa nema razloga da
 * pokreće ponovno iscrtavanje komponente pri svakom skrolu.
 *
 * Ako korisnik u sistemu ima uključeno "smanji animacije", globalno CSS
 * pravilo svede prijelaz na nulu. Ako je JavaScript isključen, <noscript>
 * stil u layout.tsx sve odmah prikaže.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => {
      node.style.opacity = '1';
      node.style.transform = 'none';
    };

    // Preglednik bez IntersectionObserver-a odmah dobija sadržaj —
    // animacija je ukras, tekst je poenta.
    if (typeof IntersectionObserver === 'undefined') {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          show();
          observer.disconnect(); // pojavi se jednom, pa se više ne prati
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{
        opacity: 0,
        transform: 'translateY(18px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
