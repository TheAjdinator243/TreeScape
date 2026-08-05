import { t } from '@/lib/strings';

import { Reveal } from './Reveal';

/**
 * Karta je OpenStreetMap iframe — radi bez API ključa i bez naplate.
 * (Google Maps Embed traži ključ i naplaćuje se preko besplatne kvote.)
 *
 * Kad znaš tačne koordinate kuće, promijeni `MAP_BBOX` i `MAP_MARKER` ispod.
 * Koordinate lako nađeš na openstreetmap.org — desni klik → "Show address".
 */
const MAP_MARKER = { lat: 43.8563, lon: 18.4131 }; // trenutno: Sarajevo, primjer
const DELTA = 0.06;

const MAP_BBOX = [
  MAP_MARKER.lon - DELTA,
  MAP_MARKER.lat - DELTA / 2,
  MAP_MARKER.lon + DELTA,
  MAP_MARKER.lat + DELTA / 2,
].join(',');

const MAP_SRC =
  `https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}` +
  `&layer=mapnik&marker=${MAP_MARKER.lat},${MAP_MARKER.lon}`;

const TRAVEL = [
  { label: 'Sarajevo', time: '35 min vožnje' },
  { label: 'Aerodrom', time: '45 min vožnje' },
  { label: 'Najbliža prodavnica', time: '8 min vožnje' },
  { label: 'Skijalište', time: '25 min vožnje' },
];

export function Location() {
  return (
    <section id="lokacija" className="section">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="section-eyebrow">{t.nav.location}</p>
          <h2 className="section-title">{t.location.heading}</h2>
          <p className="section-lead">{t.location.lead}</p>

          <dl className="mt-10 divide-y divide-sand-200 border-y border-sand-200">
            {TRAVEL.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-4">
                <dt className="text-base text-ink-700">{row.label}</dt>
                <dd className="text-sm font-medium text-forest-700">{row.time}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 rounded-xl bg-sand-100 px-5 py-4 text-sm leading-relaxed text-ink-500">
            {t.location.directions}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="h-[380px] overflow-hidden rounded-2xl border border-sand-200 shadow-soft lg:h-full lg:min-h-[460px]">
            <iframe
              title="Karta lokacije vile TreeScape"
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
