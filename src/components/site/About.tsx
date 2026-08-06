import Image from 'next/image';

import { ABOUT_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';

import { Reveal } from './Reveal';

export async function About() {
  const { t } = await getServerStrings();

  const stats = [
    { value: '8', label: t.about.stats.guests },
    { value: '2', label: t.about.stats.bedrooms },
    { value: '2', label: t.about.stats.bathrooms },
  ];

  return (
    <section id="o-kuci" className="section">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="section-eyebrow">{t.site.tagline}</p>
          <h2 className="section-title">{t.about.heading}</h2>
          <p className="section-lead">{t.about.lead}</p>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-700">
            {t.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-x-6 gap-y-8">
            {stats.map((stat) => (
              // flex-col-reverse: u kodu prvo ide <dt> (kako HTML i traži),
              // a na ekranu se broj vidi iznad opisa.
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-ink-500">{stat.label}</dt>
                <dd className="font-display text-4xl text-forest-700">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-2xl shadow-lift">
            <Image
              src={ABOUT_IMAGE}
              alt={t.about.imageAlt}
              placeholder="blur"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
