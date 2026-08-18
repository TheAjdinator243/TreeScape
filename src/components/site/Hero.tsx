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
    <section id="vrh" className="relative flex min-h-[94svh] flex-col justify-end overflow-hidden">
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
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bark-950 via-bark-950/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-32 sm:px-8">
        <p className="head-tag animate-fade-rise text-moss-300">
          <span className="head-rule" style={{ transform: 'scaleX(1)' }} aria-hidden="true" />
          {t.hero.eyebrow}
        </p>

        <h1 className="mt-6 text-[clamp(3rem,1.5rem+7.5vw,7rem)] leading-[0.94] tracking-[-0.035em] text-white">
          <Lines text={t.hero.title} delay={260} step={110} />
        </h1>

        <p
          className="animate-fade-rise mt-6 max-w-lg text-lg leading-relaxed text-sand-100 sm:text-xl"
          style={{ animationDelay: '520ms' }}
        >
          {t.hero.subtitle}
        </p>

        <div
          className="animate-fade-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-4"
          style={{ animationDelay: '640ms' }}
        >
          <a href="#rezervacija" className="btn-accent px-8 py-4 text-base">
            {t.hero.cta}
          </a>

          <p className="flex items-baseline gap-2 text-sm text-sand-200">
            <span className="uppercase tracking-[0.18em] text-sand-300/80">{t.common.from}</span>
            <span className="font-display text-2xl text-white">
              {formatMoney(fromCents, symbol, locale)}
            </span>
            <span className="text-sand-200/80">/ {t.common.day}</span>
          </p>
        </div>
      </div>

      {/*
        Vlas-crta preko cijelog dna, s nagovještajem za skrol na početku reda i
        veličinom kuće na kraju. Bez nje bi naslovni ekran bio samo fotografija
        s tekstom; s njom ima dno, pa i mjeru — a gost odmah zna prima li kuća
        njegovo društvo, prije nego što otvori i jedan odjeljak.
      */}
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div
          className="animate-fade-rise flex items-center justify-between gap-6 border-t border-white/20 py-5 text-xs uppercase tracking-[0.18em] text-white/70"
          style={{ animationDelay: '760ms' }}
        >
          <a
            href="#o-kuci"
            className="group flex shrink-0 items-center gap-3 whitespace-nowrap transition-colors hover:text-white"
          >
            <span className="relative hidden h-6 w-px overflow-hidden bg-white/25 sm:block">
              <span className="animate-scroll-hint absolute inset-x-0 top-0 h-2 bg-white" />
            </span>
            {t.hero.scroll}
          </a>

          {/* Na telefonu ovoga nema: uz razmaknuta velika slova dva podatka ne
              stanu u red pored nagovještaja za skrol, a skraćena rečenica je
              gora od nikakve. Isti podaci stoje odmah ispod, u "O kući". */}
          <p className="hidden whitespace-nowrap text-end sm:block">
            <span className="text-white">8</span> {t.about.stats.guests}
            <span className="mx-2 text-white/30">·</span>
            <span className="text-white">2</span> {t.about.stats.bedrooms}
          </p>
        </div>
      </div>
    </section>
  );
}
