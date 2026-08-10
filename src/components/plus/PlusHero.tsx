import Image from 'next/image';

import { Parallax } from '@/components/motion/Parallax';
import { TextReveal } from '@/components/motion/TextReveal';
import { formatLong, todayStr } from '@/lib/dates';
import { HERO_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';
import { formatMoney } from '@/lib/pricing';

/**
 * Naslovni ekran.
 *
 * Fotografija se pri skrolanju kreće sporije od teksta preko nje (`Parallax`),
 * a pri učitavanju se jednom, polako, vrati iz uvećanja. Oba pokreta su čist
 * `transform` — ništa se ne prerasporedi, pa naslov ne treperi dok slika radi.
 *
 * Naslov se ispisuje riječ po riječ, ali BEZ ijednog reda JavaScripta: odgoda
 * po riječi je obična CSS animacija (vidi `motion/TextReveal.tsx`). Naslovni
 * ekran je jedino mjesto gdje kašnjenje od pola sekunde stvarno smeta, pa je
 * baš ovdje i najmanje koda.
 *
 * Traka s podacima ispod dugmadi nije ukras: `firstFree` je prvi stvarno
 * slobodan datum iz istih termina koje crta kalendar niže, pa "provjeri
 * dostupnost" ima odgovor i prije nego se klikne.
 */
export async function PlusHero({
  fromCents,
  symbol,
  firstFree,
}: {
  fromCents: number;
  symbol: string;
  /** Prvi slobodan datum, ili `null` ako slobodnog nema u naredne dvije godine. */
  firstFree: string | null;
}) {
  const { locale, t } = await getServerStrings();

  const freeToday = firstFree === todayStr();

  const facts = [
    { value: '8', label: t.about.stats.guests },
    { value: '2', label: t.about.stats.bedrooms },
    { value: '2', label: t.about.stats.bathrooms },
  ];

  return (
    <section id="vrh" className="relative flex min-h-[94svh] items-end overflow-hidden">
      {/* Slika je viša od svog okvira (`-inset-y-16`): bez tog viška bi se pri
          paralaksi vidio rub ispod nje. */}
      <Parallax speed={0.14} className="absolute -inset-y-16 inset-x-0">
        <div className="animate-slow-zoom relative h-full w-full">
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
        </div>
      </Parallax>

      {/* Tri sloja umjesto jednog gradijenta: ravna opna smiruje fotografiju,
          gradijent odozdo drži tekst čitljivim, a onaj odozgo daje navigaciji
          podlogu koja se ne vidi kao traka. */}
      <div className="absolute inset-0 bg-pine-950/30" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-pine-950/92 via-pine-950/35 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-pine-950/55 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-32 sm:px-8 sm:pb-20 md:pb-28">
        <p className="animate-fade-rise plus-sans flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-sage-300">
          <span className="h-px w-8 bg-sage-300/50" aria-hidden="true" />
          {t.hero.eyebrow}
        </p>

        <TextReveal
          as="h1"
          text={t.hero.title}
          delay={120}
          className="mt-5 block text-[3.6rem] leading-[1] text-white sm:text-7xl md:text-8xl lg:text-[7.5rem]"
        />

        <p
          className="animate-fade-rise mt-6 max-w-xl text-lg leading-relaxed text-paper-100 sm:text-xl"
          style={{ animationDelay: '260ms' }}
        >
          {t.hero.subtitle}
        </p>

        <div
          className="animate-fade-rise mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          style={{ animationDelay: '340ms' }}
        >
          {/*
            Na telefonu su dugmad jedno ispod drugog i preko cijele širine.
            Dvije pilule različite širine, poredane jedna ispod druge uz lijevu
            ivicu, izgledaju kao greška — a i palac ih teže pogodi.
          */}
          <a href="#rezervacija" className="plus-btn-accent px-8 py-4 text-base">
            {t.hero.cta}
          </a>
          <a href="#galerija" className="plus-btn-onlight px-7 py-4 text-base">
            {t.hero.secondaryCta}
          </a>
        </div>

        {/*
          Podaci u jednom redu.

          Na telefonu se red prelama, pa razdvajanje NE smije biti okvir na
          svakoj stavci — prelomljene ivice bi izgledale kao razbijena tabela.
          Zato razmak, a ne linije.
        */}
        <dl
          className="animate-fade-rise mt-10 flex flex-wrap items-baseline gap-x-7 gap-y-3 text-paper-100 sm:gap-x-9"
          style={{ animationDelay: '420ms' }}
        >
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{fact.label}</dt>
              <dd className="flex items-baseline gap-2">
                <span
                  className="text-2xl text-white"
                  style={{ fontFamily: 'var(--font-plus-display)' }}
                >
                  {fact.value}
                </span>
                <span className="text-sm text-paper-200/85">{fact.label}</span>
              </dd>
            </div>
          ))}

          <div className="flex items-baseline gap-2">
            <dt className="text-sm text-paper-200/85">{t.common.from}</dt>
            <dd className="flex items-baseline gap-1.5">
              <span
                className="text-2xl text-white"
                style={{ fontFamily: 'var(--font-plus-display)' }}
              >
                {formatMoney(fromCents, symbol, locale)}
              </span>
              <span className="text-sm text-paper-200/85">/ {t.common.day}</span>
            </dd>
          </div>
        </dl>

        {/* Prvi slobodan datum — isti podatak koji crta kalendar niže, samo
            izračunat unaprijed. Nema ga jedino ako je sve zauzeto dvije godine
            unaprijed, pa se tada red i ne ispisuje. */}
        {firstFree && (
          <p
            className="animate-fade-rise plus-chip-onlight mt-6"
            style={{ animationDelay: '500ms' }}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-pulse-ring absolute inset-0 rounded-full bg-sage-400" />
              <span className="relative h-2 w-2 rounded-full bg-sage-400" />
            </span>
            {freeToday ? t.hero.freeToday : t.hero.freeFrom(formatLong(firstFree, locale))}
          </p>
        )}
      </div>

      <a
        href="#o-kuci"
        className="plus-sans absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.7rem] uppercase tracking-[0.25em] text-white/65 transition-colors hover:text-white lg:flex"
      >
        {t.hero.scroll}
        {/* Crtica koja klizne niz liniju umjesto strelice koja poskakuje —
            isti nagovještaj, upola manje pokreta na ekranu. */}
        <span className="relative block h-10 w-px overflow-hidden bg-white/25" aria-hidden="true">
          <span className="animate-scroll-hint absolute inset-x-0 top-0 block h-4 bg-white/90" />
        </span>
      </a>
    </section>
  );
}
