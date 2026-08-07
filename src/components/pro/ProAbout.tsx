import Image from 'next/image';

import { Reveal } from '@/components/site/Reveal';
import { ABOUT_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * O kući.
 *
 * Raspored je namjerno nesimetričan: slika ide preko ivice mreže i viša je od
 * teksta pored sebe. Uredno poravnate dvije kolone izgledaju kao katalog;
 * pomak od par koraka izgleda kao časopis.
 */
export async function ProAbout() {
  const { t } = await getServerStrings();

  const stats = [
    { value: '8', label: t.about.stats.guests },
    { value: '2', label: t.about.stats.bedrooms },
    { value: '2', label: t.about.stats.bathrooms },
  ];

  return (
    <section id="o-kuci" className="bg-onyx-950">
      <div className="pro-section grid gap-16 lg:grid-cols-12 lg:gap-20">
        <Reveal className="lg:col-span-5 lg:pt-16">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={ABOUT_IMAGE}
              alt={t.about.imageAlt}
              fill
              placeholder="blur"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-7">
          <p className="pro-eyebrow">{t.site.tagline}</p>
          <h2 className="pro-title mt-6 text-ivory-50">{t.about.heading}</h2>
          <p className="pro-lead">{t.about.lead}</p>

          <div className="mt-10 max-w-xl space-y-6 text-[0.95rem] font-light leading-[1.95] text-ivory-200/80">
            {t.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Brojevi u tankom serifu i velikoj veličini — ista tri podatka kao
              u osnovnoj verziji, ali čitaju se kao tvrdnja, a ne kao spisak. */}
          <dl className="mt-16 grid grid-cols-3 border-t border-ivory-100/12">
            {stats.map((stat) => (
              // flex-col-reverse: u kodu prvo ide <dt> (kako HTML i traži),
              // a na ekranu se broj vidi iznad opisa.
              <div
                key={stat.label}
                className="flex flex-col-reverse border-e border-ivory-100/12 py-8 pe-4 last:border-e-0"
              >
                <dt className="mt-3 text-[0.66rem] uppercase tracking-[0.18em] text-ivory-400">
                  {stat.label}
                </dt>
                <dd className="font-[family-name:var(--font-pro-display)] text-5xl font-light text-brass-300">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
