import Image from 'next/image';

import { Lines } from '@/components/motion/Lines';
import { HERO_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';
import { formatMoney } from '@/lib/pricing';

/**
 * Naslovni ekran.
 *
 * Fotografija se vidi CIJELA — puna širina, u svom vlastitom omjeru, i nikad
 * odsječena ni na jednom ekranu. Zbog toga ovdje nema ni `object-cover`, ni
 * paralakse, ni polaganog uvećavanja: sve troje rade tako što sliku uvećaju
 * preko okvira i višak odsijeku, a upravo taj višak je ono što se htjelo vidjeti.
 *
 * Statički uvezena slika nosi svoje dimenzije, pa `w-full h-auto` sam pogodi
 * visinu u svakoj širini — bez ijednog broja upisanog rukom i bez trzaja dok
 * se učitava.
 *
 * Tekst zato stoji ISPOD slike, na tamnoj plohi, a ne preko nje. Traka s
 * tekstom uzima ono što na ekranu preostane iza fotografije (`flex-1`), pa je
 * na telefonu visoka a na širokom ekranu tek onoliko koliko sadržaju treba.
 */
export async function Hero({ fromCents, symbol }: { fromCents: number; symbol: string }) {
  const { locale, t } = await getServerStrings();

  return (
    <section id="vrh" className="grain relative flex min-h-[96svh] flex-col bg-coal-950">
      <Image
        src={HERO_IMAGE}
        alt={t.hero.imageAlt}
        // `priority` jer je ovo prvo što posjetilac vidi — ne smije kasniti.
        priority
        sizes="100vw"
        placeholder="blur"
        className="w-full"
      />

      <div className="relative z-[2] flex flex-1 flex-col justify-end">
        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-12 sm:px-8 md:pt-16">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="head-tag animate-fade-rise text-taupe-300">
                <span className="head-rule" style={{ transform: 'scaleX(1)' }} aria-hidden="true" />
                {t.hero.eyebrow}
              </p>

              <h1 className="mt-6 text-[clamp(3rem,1.5rem+7vw,6.5rem)] leading-[0.94] tracking-[-0.04em] text-white">
                <Lines text={t.hero.title} delay={200} step={110} />
              </h1>

              <p
                className="animate-fade-rise mt-6 max-w-md text-lg leading-relaxed text-cream-100"
                style={{ animationDelay: '460ms' }}
              >
                {t.hero.subtitle}
              </p>
            </div>

            {/*
              Ploča s cijenom.

              Cijena je jedini podatak zbog kojeg se gost i zaustavio, pa ne
              smije biti red teksta ispod dugmeta nego zasebna stvar. Staklo je
              zadržano i sada kad ispod nje nije fotografija nego tamna ploha —
              tanki svijetli okvir je odiže taman toliko da se ne stopi s njom.
            */}
            <div
              className="glass-dark animate-fade-rise w-full rounded-float p-6 shadow-lift lg:w-[19rem]"
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
          </div>

          <a
            href="#o-kuci"
            className="animate-fade-rise group mt-10 flex w-fit items-center gap-3 whitespace-nowrap text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
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
