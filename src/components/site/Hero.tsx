import Image from 'next/image';

import { Lines } from '@/components/motion/Lines';
import { Parallax } from '@/components/motion/Parallax';
import { HERO_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';
import { formatMoney } from '@/lib/pricing';

/**
 * Naslovni ekran.
 *
 * Fotografija se pri učitavanju jednom polako vrati iz uvećanja, a zatim, dok
 * se skrola, klizi kroz svoj okvir sporije od stranice. Dva različita pokreta
 * na istoj slici, a nikad u isto vrijeme: prvi traje tri sekunde i dešava se
 * dok gost još ništa nije uradio, drugi tek kad krene dalje.
 *
 * Naslov se otkriva red po red. Ne čeka skrol — on je jedino što gost vidi
 * prvih par sekundi, pa bi čekanje značilo prazan ekran.
 */
export async function Hero({ fromCents, symbol }: { fromCents: number; symbol: string }) {
  const { locale, t } = await getServerStrings();

  return (
    <section
      id="vrh"
      className="grain relative flex min-h-[96svh] flex-col justify-end overflow-hidden"
    >
      <Parallax className="absolute inset-0" speed={0.18}>
        <Image
          src={HERO_IMAGE}
          alt={t.hero.imageAlt}
          fill
          // `priority` jer je ovo prvo što posjetilac vidi — ne smije kasniti.
          priority
          sizes="100vw"
          placeholder="blur"
          className="animate-slow-zoom object-cover"
        />
      </Parallax>

      {/*
        Dva sloja zatamnjenja, a ne jedan.

        Jedan gradijent preko cijele slike ili pojede nebo ili ostavi tekst
        nečitljivim nad svijetlim dijelom fotografije. Prvi sloj je ravnomjeran
        i vrlo blag — on samo spusti cijelu sliku za koji ton. Drugi je gust
        samo pri dnu, tamo gdje tekst zaista stoji.
      */}
      <div className="absolute inset-0 bg-bark-950/25" aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-bark-950 via-bark-950/65 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-[2] mx-auto w-full max-w-6xl px-5 pb-12 pt-32 sm:px-8 md:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="head-tag animate-fade-rise text-moss-300">
              <span className="head-rule" style={{ transform: 'scaleX(1)' }} aria-hidden="true" />
              {t.hero.eyebrow}
            </p>

            <h1 className="mt-6 text-[clamp(3.25rem,1.5rem+8vw,7.5rem)] leading-[0.92] tracking-[-0.04em] text-white">
              <Lines text={t.hero.title} delay={260} step={110} />
            </h1>

            <p
              className="animate-fade-rise mt-7 max-w-md text-lg leading-relaxed text-sand-100"
              style={{ animationDelay: '520ms' }}
            >
              {t.hero.subtitle}
            </p>
          </div>

          {/*
            Ploča od stakla s cijenom i mjerom kuće.

            Cijena je jedini podatak zbog kojeg se gost i zaustavio, pa ne smije
            biti red teksta ispod dugmeta nego zasebna stvar koja pluta nad
            fotografijom. Staklo je ovdje jedini način da ta ploča bude i
            čitljiva i da se kroz nju i dalje vidi slika — puna boja bi na
            fotografiji izgledala kao nalijepljena naljepnica.
          */}
          <div
            className="glass-dark animate-fade-rise w-full rounded-float p-6 shadow-lift lg:w-[19rem]"
            style={{ animationDelay: '640ms' }}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sand-300/80">
              {t.common.from}
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-4xl leading-none text-white">
                {formatMoney(fromCents, symbol, locale)}
              </span>
              <span className="text-sm text-sand-200/80">/ {t.common.day}</span>
            </p>

            <dl className="mt-5 flex gap-6 border-t border-white/15 pt-4 text-xs text-sand-200/80">
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
      </div>

      <div className="relative z-[2] mx-auto w-full max-w-6xl px-5 sm:px-8">
        <a
          href="#o-kuci"
          className="animate-fade-rise group mb-8 flex w-fit items-center gap-3 whitespace-nowrap text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
          style={{ animationDelay: '760ms' }}
        >
          <span className="relative h-6 w-px overflow-hidden bg-white/25">
            <span className="animate-scroll-hint absolute inset-x-0 top-0 h-2 bg-white" />
          </span>
          {t.hero.scroll}
        </a>
      </div>
    </section>
  );
}
