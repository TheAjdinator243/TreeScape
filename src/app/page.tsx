import { BookingSection } from '@/components/booking/BookingSection';
import { About } from '@/components/site/About';
import { Amenities } from '@/components/site/Amenities';
import { Faq } from '@/components/site/Faq';
import { Footer } from '@/components/site/Footer';
import { Gallery } from '@/components/site/Gallery';
import { Hero } from '@/components/site/Hero';
import { Location } from '@/components/site/Location';
import { Marquee } from '@/components/site/Marquee';
import { Nav } from '@/components/site/Nav';
import { getBookingContext } from '@/lib/data';
import { lowestNightlyCents } from '@/lib/pricing';

/**
 * Dostupnost se mijenja svake minute, pa stranica ne smije biti keširana —
 * inače bi neko mogao vidjeti slobodan termin koji je odavno prodat.
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const context = await getBookingContext();
  const fromCents = lowestNightlyCents(context.periods, context.settings);

  return (
    <>
      <Nav />
      <main>
        <Hero fromCents={fromCents} symbol={context.settings.currency_symbol} />
        <About />
        <Gallery />
        <Marquee />
        <Amenities />
        <BookingSection context={context} />
        <Location />
        <Faq settings={context.settings} />
      </main>
      <Footer />
    </>
  );
}
