'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GALLERY } from '@/lib/gallery';
import { t } from '@/lib/strings';

import { Reveal } from './Reveal';

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length)),
    []
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % GALLERY.length)),
    []
  );

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
            key={item.caption}
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
              aria-label={`${t.gallery.open}: ${item.caption}`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                placeholder="blur"
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />

              <span
                className="absolute inset-0 bg-gradient-to-t from-bark-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="absolute bottom-3 left-4 translate-y-2 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {item.caption}
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

function Lightbox({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const item = GALLERY[index];

  // Tastatura: strelice listaju, Escape zatvara. Bez ovoga galerija nije
  // upotrebljiva bez miša.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.gallery.heading}
      className="fixed inset-0 z-[70] flex flex-col bg-bark-950/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        if (start === null || end === undefined) return;
        const delta = end - start;
        if (Math.abs(delta) > 60) (delta > 0 ? onPrev : onNext)();
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 text-sand-200">
        <span className="text-sm tabular-nums">
          {t.gallery.counter(index + 1, GALLERY.length)}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label={t.gallery.close}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-4 pb-4"
        // Klik na samu sliku ne zatvara — samo klik na tamnu pozadinu.
        onClick={(e) => e.stopPropagation()}
      >
        <LightboxArrow side="left" onClick={onPrev} />

        <div className="relative h-full w-full max-w-5xl">
          <Image
            key={item.caption}
            src={item.image}
            alt={item.alt}
            fill
            placeholder="blur"
            sizes="100vw"
            className="animate-fade-rise object-contain"
          />
        </div>

        <LightboxArrow side="right" onClick={onNext} />
      </div>

      <p className="px-5 pb-6 text-center text-sm text-sand-200">{item.caption}</p>
    </div>
  );
}

function LightboxArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute ${
        side === 'left' ? 'left-2' : 'right-2'
      } z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-14 sm:w-14`}
      aria-label={side === 'left' ? t.gallery.prev : t.gallery.next}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={side === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
