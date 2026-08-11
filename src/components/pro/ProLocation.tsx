import { Reveal } from '@/components/site/Reveal';
import { getServerStrings } from '@/lib/i18n/server';
import { GOOGLE_MAPS_URL, MAP_SRC, TRAVEL } from '@/lib/location';

/**
 * Lokacija.
 *
 * Karta je OpenStreetMap iframe — bez API ključa i bez naplate. Koordinate i
 * link na Google Mape stoje u `lib/location.ts`, zajedno s osnovnom verzijom.
 *
 * Karta je namjerno obezbojena i prigušena: šarena karta u punoj boji je
 * jedina stvar koja bi na ovoj stranici vikala. Vrati joj boju tek kad gost
 * pređe mišem — tada je zaista gleda.
 */
export async function ProLocation() {
  const { t } = await getServerStrings();

  return (
    <section id="lokacija" className="bg-onyx-900">
      <div className="pro-section grid gap-16 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="pro-eyebrow">{t.nav.location}</p>
          <h2 className="pro-title mt-6 text-ivory-50">{t.location.heading}</h2>
          <p className="pro-lead">{t.location.lead}</p>

          <dl className="mt-12 border-t border-ivory-100/12">
            {TRAVEL.map((row) => (
              <div
                key={row.key}
                className="flex items-baseline justify-between border-b border-ivory-100/12 py-5"
              >
                <dt className="text-[0.8rem] uppercase tracking-[0.18em] text-ivory-200">
                  {t.location.places[row.key]}
                </dt>
                <dd className="font-[family-name:var(--font-pro-display)] text-xl text-brass-300">
                  {t.location.driveTime(row.minutes)}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            // `noreferrer` uz `noopener`: bez prvog Google vidi s koje je
            // stranice gost došao, bez drugog otvorena kartica može mijenjati
            // našu preko `window.opener`.
            rel="noopener noreferrer"
            className="pro-btn-outline mt-10"
          >
            {t.location.openInMaps}
            <span className="sr-only"> ({t.location.opensInNewTab})</span>
          </a>
        </Reveal>

        <Reveal delay={120}>
          <div className="group h-[420px] overflow-hidden border border-ivory-100/12 lg:h-full lg:min-h-[560px]">
            <iframe
              title={t.location.mapTitle}
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0 grayscale-[0.85] contrast-[0.9] brightness-[0.75] transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-100"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
