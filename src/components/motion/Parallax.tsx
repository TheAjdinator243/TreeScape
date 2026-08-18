'use client';

import { useEffect, useRef } from 'react';

import { calmMotion, onScroll } from './ticker';

/**
 * Fotografija koja se u svom okviru kreće sporije od stranice.
 *
 * Okvir stoji u redu s ostatkom sadržaja; slika unutar njega je viša od okvira
 * i klizi kroz njega dok se skrola. Zbog toga slika djeluje kao da je iza
 * stranice, a ne zalijepljena na nju — isti trik kojim se u pozorištu dobija
 * dubina s dvije ravne kulise.
 *
 * Slika mora biti viša od okvira upravo za onoliko koliko će se pomjeriti,
 * inače bi se pri kraju puta ispod nje ukazala praznina. Taj višak računa CSS
 * iz `--par-speed`, pa se brzina mijenja na jednom mjestu (vidi `.par` u
 * `globals.css`).
 *
 * Pomjera se samo `transform` — jedina osobina koju preglednik može odraditi
 * na grafičkoj kartici, bez ponovnog računanja rasporeda stranice.
 */
export function Parallax({
  children,
  speed = 0.14,
  className = '',
}: {
  children: React.ReactNode;
  /**
   * Koliki dio pređenog puta slika "izgubi". 0 je nepomično, 0.14 je taman
   * toliko da se osjeti a ne primijeti. Preko 0.3 slika počne bježati.
   */
  speed?: number;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frameNode = frame.current;
    const innerNode = inner.current;
    if (!frameNode || !innerNode || calmMotion()) return;

    frameNode.dataset.moving = 'true';

    return onScroll(() => {
      const box = frameNode.getBoundingClientRect();
      const viewport = window.innerHeight || 0;

      // Koliko je središte okvira udaljeno od središta ekrana. Nula znači da je
      // okvir tačno na sredini — tada slika stoji u svom prirodnom položaju, a
      // odmiče se simetrično na obje strane.
      const offset = box.top + box.height / 2 - viewport / 2;

      innerNode.style.transform = `translate3d(0, ${(-offset * speed).toFixed(2)}px, 0)`;
    });
  }, [speed]);

  return (
    <div
      ref={frame}
      className={`par ${className}`}
      style={{ '--par-speed': speed } as React.CSSProperties}
    >
      <div ref={inner} className="par-in">
        {children}
      </div>
    </div>
  );
}
