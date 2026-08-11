import type { Metadata } from 'next';

import { PlusAbout } from '@/components/plus/PlusAbout';
import { PlusBooking } from '@/components/plus/PlusBooking';
import { PlusCta } from '@/components/plus/PlusCta';
import { PlusExtras } from '@/components/plus/PlusExtras';
import { PlusFaq } from '@/components/plus/PlusFaq';
import { PlusFooter } from '@/components/plus/PlusFooter';
import { PlusHero } from '@/components/plus/PlusHero';
import { PlusLocation } from '@/components/plus/PlusLocation';
import { PlusNav } from '@/components/plus/PlusNav';
import { PlusShowcase } from '@/components/plus/PlusShowcase';
import { PlusSteps } from '@/components/plus/PlusSteps';
import { getBookingContext } from '@/lib/data';
import { firstFreeDate, lowestNightlyCents } from '@/lib/pricing';

/**
 * Treća koža istog sajta.
 *
 * Isti tekst, isti podaci, ista baza, iste API rute, ista rezervacija — samo
 * treći izgled. Ništa ovdje ne pravi svoju kopiju podataka: `getBookingContext`
 * je isti poziv koji rade i početna stranica i `/treescapepro`, pa termin
 * zauzet u jednoj verziji istog trena postane zauzet i u ostale dvije.
 *
 * Razlike u odnosu na prve dvije verzije su u rasporedu, ne u podacima:
 * između "o kući" i fotografija stoji objašnjenje kako rezervacija teče
 * (`PlusSteps`), a prije podnožja posljednji poziv (`PlusCta`) — oba
 * odgovaraju na pitanja koja gost inače postavi telefonom. Mreža sličica i
 * kartice sa sadržajima su spojene: fotografija sada nosi svoj naslov i opis
 * pored sebe (`PlusShowcase`), a ono što nema fotografiju stoji u popisu
 * ispod (`PlusExtras`).
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  // Kao i `/treescapepro`: ova verzija se pokazuje kupcu, a ne gostima, pa
  // nema šta da traži u Googleu — tamo bi se takmičila s pravim sajtom za
  // iste riječi.
  robots: { index: false, follow: false },
};

export default async function PlusPage() {
  const context = await getBookingContext();
  const fromCents = lowestNightlyCents(context.periods, context.settings);

  // Prvi slobodan datum se računa OVDJE, a ne u heroju: hero je serverska
  // komponenta bez pristupa terminima, a ovako je i vidljivo da podatak dolazi
  // iz istog `context` iz kojeg se puni i kalendar.
  const firstFree = firstFreeDate(context.slots);

  return (
    <>
      <PlusNav />
      <main>
        <PlusHero
          fromCents={fromCents}
          symbol={context.settings.currency_symbol}
          firstFree={firstFree}
        />
        <PlusAbout />
        <PlusSteps />
        <PlusShowcase />
        <PlusExtras />
        <PlusBooking context={context} />
        <PlusLocation />
        <PlusFaq settings={context.settings} />
        <PlusCta />
      </main>
      <PlusFooter />
    </>
  );
}
