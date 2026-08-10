'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { LineReveal } from '@/components/motion/LineReveal';
import { Reveal } from '@/components/motion/Reveal';
import { Lightbox, galleryStep } from '@/components/site/Lightbox';
import { GALLERY } from '@/lib/gallery';

/**
 * Galerija.
 *
 * Mozaik od `wide` i `tall` ćelija (raspored stoji uz same slike, u
 * `lib/gallery.ts`), a ne uredna mreža jednakih kvadrata: jednake ćelije
 * izgledaju kao spisak nekretnina, različite kao kuća koju neko pokazuje.
 *
 * Pri prelasku mišem slika se polako uveća, a natpis izađe ispod tamnog ruba.
 * Oboje je `transform`/`opacity`, pa mreža od četrnaest slika ostaje mirna i
 * na slabijem računaru.
 *
 * Uvećani prikaz (`Lightbox`) je zajednički sa sve tri verzije sajta; ovdje mu
 * se dodatno prosljeđuje `onSelect`, pa dobija i traku sličica.
 */
export function PlusGallery() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => galleryStep(i, -1)), []);
  const next = useCallback(() => setOpenIndex((i) => galleryStep(i, 1)), []);

  return (
    <section id="galerija" className="bg-paper-50">
      <div className="plus-section">
        <Reveal>
          <p className="plus-eyebrow">{t.site.name}</p>
        </Reveal>
        <LineReveal as="h2" className="plus-title" text={t.gallery.heading} />
        <LineReveal as="p" className="plus-lead" text={t.gallery.lead} delay={120} stagger={70} />

        <ul className="mt-12 grid auto-rows-[150px] grid-flow-dense grid-cols-2 gap-2.5 sm:auto-rows-[200px] sm:gap-3 md:grid-cols-4 md:gap-4 lg:auto-rows-[230px]">
          {GALLERY.map((item, i) => (
            <Reveal
              key={item.n}
              as="li"
              variant="scale"
              // Kašnjenje staje na osmoj slici: mreža se puni odozgo, pa bi
              // četrnaesta inače čekala skoro sekundu nakon što je već na ekranu.
              delay={Math.min(i, 7) * 55}
              className={[
                'group relative overflow-hidden rounded-xl md:rounded-2xl',
                item.span === 'wide' ? 'col-span-2' : '',
                item.span === 'tall' ? 'row-span-2' : '',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className="relative h-full w-full cursor-zoom-in"
                aria-label={`${t.gallery.open}: ${t.gallery.itemCaption(item.n)}`}
              >
                <Image
                  src={item.image}
                  alt={t.gallery.itemAlt(item.n)}
                  fill
                  placeholder="blur"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.07]"
                />

                <span
                  className="absolute inset-0 bg-gradient-to-t from-pine-950/80 via-pine-950/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />

                <span className="absolute bottom-3 start-4 translate-y-3 text-sm font-medium text-white opacity-0 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100">
                  {t.gallery.itemCaption(item.n)}
                </span>

                {/* Vlas-okvir iznutra: bez njega svijetla fotografija na
                    papirnatoj podlozi nema gdje da završi. */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-pine-950/10 md:rounded-2xl"
                  aria-hidden="true"
                />
              </button>
            </Reveal>
          ))}
        </ul>
      </div>

      {openIndex !== null && (
        <Lightbox
          index={openIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
          onSelect={setOpenIndex}
        />
      )}
    </section>
  );
}
