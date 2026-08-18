import { Reveal } from '@/components/motion/Reveal';
import { getServerStrings } from '@/lib/i18n/server';
import { GOOGLE_MAPS_URL, MAP_SRC, TRAVEL } from '@/lib/location';

import { SectionHead } from './SectionHead';

export async function Location() {
  const { t } = await getServerStrings();

  return (
    <section id="lokacija" className="section">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <SectionHead
            index={5}
            label={t.nav.location}
            title={t.location.heading}
            lead={t.location.lead}
          />

          <Reveal delay={140}>
            {/*
              Vremena vožnje kao spisak s vlas-crtama, a ne kao kartice: ovo su
              tri broja, a tri kartice bi im dale težinu koju nemaju.
            */}
            <dl className="mt-12 border-t border-sand-200">
              {TRAVEL.map((row) => (
                <div
                  key={row.key}
                  className="flex items-baseline justify-between gap-6 border-b border-sand-200 py-5"
                >
                  <dt className="text-base text-ink-700">{t.location.places[row.key]}</dt>
                  <dd className="font-display text-lg text-forest-700 tabular-nums">
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
              className="btn-ghost mt-8"
            >
              <PinIcon />
              {t.location.openInMaps}
              <span className="sr-only"> ({t.location.opensInNewTab})</span>
            </a>
          </Reveal>
        </div>

        <Reveal variant="mask" delay={100}>
          <div className="h-[420px] overflow-hidden rounded-frame border border-sand-200 shadow-soft lg:h-full lg:min-h-[520px]">
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
