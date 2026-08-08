import { AmenityIcon } from '@/components/site/AmenityIcon';
import { Reveal } from '@/components/site/Reveal';
import { AMENITIES } from '@/lib/amenities';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * Sadržaji kuće.
 *
 * Osnovna verzija ih slaže u kolone s krugovima oko ikona. Ovdje su ćelije
 * mreže razdvojene vlas-linijama, bez ijedne pozadine i bez ijednog kruga —
 * izgleda kao stranica iz kataloga, a ne kao spisak osobina.
 *
 * Ovo je jedina svijetla ploha na cijeloj stranici. Sve ostalo je noć, pa
 * jedan svijetli odsječak po sredini drži oko i razdvaja gornju polovinu
 * (kuća) od donje (rezervacija).
 */
export async function ProAmenities() {
  const { t } = await getServerStrings();

  return (
    <section id="sadrzaji" className="bg-ivory-50 text-onyx-900">
      <div className="pro-section">
        <Reveal className="max-w-2xl">
          <p className="pro-eyebrow text-brass-500">{t.site.name}</p>
          <h2 className="pro-title mt-6 text-onyx-900">{t.amenities.heading}</h2>
          <p className="pro-lead text-onyx-800/70">{t.amenities.lead}</p>
        </Reveal>

        {/*
          Linije se crtaju po ćelijama, a NE pozadinom mreže.

          Prvi pokušaj je bio obrnut — mreža u boji linije, ćelije preko nje s
          razmakom od piksela. Izgleda tačno dok se red popuni do kraja; sadržaja
          je 14, a kolona tri, pa zadnji red ima jedno prazno mjesto — i ono je
          ostajalo kao siv pravougaonik, jer se kroz njega vidjela pozadina mreže.
          Ovako praznog mjesta jednostavno nema.
        */}
        <ul className="mt-16 grid border-s border-t border-ivory-200 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map((key, i) => (
            <li key={key} className="border-b border-e border-ivory-200">
              <Reveal delay={Math.min(i, 8) * 45} className="h-full">
                <div className="flex h-full flex-col p-8 lg:p-10">
                  <span className="text-brass-500 [&_svg]:h-6 [&_svg]:w-6" aria-hidden="true">
                    <AmenityIcon name={key} />
                  </span>

                  <h3 className="pro-sans mt-6 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-onyx-900">
                    {t.amenities.items[key].label}
                  </h3>

                  <p className="mt-3 text-base font-light leading-[1.85] text-onyx-800/60">
                    {t.amenities.items[key].note}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
