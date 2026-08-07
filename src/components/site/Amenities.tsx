import { AMENITIES } from '@/lib/amenities';
import { getServerStrings } from '@/lib/i18n/server';

import { AmenityIcon } from './AmenityIcon';
import { Reveal } from './Reveal';

export async function Amenities() {
  const { t } = await getServerStrings();

  return (
    <section id="sadrzaji" className="bg-forest-900 text-sand-100">
      <div className="section">
        <Reveal>
          <p className="section-eyebrow text-moss-400">{t.site.name}</p>
          <h2 className="section-title text-sand-50">{t.amenities.heading}</h2>
          <p className="section-lead text-sand-200">{t.amenities.lead}</p>
        </Reveal>

        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map((key, i) => (
            <Reveal key={key} delay={Math.min(i, 6) * 60}>
              <li className="flex gap-4">
                <span
                  className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-800 text-moss-300"
                  aria-hidden="true"
                >
                  <AmenityIcon name={key} />
                </span>
                <div>
                  <h3 className="font-sans text-base font-semibold text-sand-50">
                    {t.amenities.items[key].label}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-moss-300/80">
                    {t.amenities.items[key].note}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
