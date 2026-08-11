import { getServerStrings } from '@/lib/i18n/server';
import { GOOGLE_MAPS_URL, MAP_SRC, TRAVEL } from '@/lib/location';

import { Reveal } from './Reveal';

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
