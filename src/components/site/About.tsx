import Image from 'next/image';

import { Counter } from '@/components/motion/Counter';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { ABOUT_IMAGE } from '@/lib/gallery';
import { getServerStrings } from '@/lib/i18n/server';

import { SectionHead } from './SectionHead';

/**
 * O kući.
 *
 * Raspored je namjerno nesimetričan: tekst zauzima nešto manje od polovine, a
 * fotografija viri niže od njega i ima svoju vlastitu vlas-crtu s brojem. Dvije
 * jednake kolone djeluju kao tabela; ovakve kao stranica u časopisu.
 */
export async function About() {
  const { t } = await getServerStrings();

  const stats = [
    { value: 8, label: t.about.stats.guests },
    { value: 2, label: t.about.stats.bedrooms },
    { value: 2, label: t.about.stats.bathrooms },
  ];

  return (
    <section id="o-kuci" className="section">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <SectionHead index={1} label={t.site.tagline} title={t.about.heading} lead={t.about.lead} />

          <Reveal delay={140}>
            <div className="mt-10 space-y-5 text-base leading-[1.75] text-ink-700">
              {t.about.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={220}>
            <dl className="mt-12 grid grid-cols-3 border-t border-cream-200">
              {stats.map((stat) => (
                // flex-col-reverse: u kodu prvo ide <dt> (kako HTML i traži),
                // a na ekranu se broj vidi iznad opisa.
                <div
                  key={stat.label}
                  className="flex flex-col-reverse gap-1 border-e border-cream-200 py-6 pe-4 last:border-e-0"
                >
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-400">{stat.label}</dt>
                  <dd className="font-display text-4xl leading-none text-olive-700 md:text-5xl">
                    <Counter to={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal variant="mask" delay={100}>
          <Parallax className="aspect-[4/5] rounded-frame" speed={0.1}>
            <Image
              src={ABOUT_IMAGE}
              alt={t.about.imageAlt}
              fill
              placeholder="blur"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}
