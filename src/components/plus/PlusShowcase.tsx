'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { LineReveal } from '@/components/motion/LineReveal';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { Lightbox, galleryStep } from '@/components/site/Lightbox';
import { GALLERY } from '@/lib/gallery';

/**
 * Kuća, dio po dio.
 *
 * Zamjenjuje mrežu sličica i kartice s ikonama koje su ovdje stajale ranije.
 * Svaka stavka je jedan red: fotografija s jedne strane, naslov i opis s
 * druge. Strane se izmjenjuju, pa oko ide cik-cak niz stranicu umjesto da
 * klizi niz jednu kolonu.
 *
 * ── Tekst NIKAD ne ide preko slike ────────────────────────────────────────
 * Natpis preko fotografije traži tamnu opnu da bi se pročitao, a ta opna
 * pojede upravo ono što fotografija pokazuje. Zato tekst stoji pored: slika
 * ostaje čitava, a opis se čita bez naprezanja.
 *
 * ── Šta se animira ────────────────────────────────────────────────────────
 * Fotografija se otkriva odozdo (`clip`) i unutar okvira se kreće sporije od
 * stranice (`Parallax`); naslov ide red po red, a opis za njim. Svaki red ima
 * svoj osmatrač, pa se pali kad ON dođe na red — ne svi odjednom.
 *
 * Klik na fotografiju je i dalje otvara preko cijelog ekrana, kao i prije.
 */
export function PlusShowcase() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => galleryStep(i, -1)), []);
  const next = useCallback(() => setOpenIndex((i) => galleryStep(i, 1)), []);

  return (
    <section id="galerija" className="bg-paper-50">
      <div className="plus-section">
        <Reveal>
          <p className="plus-eyebrow">{t.showcase.eyebrow}</p>
        </Reveal>
        <LineReveal as="h2" className="plus-title" text={t.showcase.heading} />
        <LineReveal as="p" className="plus-lead" text={t.showcase.lead} delay={120} stagger={70} />

        <div className="mt-16 space-y-20 md:mt-20 md:space-y-28">
          {GALLERY.map((photo, i) => {
            const copy = t.showcase.item(photo.n);
            // Parni redovi: slika lijevo. Neparni: slika desno. Ispod `lg`
            // slika je uvijek prva — na telefonu je ona ta koja uvodi u tekst.
            const imageRight = i % 2 === 1;

            return (
              <article key={photo.n} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
                <Reveal
                  variant="clip"
                  margin="0px 0px -12% 0px"
                  className={`lg:col-span-7 ${imageRight ? 'lg:order-2' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-label={`${t.gallery.open}: ${copy.title}`}
                    className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-panel shadow-raise"
                  >
                    {/* Slika je viša od okvira (`-inset-y-10`) da se pri
                        pomjeranju ne vidi rub ispod nje. */}
                    <Parallax speed={0.06} className="absolute -inset-y-10 inset-x-0">
                      <Image
                        src={photo.image}
                        alt={t.gallery.itemAlt(photo.n)}
                        fill
                        placeholder="blur"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                      />
                    </Parallax>

                    {/* Vlas-okvir iznutra: bez njega svijetla fotografija na
                        papirnatoj podlozi nema gdje da završi. */}
                    <span
                      className="pointer-events-none absolute inset-0 rounded-panel ring-1 ring-inset ring-pine-950/10"
                      aria-hidden="true"
                    />
                  </button>
                </Reveal>

                <div className={`lg:col-span-5 ${imageRight ? 'lg:order-1' : ''}`}>
                  <Reveal margin="0px 0px -12% 0px">
                    <p className="plus-sans text-xs font-semibold tabular-nums tracking-[0.22em] text-clay-500">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                  </Reveal>

                  <LineReveal
                    as="h3"
                    className="mt-4 text-[2rem] leading-[1.1] text-pine-900 sm:text-[2.4rem]"
                    text={copy.title}
                    stagger={80}
                  />

                  <LineReveal
                    as="p"
                    className="mt-4 max-w-md text-base leading-[1.8] text-pine-900/70 md:text-[1.05rem]"
                    text={copy.body}
                    delay={140}
                    stagger={55}
                  />
                </div>
              </article>
            );
          })}
        </div>
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
