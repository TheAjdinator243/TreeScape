import Image from 'next/image';

import { HERO_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';
import { formatMoney } from '@/lib/pricing';

export async function Hero({ fromCents, symbol }: { fromCents: number; symbol: string }) {
  const { locale, t } = await getServerStrings();

  return (
    <section id="vrh" className="relative flex min-h-[92svh] items-end overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt={t.hero.imageAlt}
        fill
        // `priority` jer je ovo prvo što posjetilac vidi — ne smije kasniti.
        priority
        sizes="100vw"
        placeholder="blur"
        className="object-cover"
      />

      {/* Gradijent da bijeli tekst ostane čitljiv preko bilo koje fotografije. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-bark-950/85 via-bark-950/35 to-bark-950/45"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-32 sm:px-8 md:pb-28">
        <p className="animate-fade-rise text-xs font-semibold uppercase tracking-[0.25em] text-moss-300">
          {t.hero.eyebrow}
        </p>

        <h1
          className="animate-fade-rise mt-4 font-display text-5xl leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ animationDelay: '80ms' }}
        >
          {t.hero.title}
        </h1>

        <p
          className="animate-fade-rise mt-5 max-w-xl text-lg leading-relaxed text-sand-100 sm:text-xl"
          style={{ animationDelay: '160ms' }}
        >
          {t.hero.subtitle}
        </p>

        <div
          className="animate-fade-rise mt-9 flex flex-wrap items-center gap-4"
          style={{ animationDelay: '240ms' }}
        >
          <a href="#rezervacija" className="btn-accent px-8 py-4 text-base">
            {t.hero.cta}
          </a>

          <p className="text-sm text-sand-200">
            <span className="text-ink-400">{t.common.from} </span>
            <span className="text-lg font-semibold text-white">
              {formatMoney(fromCents, symbol, locale)}
            </span>{' '}
            <span className="text-sand-200">/ {t.common.day}</span>
          </p>
        </div>
      </div>

      <a
        href="#o-kuci"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-widest text-white/70 transition-colors hover:text-white lg:flex"
      >
        {t.hero.scroll}
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" aria-hidden="true">
          <path
            d="M8 4v14m0 0l-5-5m5 5l5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}
