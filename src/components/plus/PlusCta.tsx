import { Reveal } from '@/components/motion/Reveal';
import { CONTACT } from '@/components/site/Footer';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * Posljednji poziv na rezervaciju.
 *
 * Stoji između pitanja i podnožja, na jedinom mjestu gdje gost već zna sve što
 * mu treba — pa mu se ne nudi ništa novo nego samo put natrag do kalendara.
 *
 * Drugo dugme vodi na mail iz `CONTACT`, istu konstantu koju koriste podnožja
 * svih verzija sajta. Nije ukras: ono radi i kad baza nije podešena, a nekome
 * je lakše pitati nego kliknuti.
 */
export async function PlusCta() {
  const { t } = await getServerStrings();

  return (
    <section className="relative overflow-hidden bg-pine-950 text-paper-100">
      {/* Ista svjetlosna mrlja kao na plohi sa sadržajima — dvije tamne plohe
          na istoj stranici moraju izgledati kao ista ploha, a ne kao dvije. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(55% 60% at 50% 0%, rgb(58 122 96 / 0.3), transparent 70%),' +
            'radial-gradient(40% 50% at 85% 100%, rgb(184 106 65 / 0.14), transparent 70%)',
        }}
      />

      <div className="plus-section relative text-center">
        <Reveal>
          <h2 className="plus-title mx-auto max-w-3xl text-paper-50">{t.finalCta.heading}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper-200/75">
            {t.finalCta.lead}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto mt-10 flex max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <a href="#rezervacija" className="plus-btn-accent px-8 py-4 text-base">
              {t.hero.cta}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="plus-btn-onlight px-7 py-4 text-base">
              {t.finalCta.contact}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
