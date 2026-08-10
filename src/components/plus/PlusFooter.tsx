import { Parallax } from '@/components/motion/Parallax';
import { CONTACT } from '@/components/site/Footer';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * Podnožje.
 *
 * Kontakt podaci dolaze iz iste konstante kao u ostalim verzijama — promijeniš
 * broj na jednom mjestu, promijeni se na svim sajtovima.
 *
 * Ime kuće ide preko cijele širine, na dnu: posljednje što gost vidi treba da
 * bude ime, a ne spisak linkova.
 */
export async function PlusFooter() {
  const { t } = await getServerStrings();
  const year = new Date().getFullYear();

  const links = [
    { href: '#o-kuci', label: t.nav.about },
    { href: '#galerija', label: t.nav.gallery },
    { href: '#sadrzaji', label: t.nav.amenities },
    { href: '#pitanja', label: t.nav.faq },
    { href: '#rezervacija', label: t.nav.book },
  ];

  return (
    <footer className="bg-pine-950 text-paper-200/80">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="plus-eyebrow-onlight">{t.footer.contact}</p>
            <ul className="space-y-2.5 text-base">
              <li>
                <a
                  href={CONTACT.phoneHref}
                  dir="ltr"
                  className="inline-block transition-colors hover:text-paper-50"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  dir="ltr"
                  className="inline-block transition-colors hover:text-paper-50"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="text-paper-200/55">{t.footer.address}</li>
            </ul>
          </div>

          <div>
            <p className="plus-eyebrow-onlight">{t.footer.quickLinks}</p>
            <ul className="space-y-2.5 text-base">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-paper-50">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="plus-eyebrow-onlight">{t.site.tagline}</p>
            <p className="max-w-xs text-base leading-relaxed text-paper-200/60">
              {t.site.description}
            </p>
          </div>
        </div>

        {/* Ime kuće preko cijele širine — `clamp` da se skalira s ekranom
            umjesto da se lomi ili prelijeva na uske telefone.

            Kreće se sporije od podnožja koje ga nosi, pa se pri dolasku na dno
            stranice "podigne" u vidno polje umjesto da samo dođe s njim.
            `overflow-hidden` na omotaču drži taj višak unutar podnožja. */}
        <div className="mt-16 overflow-hidden">
          <Parallax speed={0.05}>
            <p
              className="select-none leading-none text-paper-100/[0.07]"
              style={{
                fontFamily: 'var(--font-plus-display)',
                fontSize: 'clamp(3rem, 16vw, 12rem)',
              }}
              aria-hidden="true"
            >
              {t.site.name}
            </p>
          </Parallax>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-paper-100/10 pt-6 text-xs text-paper-200/50">
          <p>
            © {year} {t.site.name}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
