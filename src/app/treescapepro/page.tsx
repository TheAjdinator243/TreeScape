import type { Metadata } from 'next';

import { ProAbout } from '@/components/pro/ProAbout';
import { ProAmenities } from '@/components/pro/ProAmenities';
import { ProBooking } from '@/components/pro/ProBooking';
import { ProFaq } from '@/components/pro/ProFaq';
import { ProFooter } from '@/components/pro/ProFooter';
import { ProGallery } from '@/components/pro/ProGallery';
import { ProHero } from '@/components/pro/ProHero';
import { ProLocation } from '@/components/pro/ProLocation';
import { ProNav } from '@/components/pro/ProNav';
import { getBookingContext } from '@/lib/data';
import { lowestNightlyCents } from '@/lib/pricing';

/**
 * Druga koža istog sajta.
 *
 * Isti tekst, isti podaci, ista baza, iste API rute, ista rezervacija — samo
 * drugi izgled. Ništa ovdje ne pravi svoju kopiju podataka: `getBookingContext`
 * je isti poziv koji radi i početna stranica, pa zauzet termin u jednoj verziji
 * istog trena postane zauzet i u drugoj.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  // Ova verzija se pokazuje kupcu, a ne gostima — nema šta da traži u Googleu,
  // jer bi se tamo takmičila s pravim sajtom za iste riječi.
  robots: { index: false, follow: false },
};

export default async function ProPage() {
  const context = await getBookingContext();
  const fromCents = lowestNightlyCents(context.periods, context.settings);

  return (
    <>
      <ProNav />
      <main>
        <ProHero fromCents={fromCents} symbol={context.settings.currency_symbol} />
        <ProAbout />
        <ProGallery />
        <ProAmenities />
        <ProBooking context={context} />
        <ProLocation />
        <ProFaq settings={context.settings} />
      </main>
      <ProFooter />
    </>
  );
}
