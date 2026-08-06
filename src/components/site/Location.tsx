import type { PlaceKey } from '@/lib/i18n';
import { getServerStrings } from '@/lib/i18n/server';

import { Reveal } from './Reveal';

/**
 * Karta je OpenStreetMap iframe — radi bez API ključa i bez naplate.
 * (Google Maps Embed traži ključ i naplaćuje se preko besplatne kvote.)
 *
 * Ispod je i link na Google Mape, jer većina gostiju do kuće ide njima.
 * Link ne treba ključ: otvara se u novoj kartici, kao obična adresa.
 *
 * Koordinate promijeni SAMO ovdje — i karta i link ih čitaju iz istog mjesta,
 * pa ne mogu razići jedna od druge.
 */
const MAP_MARKER = { lat: 43.92036062376055, lon: 18.281697249204257 };

/** Koliko se karte vidi oko oznake. Manji broj = više uvećano. */
const DELTA = 0.03;

const MAP_BBOX = [
  MAP_MARKER.lon - DELTA,
  MAP_MARKER.lat - DELTA / 2,
  MAP_MARKER.lon + DELTA,
  MAP_MARKER.lat + DELTA / 2,
].join(',');

const MAP_SRC =
  `https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}` +
  `&layer=mapnik&marker=${MAP_MARKER.lat},${MAP_MARKER.lon}`;

/**
 * Zvanični oblik Google linka (`?api=1`) — jedini koji Google obećava da neće
 * mijenjati. Na mobitelu ga preuzme aplikacija Mapa, na računaru se otvori u
 * pregledniku.
 */
const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${MAP_MARKER.lat}%2C${MAP_MARKER.lon}`;

/** Minute vožnje su činjenica o kući, pa stoje ovdje; nazivi su u rječnicima. */
const TRAVEL: { key: PlaceKey; minutes: number }[] = [
  { key: 'city', minutes: 35 },
  { key: 'airport', minutes: 45 },
  { key: 'shop', minutes: 8 },
  { key: 'ski', minutes: 25 },
];

export async function Location() {
  const { t } = await getServerStrings();

  return (
    <section id="lokacija" className="section">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="section-eyebrow">{t.nav.location}</p>
          <h2 className="section-title">{t.location.heading}</h2>
          <p className="section-lead">{t.location.lead}</p>

          <dl className="mt-10 divide-y divide-sand-200 border-y border-sand-200">
            {TRAVEL.map((row) => (
              <div key={row.key} className="flex items-center justify-between py-4">
                <dt className="text-base text-ink-700">{t.location.places[row.key]}</dt>
                <dd className="text-sm font-medium text-forest-700">
                  {t.location.driveTime(row.minutes)}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 rounded-xl bg-sand-100 px-5 py-4 text-sm leading-relaxed text-ink-500">
            {t.location.directions}
          </p>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            // `noreferrer` uz `noopener`: bez prvog Google vidi s koje je
            // stranice gost došao, bez drugog otvorena kartica može mijenjati
            // našu preko `window.opener`.
            rel="noopener noreferrer"
            className="btn-ghost mt-4 px-5 py-2.5 text-sm"
          >
            <PinIcon />
            {t.location.openInMaps}
            <span className="sr-only"> ({t.location.opensInNewTab})</span>
          </a>
        </Reveal>

        <Reveal delay={120}>
          <div className="h-[380px] overflow-hidden rounded-2xl border border-sand-200 shadow-soft lg:h-full lg:min-h-[460px]">
            <iframe
              title={t.location.mapTitle}
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
