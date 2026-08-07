import { Reveal } from '@/components/site/Reveal';
import { getServerStrings } from '@/lib/i18n/server';
import type { Settings } from '@/lib/types';

/**
 * Česta pitanja.
 *
 * Harmonika je izvedena preko <details>/<summary> — preglednik već zna kako se
 * to otvara, zatvara i čita čitačem ekrana, pa ovdje nema ni reda JS-a.
 *
 * Sama pitanja žive u rječnicima: dio odgovora zavisi od postavki (vrijeme
 * prijave, broj gostiju), pa `faq.items` prima te podatke i vraća gotov tekst.
 *
 * Umjesto kruga s plusom stoji tanka crta koja se pri otvaranju okrene u
 * minus — isti pokret, upola manje ukrasa.
 */
export async function ProFaq({ settings }: { settings: Settings }) {
  const { t } = await getServerStrings();

  const items = t.faq.items({
    checkinTime: settings.checkin_time,
    checkoutTime: settings.checkout_time,
    maxGuests: settings.max_guests,
  });

  return (
    <section id="pitanja" className="bg-onyx-950">
      <div className="pro-section grid gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="pro-eyebrow">{t.nav.faq}</p>
          <h2 className="pro-title mt-6 text-ivory-50">{t.faq.heading}</h2>
          <p className="pro-lead">{t.faq.lead}</p>
        </Reveal>

        <div className="border-t border-ivory-100/12">
          {items.map((item, i) => (
            <Reveal key={item.q} delay={Math.min(i, 5) * 50}>
              <details className="group border-b border-ivory-100/12">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-8 py-7 text-start text-lg font-light text-ivory-50 transition-colors hover:text-brass-300 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="relative h-4 w-4 shrink-0" aria-hidden="true">
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brass-400" />
                    <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-brass-400 transition-transform duration-300 group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-8 pe-10 text-[0.95rem] font-light leading-[1.95] text-ivory-200/75">
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
