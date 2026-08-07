import Image from 'next/image';

import { HERO_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';
import { formatMoney } from '@/lib/pricing';

/**
 * Naslovni ekran.
 *
 * Razlika prema osnovnoj verziji nije u sadržaju nego u držanju: tamo je tekst
 * u donjem lijevom uglu i odmah nudi dugme, ovdje stoji po sredini, s puno
 * praznine oko sebe, i ne žuri. Cijena ne viče — stoji sitno, ispod linije,
 * kao podatak a ne kao ponuda.
 */
export async function ProHero({ fromCents, symbol }: { fromCents: number; symbol: string }) {
  const { locale, t } = await getServerStrings();

  return (
    <section id="vrh" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt={t.hero.imageAlt}
        fill
        // `priority` jer je ovo prvo što posjetilac vidi — ne smije kasniti.
        priority
        sizes="100vw"
        placeholder="blur"
        className="scale-105 object-cover"
      />

      {/* Dva sloja umjesto jednog: ravna tamna opna smiruje sliku, a gradijent
          drži dno dovoljno tamnim da sitan tekst ostane čitljiv. */}
      <div className="absolute inset-0 bg-onyx-950/55" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-onyx-950/70 via-transparent to-onyx-950"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-4xl px-6 py-32 text-center sm:px-10">
        <p className="animate-fade-rise pro-eyebrow">{t.hero.eyebrow}</p>

        {/* Vlas-linija ispod nadnaslova — sitan potez koji razdvaja naslov od
            svega iznad i daje mu prostor da bude jedina stvar na ekranu. */}
        <span
          className="animate-fade-rise mx-auto mt-8 block h-px w-16 bg-brass-400/60"
          style={{ animationDelay: '60ms' }}
          aria-hidden="true"
        />

        <h1
          className="animate-fade-rise mt-8 text-[3.2rem] leading-[1.02] text-ivory-50 sm:text-7xl lg:text-[5.5rem]"
          style={{ animationDelay: '120ms' }}
        >
          {t.hero.title}
        </h1>

        <p
          className="animate-fade-rise mx-auto mt-8 max-w-xl text-base font-light leading-[1.9] text-ivory-200 sm:text-lg"
          style={{ animationDelay: '200ms' }}
        >
          {t.hero.subtitle}
        </p>

        <div
          className="animate-fade-rise mt-12 flex flex-col items-center gap-8"
          style={{ animationDelay: '280ms' }}
        >
          <a href="#rezervacija" className="pro-btn-solid">
            {t.hero.cta}
          </a>

          <p className="flex items-baseline gap-2 text-sm font-light text-ivory-200">
            <span className="text-[0.68rem] uppercase tracking-[0.24em] text-ivory-400">
              {t.common.from}
            </span>
            <span className="font-[family-name:var(--font-pro-display)] text-2xl text-ivory-50">
              {formatMoney(fromCents, symbol, locale)}
            </span>
            <span className="text-ivory-400">/ {t.common.day}</span>
          </p>
        </div>
      </div>

      <a
        href="#o-kuci"
        className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.62rem] uppercase tracking-[0.3em] text-ivory-400 transition-colors hover:text-brass-300 lg:flex"
      >
        {t.hero.scroll}
        <span className="h-10 w-px bg-gradient-to-b from-brass-400/70 to-transparent" aria-hidden="true" />
      </a>
    </section>
  );
}
