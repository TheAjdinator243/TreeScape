import { getServerStrings } from '@/lib/i18n/server';
import type { Settings } from '@/lib/types';

import { Reveal } from './Reveal';

/**
 * Harmonika je izvedena preko <details>/<summary> — preglednik već zna kako
 * se to otvara, zatvara i čita čitačem ekrana, pa ovdje nema ni reda JS-a.
 *
 * Sama pitanja žive u rječnicima: dio odgovora zavisi od postavki (vrijeme
 * prijave, broj gostiju), pa `faq.items` prima te podatke i vraća gotov tekst.
 */
export async function Faq({ settings }: { settings: Settings }) {
  const { t } = await getServerStrings();

  const items = t.faq.items({
    checkinTime: settings.checkin_time,
    checkoutTime: settings.checkout_time,
    maxGuests: settings.max_guests,
  });

  return (
    <section id="pitanja" className="bg-sand-100">
      <div className="section">
        <Reveal>
          <p className="section-eyebrow">{t.nav.faq}</p>
          <h2 className="section-title">{t.faq.heading}</h2>
          <p className="section-lead">{t.faq.lead}</p>
        </Reveal>

        <div className="mt-12 divide-y divide-sand-300 border-y border-sand-300">
          {items.map((item, i) => (
            <Reveal key={item.q} delay={Math.min(i, 5) * 50}>
              <details className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-start font-sans text-lg font-medium text-forest-900 transition-colors hover:text-forest-600 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sand-300 text-forest-700 transition-transform duration-300 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="max-w-3xl pb-6 pe-14 text-base leading-relaxed text-ink-500">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
