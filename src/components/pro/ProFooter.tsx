import { CONTACT } from '@/components/site/Footer';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * Podnožje.
 *
 * Kontakt podaci dolaze iz iste konstante kao u osnovnoj verziji — promijeniš
 * broj na jednom mjestu, promijeni se na oba sajta.
 *
 * Ime kuće ide preko cijele širine, razmaknutim slovima: posljednje što gost
 * vidi treba da bude ime, a ne spisak linkova.
 */
export async function ProFooter() {
  const { t } = await getServerStrings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ivory-100/12 bg-onyx-950">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="text-[0.76rem] uppercase tracking-[0.28em] text-brass-400">
              {t.footer.contact}
            </p>
            <ul className="mt-6 space-y-3 text-base font-light text-ivory-200">
              <li>
                <a
                  href={CONTACT.phoneHref}
                  dir="ltr"
                  className="inline-block transition-colors hover:text-brass-300"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  dir="ltr"
                  className="inline-block transition-colors hover:text-brass-300"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="text-ivory-400">{t.footer.address}</li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <p className="text-[0.76rem] uppercase tracking-[0.28em] text-brass-400">
              {t.footer.quickLinks}
            </p>
            <ul className="mt-6 space-y-3 text-base font-light text-ivory-200">
              {[
                { href: '#o-kuci', label: t.nav.about },
                { href: '#galerija', label: t.nav.gallery },
                { href: '#pitanja', label: t.nav.faq },
                { href: '#rezervacija', label: t.nav.book },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-brass-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1">
            <p className="max-w-xs text-base font-light leading-[1.9] text-ivory-400">
              {t.site.description}
            </p>
          </div>
        </div>

        {/* Ime kuće preko cijele širine — `clamp` da se skalira s ekranom
            umjesto da se lomi ili prelijeva na uske telefone. */}
        <p
          className="mt-20 select-none font-[family-name:var(--font-pro-display)] font-light leading-none text-ivory-100/12"
          style={{ fontSize: 'clamp(3rem, 15vw, 11rem)', letterSpacing: '0.06em' }}
          aria-hidden="true"
        >
          {t.site.name}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ivory-100/12 pt-8">
          <p className="text-[0.76rem] uppercase tracking-[0.2em] text-ivory-500">
            © {year} {t.site.name}. {t.footer.rights}
          </p>
          <p className="text-[0.76rem] uppercase tracking-[0.2em] text-ivory-500">
            {t.site.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
