import { Reveal } from '@/components/motion/Reveal';
import { getServerStrings } from '@/lib/i18n/server';
import type { Settings } from '@/lib/types';

import { SectionHead } from './SectionHead';

/**
 * Harmonika je izvedena preko <details>/<summary> — preglednik već zna kako
 * se to otvara, zatvara i čita čitačem ekrana, pa ovdje nema ni reda JS-a.
 * Jedino što je dodano je pokret pri otvaranju (`.qa` u globals.css).
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
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead index={6} label={t.nav.faq} title={t.faq.heading} lead={t.faq.lead} />
          </div>

          <div className="border-t border-sand-300">
            {items.map((item, i) => (
              <Reveal key={item.q} delay={Math.min(i, 5) * 60}>
                <details className="qa group border-b border-sand-300">
                  <summary className="flex cursor-pointer list-none items-baseline gap-5 py-6 text-start transition-colors [&::-webkit-details-marker]:hidden">
                    <span className="shrink-0 text-xs text-ink-400 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="flex-1 font-display text-xl leading-snug text-forest-900 transition-colors group-hover:text-forest-600 md:text-2xl">
                      {item.q}
                    </span>

                    <span
                      className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sand-300 text-forest-700 transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-out-expo)] group-hover:border-forest-600/40 group-open:rotate-45 group-open:border-forest-700 group-open:bg-forest-700 group-open:text-sand-50"
                      aria-hidden="true"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>

                  <p className="qa-body max-w-2xl pb-7 ps-10 pe-12 text-base leading-[1.75] text-ink-500">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
