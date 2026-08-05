import type { Settings } from '@/lib/types';
import { t } from '@/lib/strings';

import { Reveal } from './Reveal';

/**
 * Harmonika je izvedena preko <details>/<summary> — preglednik već zna kako
 * se to otvara, zatvara i čita čitačem ekrana, pa ovdje nema ni reda JS-a.
 */
export function Faq({ settings }: { settings: Settings }) {
  const items = [
    {
      q: 'Kada mogu doći i do kada moram otići?',
      a: `Prijava je od ${settings.checkin_time}, a odjava do ${settings.checkout_time}. Ako vam treba raniji dolazak ili kasniji odlazak, javite se — obično se može dogovoriti.`,
    },
    {
      q: 'Kako funkcioniše rezervacija?',
      a: 'Odaberete termin i pošaljete rezervaciju. Termin odmah držimo za vas i drugim gostima je prikazan kao zauzet. Rezervacija je konačno potvrđena tek kad je domaćin prihvati — o tome vas obavještavamo emailom.',
    },
    {
      q: 'Mogu li otkazati rezervaciju?',
      a: 'Za otkazivanje nas kontaktirajte što prije, na email ili telefon iz podnožja stranice. Uslovi povrata novca zavise od toga koliko je ostalo do dolaska.',
    },
    {
      q: 'Da li su kućni ljubimci dozvoljeni?',
      a: 'Jesu, uz prethodnu najavu — molimo da to upišete u napomenu prilikom rezervacije kako bismo pripremili kuću.',
    },
    {
      q: 'Da li je posteljina uključena?',
      a: 'Jeste. Posteljina, peškiri i osnovna sredstva za higijenu su uključeni u cijenu — nema dodatnih naknada.',
    },
    {
      q: 'Koliko osoba može boraviti u kući?',
      a: `Kuća prima do ${settings.max_guests} osoba. Za veće grupe nam se javite prije rezervacije.`,
    },
    {
      q: 'Ima li interneta i mobilnog signala?',
      a: 'Ima — bežični internet pokriva cijelu kuću, a mobilni signal je stabilan.',
    },
    {
      q: 'Kako dobijam adresu i ključ?',
      a: 'Nakon potvrde rezervacije šaljemo vam email sa tačnom adresom, uputstvima za dolazak i kontakt brojem domaćina, koji vas dočekuje i predaje ključ.',
    },
  ];

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
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-sans text-lg font-medium text-forest-900 transition-colors hover:text-forest-600 [&::-webkit-details-marker]:hidden">
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
                <p className="max-w-3xl pb-6 pr-14 text-base leading-relaxed text-ink-500">
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
