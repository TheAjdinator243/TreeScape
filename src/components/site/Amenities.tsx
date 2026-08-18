import { Reveal } from '@/components/motion/Reveal';
import { AMENITIES } from '@/lib/amenities';
import { getServerStrings } from '@/lib/i18n/server';

import { AmenityIcon } from './AmenityIcon';
import { SectionHead } from './SectionHead';

/**
 * Šta vas čeka.
 *
 * Četrnaest sadržaja u karticama izgleda kao zid; u dva stupca redova s
 * vlas-crtom između — kao spisak u katalogu. Kartica svakom sadržaju daje
 * jednaku težinu i pravougaonik oko njega, a red ne daje ništa osim samog
 * sadržaja.
 *
 * Redovi se pale naizmjenično, lijevi pa desni, umjesto svi odjednom: oko tako
 * prati spisak nadolje kako bi ga i inače čitalo.
 */
export async function Amenities() {
  const { t } = await getServerStrings();

  return (
    <section id="sadrzaji" className="grain relative bg-forest-900">
      <div className="section relative z-[2]">
        <SectionHead
          index={3}
          label={t.site.name}
          title={t.amenities.heading}
          lead={t.amenities.lead}
          tone="dark"
        />

        <ul className="mt-16 grid gap-x-14 sm:grid-cols-2">
          {AMENITIES.map((key, i) => (
            // `Reveal` je unutar `<li>`, a ne oko njega: u `<ul>` smiju stajati
            // samo `<li>`, pa bi omotač izvana bio neispravan HTML — i čitač
            // ekrana bi izgubio broj stavki u spisku.
            <li key={key}>
              <Reveal
                // Kašnjenje po REDU spiska, ne po rednom broju stavke: u dva
                // stupca stavke 1 i 2 stoje jedna pored druge, pa moraju krenuti
                // zajedno. Bez ovoga bi desni stupac vidljivo kaskao za lijevim.
                delay={Math.min(Math.floor(i / 2), 6) * 70}
                className="index-row"
              >
                <span className="index-icon" aria-hidden="true">
                  <AmenityIcon name={key} />
                </span>

                <span className="min-w-0">
                  <span className="block font-sans text-[0.95rem] font-semibold text-sand-50">
                    {t.amenities.items[key].label}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-moss-300/75">
                    {t.amenities.items[key].note}
                  </span>
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
