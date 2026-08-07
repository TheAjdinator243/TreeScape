'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { GALLERY } from '@/lib/gallery';

import { Lightbox, galleryStep } from './Lightbox';
import { Reveal } from './Reveal';

export function Gallery() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => galleryStep(i, -1)), []);
  const next = useCallback(() => setOpenIndex((i) => galleryStep(i, 1)), []);

  return (
    <section id="galerija" className="section">
      <Reveal>
        <p className="section-eyebrow">{t.site.name}</p>
        <h2 className="section-title">{t.gallery.heading}</h2>
        <p className="section-lead">{t.gallery.lead}</p>
      </Reveal>

      <ul className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4 md:gap-4">
        {GALLERY.map((item, i) => (
          <li
            key={item.n}
            className={[
              'group relative overflow-hidden rounded-xl',
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
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />

              <span
                className="absolute inset-0 bg-gradient-to-t from-bark-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="absolute bottom-3 start-4 translate-y-2 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
