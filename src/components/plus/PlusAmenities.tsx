import { LineReveal } from '@/components/motion/LineReveal';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { AmenityIcon } from '@/components/site/AmenityIcon';
import { AMENITIES } from '@/lib/amenities';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * Sadržaji kuće.
 *
 * Jedina tamna ploha na cijeloj stranici, i to namjerno: ovdje se stranica
 * prelama s "kako kuća izgleda" na "kako se rezerviše", pa je zaokret u boji
 * ono što ta dva dijela razdvaja jasnije od bilo kakvog razmaka.
 *
 * Pozadina nije ravna boja nego dvije vrlo blage svjetlosne mrlje preko
 * zimzelene. Ravna tamna ploha na velikom ekranu izgleda kao rupa; ove dvije
 * mrlje joj daju dubinu, a dovoljno su prigušene da se ne primijete kao
 * gradijent. Sve je CSS — nema slike koja se preuzima.
 */
export async function PlusAmenities() {
  const { t } = await getServerStrings();

  return (
    <section id="sadrzaji" className="relative overflow-hidden bg-pine-900 text-paper-100">
      {/* Svjetlosne mrlje se kreću BRŽE od sadržaja preko njih (negativna
          brzina), pa ploha dobija dubinu: tekst kao da stoji ispred svjetla,
          a ne na njemu. Ploha je viša od odjeljka da se pri pomjeranju ne vidi
          gdje mrlje prestaju. */}
      <Parallax speed={-0.12} className="pointer-events-none absolute -inset-y-24 inset-x-0">
        <div
          aria-hidden="true"
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(60% 55% at 15% 0%, rgb(58 122 96 / 0.28), transparent 70%),' +
              'radial-gradient(45% 45% at 90% 100%, rgb(184 106 65 / 0.16), transparent 70%)',
          }}
        />
      </Parallax>

      <div className="plus-section relative">
        <Reveal>
          <p className="plus-eyebrow-onlight">{t.site.name}</p>
        </Reveal>
        <LineReveal as="h2" className="plus-title text-paper-50" text={t.amenities.heading} />
        <LineReveal
          as="p"
          className="plus-lead text-paper-200/75"
          text={t.amenities.lead}
          delay={120}
          stagger={70}
        />

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map((key, i) => (
            <Reveal
              key={key}
              as="li"
              // Kašnjenje staje na devetoj: sadržaja je četrnaest, a kolona
              // tri — posljednji red je već na ekranu dok bi po redu tek čekao.
              delay={Math.min(i, 8) * 45}
              className="group h-full rounded-2xl border border-paper-100/10 bg-paper-100/[0.04] p-6 transition-[background-color,border-color] duration-500 hover:border-paper-100/20 hover:bg-paper-100/[0.07]"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-paper-100/10 text-sage-300 transition-colors duration-500 group-hover:text-clay-400"
                aria-hidden="true"
              >
                <AmenityIcon name={key} />
              </span>

              <h3 className="plus-sans mt-5 text-base font-semibold text-paper-50">
                {t.amenities.items[key].label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-200/65">
                {t.amenities.items[key].note}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
