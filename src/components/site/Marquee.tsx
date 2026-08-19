import { AMENITIES } from '@/lib/amenities';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * Traka s imenima sadržaja koja polako klizi između dva odjeljka.
 *
 * Nije ukras nego spoj: galerija završava krupnom fotografijom, a "Šta vas
 * čeka" počinje tamnom plohom, pa bi bez nje jedno naglo sjelo na drugo. Ovako
 * između njih stoji nešto što se kreće samo od sebe — a usput, dok gost prelazi
 * s jednog na drugo, pročita šest riječi koje ga i zanimaju.
 *
 * Sadržaj je stvarni: ista imena iz rječnika koja stoje i u spisku ispod, pa
 * traka govori sva tri jezika bez ijednog novog ključa.
 *
 * Spisak je ispisan DVAPUT, i to je jedini razlog zašto traka nema kraj:
 * animacija pomjeri red za tačno pola njegove dužine, gdje ga dočeka druga
 * kopija na istom mjestu s kojeg je prva krenula. Šav se ne vidi jer ga nema.
 */
export async function Marquee() {
  const { t } = await getServerStrings();

  // Šest, a ne svih četrnaest: traka treba da se pročita u prolazu, a ne da
  // preduhitri spisak koji dolazi odmah ispod nje.
  const words = AMENITIES.slice(0, 6).map((key) => t.amenities.items[key].label);

  return (
    <div
      className="marquee grain relative border-y border-cream-200 bg-cream-100 py-5"
      // Traka se sama vrti i ništa ne saopštava što već ne piše u spisku ispod,
      // pa je za čitač ekrana samo šum.
      aria-hidden="true"
    >
      <div className="marquee-row relative z-[2]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((word) => (
              <span key={word} className="flex items-center">
                <span className="whitespace-nowrap px-8 font-display text-xl text-coal-900 md:text-2xl">
                  {word}
                </span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-olive-600/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
