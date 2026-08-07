'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { Lightbox, galleryStep } from '@/components/site/Lightbox';
import { Reveal } from '@/components/site/Reveal';
import { GALLERY } from '@/lib/gallery';

/**
 * Galerija.
 *
 * Osnovna verzija slaže slike u gustu mozaik-mrežu s razmacima; ovdje idu
 * krupnije, u dvije kolone koje se izmjenjuju po visini, bez ijednog razmaka
 * između njih. Slike se dodiruju i drže se kao jedna ploha — to je razlika
 * između "puno fotografija" i "jedna kuća".
 *
 * Uvećani prikaz je zajednički s osnovnom verzijom (`Lightbox`).
 */
export function ProGallery() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => galleryStep(i, -1)), []);
  const next = useCallback(() => setOpenIndex((i) => galleryStep(i, 1)), []);

  return (
    <section id="galerija" className="bg-onyx-900">
      <div className="pro-section pb-0 md:pb-0">
        <Reveal className="max-w-2xl">
          <p className="pro-eyebrow">{t.site.name}</p>
          <h2 className="pro-title mt-6 text-ivory-50">{t.gallery.heading}</h2>
          <p className="pro-lead">{t.gallery.lead}</p>
        </Reveal>
      </div>

      {/*
        Redovi imaju ZADANU visinu, a slike je ne diraju. Prvi pokušaj je svakoj
        ćeliji davao svoj omjer stranica uz `row-span-2` — i mreža se izrešetala
        rupama, jer visoka ćelija zauzme dva reda čije visine onda ne odgovaraju
        omjeru susjeda. Uz fiksne redove `row-span-2` znači tačno "dva puta viša".

        `grid-flow-dense` popunjava ono što ostane: kad široka slika ne stane u
        rep reda, raspored vrati sljedeću manju unazad umjesto da ostavi prazninu.
      */}
      <ul className="mt-16 grid auto-rows-[190px] grid-flow-dense grid-cols-2 md:auto-rows-[260px] md:grid-cols-3">
        {GALLERY.map((item, i) => (
          <li
            key={item.n}
            className={[
              'group relative overflow-hidden',
              item.span === 'wide' ? 'col-span-2' : '',
              item.span === 'tall' ? 'row-span-2' : '',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="h-full w-full cursor-zoom-in"
              aria-label={`${t.gallery.open}: ${t.gallery.itemCaption(item.n)}`}
            >
              <Image
                src={item.image}
                alt={t.gallery.itemAlt(item.n)}
                fill
                placeholder="blur"
                sizes="(max-width: 768px) 50vw, 33vw"
                // Sporo i jedva primjetno — brzi zum djeluje jeftino.
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />

              <span
                className="absolute inset-0 bg-onyx-950/35 transition-opacity duration-500 group-hover:opacity-0"
                aria-hidden="true"
              />

              {/* Redni broj umjesto natpisa preko slike — diskretnije, a
                  natpis se ionako vidi u uvećanom prikazu. */}
              <span className="absolute bottom-4 start-5 text-[0.65rem] uppercase tracking-[0.24em] text-ivory-100/0 transition-colors duration-500 group-hover:text-ivory-100">
                {t.gallery.itemCaption(item.n)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <Lightbox index={openIndex} onClose={close} onPrev={prev} onNext={next} />
      )}
    </section>
  );
}
