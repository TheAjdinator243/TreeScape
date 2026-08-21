'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { Track } from '@/components/motion/Track';
import { GALLERY, type GalleryImage } from '@/lib/gallery';

import { Lightbox, galleryStep } from './Lightbox';
import { SectionHead } from './SectionHead';

/**
 * Širina svake slike u traci.
 *
 * Visina je svima ista, pa širina jedina nosi razliku između uspravne i
 * položene fotografije. Da su sve jednake, uspravne bi bile izrezane do
 * neprepoznatljivosti, a traka bi izgledala kao red pločica.
 */
const WIDTHS: Record<NonNullable<GalleryImage['span']> | 'default', string> = {
  tall: 'w-[68vw] sm:w-[36vw] lg:w-[23rem]',
  wide: 'w-[86vw] sm:w-[62vw] lg:w-[44rem]',
  default: 'w-[78vw] sm:w-[46vw] lg:w-[31rem]',
};

/**
 * Galerija kao traka koja ide postrance.
 *
 * Mreža slika je uredna, ali se cijela vidi odjednom — gost je pređe pogledom
 * za sekundu i ide dalje. Traka mu daje po jednu fotografiju u trenutku, i to
 * krupno; kuću tako pogleda umjesto da je proleti.
 *
 * Kako se traka kreće, i šta se dešava kad to ne može, opisano je u
 * `motion/Track.tsx`. Klik na sliku i dalje otvara istu uvećanu galeriju kao
 * prije, s tastaturom i prevlačenjem.
 */
export function Gallery() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => galleryStep(i, -1)), []);
  const next = useCallback(() => setOpenIndex((i) => galleryStep(i, 1)), []);

  return (
    // Bez `overflow-hidden` na odjeljku, i to je važno: `overflow` na bilo kojem
    // pretku pretvara taj element u okvir za `position: sticky`, pa se traka ne
    // bi zalijepila nego bi samo prošla. Ono što treba odsjeći odsijeca sama
    // traka, na elementu koji se lijepi (vidi `.track-pin` u globals.css).
    <section id="galerija" className="weave bg-cream-100 pb-12 pt-24 md:pb-16 md:pt-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHead index={2} label={t.site.name} title={t.gallery.heading} lead={t.gallery.lead} />
      </div>

      <Track
        className="mt-14"
        overlay={
          <div className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto hidden w-full max-w-6xl px-5 sm:px-8 md:block">
            <div className="h-px bg-cream-300">
              <div className="track-bar -mt-px" />
            </div>
          </div>
        }
      >
        {GALLERY.map((item, i) => (
          <figure key={item.n} className={WIDTHS[item.span ?? 'default']}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block h-[52svh] w-full cursor-zoom-in overflow-hidden rounded-frame sm:h-[58svh] lg:h-[62svh]"
              aria-label={`${t.gallery.open}: ${t.gallery.itemCaption(item.n)}`}
            >
              <Image
                src={item.image}
                alt={t.gallery.itemAlt(item.n)}
                fill
                placeholder="blur"
                sizes="(max-width: 640px) 86vw, (max-width: 1024px) 62vw, 44rem"
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
              />

              <span
                className="absolute inset-0 bg-coal-950/0 transition-colors duration-500 group-hover:bg-coal-950/15"
                aria-hidden="true"
              />

              {/* Redni broj stoji NA slici, a ne u redu ispod nje: dok traka
                  klizi, ispod je vidi samo onaj ko gleda dolje, a gost gleda
                  fotografiju. Staklo ga drži čitljivim i nad nebom i nad noći. */}
              <span
                className="glass-dark absolute end-4 top-4 rounded-full px-3 py-1 font-display text-xs text-white tabular-nums"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
                <span className="text-white/50">/{String(GALLERY.length).padStart(2, '0')}</span>
              </span>
            </button>

            <figcaption className="mt-4 truncate text-sm text-ink-500">
              {t.gallery.itemCaption(item.n)}
            </figcaption>
          </figure>
        ))}
      </Track>

      {openIndex !== null && (
        <Lightbox index={openIndex} onClose={close} onPrev={prev} onNext={next} />
      )}
    </section>
  );
}
