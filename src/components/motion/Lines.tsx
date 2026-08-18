'use client';

import { useEffect, useRef } from 'react';

import { useInView } from './use-in-view';

/**
 * Naslov koji se otkriva red po red.
 *
 * Svaka riječ stoji u svom prozorčiću s odsječenim rubom i počinje jednu
 * visinu slova ispod njega — kao slog pod zavjesom. Kad naslov uđe u vidno
 * polje, zavjese se dižu redom.
 *
 * Kašnjenje ide po REDU, ne po riječi, i to je cijela poenta: naslov od šest
 * riječi u dva reda tako izgleda kao dvije rečenice koje se izgovaraju jedna
 * za drugom, a ne kao šest slova koja pojedinačno iskaču. U koji red je koja
 * riječ pala ne zna niko osim preglednika — zavisi od širine ekrana, jezika i
 * pisma — pa se mora izmjeriti, i mjeri se ponovo kad se prozor promijeni.
 *
 * Pomak je u `em`: naslov je na telefonu upola manji nego na ekranu, pa bi
 * fiksnih 40px tamo bacilo riječ daleko ispod reza. U `em` je pomak uvijek
 * tačno jedna visina slova.
 */
export function Lines({
  text,
  className = '',
  delay = 0,
  step = 90,
}: {
  text: string;
  className?: string;
  /** Koliko cijeli naslov čeka prije nego krene, u milisekundama. */
  delay?: number;
  /** Razmak između dva reda, u milisekundama. */
  step?: number;
}) {
  const shown = useRef(false);

  const ref = useInView<HTMLSpanElement>((node) => {
    shown.current = true;
    node.dataset.shown = 'true';
  });

  // Redni broj reda za svaku riječ. Riječi u istom redu imaju isti `offsetTop`,
  // pa je grupisanje samo prolaz kroz spisak s pamćenjem prethodne vrijednosti.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => {
      let line = -1;
      let previousTop = Number.NaN;

      for (const word of node.querySelectorAll<HTMLElement>('[data-word]')) {
        const top = word.offsetTop;
        // Prag od 2px, a ne tačno poređenje: podizanje slova (j, g, ć) i
        // zaokruživanje na pola piksela znaju pomjeriti riječ u istom redu.
        if (Number.isNaN(previousTop) || Math.abs(top - previousTop) > 2) {
          line += 1;
          previousTop = top;
        }
        word.style.setProperty('--line', String(line));
      }
    };

    measure();

    // Promjena širine prelama naslov drugačije. Ako se to desi prije nego se
    // pojavio, nova mjera stigne na vrijeme; ako poslije, ništa se ne vidi jer
    // je zavjesa već dignuta.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (!shown.current) measure();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [text, ref]);

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span
      ref={ref}
      className={`lines ${className}`}
      style={
        { '--line-delay': `${delay}ms`, '--line-step': `${step}ms` } as React.CSSProperties
      }
    >
      {words.map((word, i) => (
        // Razmak stoji IZVAN prozorčića: unutar odsječenog okvira bi ga
        // preglednik pojeo, pa bi se sve riječi slijepile u jednu.
        <span key={`${word}-${i}`}>
          <span className="lines-mask">
            <span className="lines-word" data-word>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}
