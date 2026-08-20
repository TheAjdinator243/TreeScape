import Image from 'next/image';

import { Lines } from '@/components/motion/Lines';
import { HERO_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';
import { formatMoney } from '@/lib/pricing';

/**
 * Naslovni ekran.
 *
 * Fotografija se vidi CIJELA — nikad odsječena, i nikad ispod ruba ekrana.
 * Zbog toga ovdje nema ni `object-cover`, ni paralakse, ni polaganog
 * uvećavanja: sve troje rade tako što sliku uvećaju preko okvira i višak
 * odsijeku, a upravo taj višak je ono što se htjelo vidjeti.
 *
 * ── Zašto je raspored razdvojen na širokom ekranu ─────────────────────────
 * Fotografija je 4:3, a ekran računara je bliži 2:1. Preko cijele širine njena
 * bi visina bila veća od visine ekrana — na 1920px to je 1440px slike u 980px
 * prozora, pa bi joj donja trećina (bazen i kuća, dakle poenta) pala ispod ruba
 * i vidjela bi se tek kad gost skrola.
 *
 * Rješenje nije sjeći sliku nego joj SUZITI stupac. Ono što tada pored nje
 * ostane nije prazan prostor nego mjesto za naslov i cijenu — pa se cijeli
 * naslovni ekran stane u jedan pogled: i cijela slika, i sve što uz nju treba
 * pisati, bez ijednog okretaja točkića.
 *
 * Na telefonu je ekran uspravan, pa je red obrnut: slika gore preko cijele
 * širine, tekst ispod nje. Tamo dva stupca ne bi ni stala.
 */
export async function Hero({ fromCents, symbol }: { fromCents: number; symbol: string }) {
  const { locale, t } = await getServerStrings();

  return (
    <section
      id="vrh"
      className="grain relative flex min-h-[100svh] flex-col bg-coal-950 lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:pb-10 lg:pt-24 xl:gap-16"
    >
      {/*
        `lg:order-2` — u kodu slika ide PRVA jer je na telefonu prva na ekranu,
        a na širokom ekranu se premješta udesno. Redoslijed u kodu prati čitanje
        na užem ekranu, gdje ga čitač ekrana i prati.
      */}
      <div className="relative z-[2] lg:order-2 lg:w-[56%] xl:w-[58%]">
        <Image
          src={HERO_IMAGE}
          alt={t.hero.imageAlt}
          // `priority` jer je ovo prvo što posjetilac vidi — ne smije kasniti.
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          placeholder="blur"
          /*
           * `max-h` je zaštita za vrlo široke ekrane: tamo bi i suženi stupac
           * dao sliku višu od prozora. `object-contain` uz njega znači da se
           * slika u tom slučaju smanji, a ne odsiječe.
           */
          className="mx-auto h-auto w-full object-contain lg:max-h-[76svh] lg:rounded-frame"
        />
      </div>

      <div className="relative z-[2] flex flex-1 flex-col justify-end lg:order-1 lg:justify-center">
        <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-12 sm:px-8 lg:mx-0 lg:ms-auto lg:px-0 lg:pb-0 lg:pt-0">
          <p className="head-tag animate-fade-rise text-taupe-300">
            <span className="head-rule" style={{ transform: 'scaleX(1)' }} aria-hidden="true" />
            {t.hero.eyebrow}
          </p>

          <h1 className="mt-6 text-[clamp(3rem,1.2rem+6vw,5.5rem)] leading-[0.94] tracking-[-0.04em] text-white">
            <Lines text={t.hero.title} delay={200} step={110} />
          </h1>

          <p
            className="animate-fade-rise mt-6 max-w-md text-lg leading-relaxed text-cream-100"
            style={{ animationDelay: '460ms' }}
          >
            {t.hero.subtitle}
          </p>

          {/*
            Ploča s cijenom.

            Cijena je jedini podatak zbog kojeg se gost i zaustavio, pa ne smije
            biti red teksta ispod dugmeta nego zasebna stvar. Staklo je zadržano
            i sada kad ispod nje nije fotografija nego tamna ploha — tanki
            svijetli okvir je odiže taman toliko da se ne stopi s njom.
          */}
          <div
            className="glass-dark animate-fade-rise mt-9 w-full rounded-float p-6 shadow-lift sm:max-w-sm"
            style={{ animationDelay: '580ms' }}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-cream-300/80">
              {t.common.from}
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-4xl leading-none text-white">
                {formatMoney(fromCents, symbol, locale)}
              </span>
              <span className="text-sm text-cream-200/80">/ {t.common.day}</span>
            </p>

            <dl className="mt-5 flex gap-6 border-t border-white/15 pt-4 text-xs text-cream-200/80">
              <div>
                <dt className="sr-only">{t.about.stats.guests}</dt>
                <dd>
                  <span className="font-display text-lg text-white">8</span>{' '}
                  {t.about.stats.guests}
                </dd>
              </div>
              <div>
                <dt className="sr-only">{t.about.stats.bedrooms}</dt>
                <dd>
                  <span className="font-display text-lg text-white">2</span>{' '}
                  {t.about.stats.bedrooms}
                </dd>
              </div>
            </dl>

            <a href="#rezervacija" className="btn-accent mt-6 w-full">
              {t.hero.cta}
            </a>
          </div>

          <a
            href="#o-kuci"
            className="animate-fade-rise group mt-9 flex w-fit items-center gap-3 whitespace-nowrap text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
            style={{ animationDelay: '700ms' }}
          >
            <span className="relative h-6 w-px overflow-hidden bg-white/25">
              <span className="animate-scroll-hint absolute inset-x-0 top-0 h-2 bg-white" />
            </span>
            {t.hero.scroll}
          </a>
        </div>
      </div>
    </section>
  );
}
