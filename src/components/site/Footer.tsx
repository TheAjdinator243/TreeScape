import Link from 'next/link';

import { getServerStrings } from '@/lib/i18n/server';

/**
 * Kontakt podatke promijeni ovdje — na jednom mjestu za cijeli sajt.
 */
export const CONTACT = {
  phone: '+387 61 000 000',
  phoneHref: 'tel:+38761000000',
  email: 'info@treescape.ba',
};

export async function Footer() {
  const { t } = await getServerStrings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest-900 text-sand-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-sand-50">{t.site.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-moss-300/80">
            {t.site.description}
          </p>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-moss-400">
            {t.footer.contact}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={CONTACT.phoneHref}
                dir="ltr"
                className="inline-block transition-colors hover:text-sand-50"
              >
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                dir="ltr"
                className="inline-block transition-colors hover:text-sand-50"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="text-moss-300/80">{t.footer.address}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-moss-400">
            {t.footer.quickLinks}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="#o-kuci" className="transition-colors hover:text-sand-50">
                {t.nav.about}
              </a>
            </li>
            <li>
              <a href="#galerija" className="transition-colors hover:text-sand-50">
                {t.nav.gallery}
              </a>
            </li>
            <li>
              <a href="#pitanja" className="transition-colors hover:text-sand-50">
                {t.nav.faq}
              </a>
            </li>
            <li>
              <a href="#rezervacija" className="transition-colors hover:text-sand-50">
                {t.nav.book}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-forest-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-moss-300/70 sm:px-8">
          <p>
            © {year} {t.site.name}. {t.footer.rights}
          </p>

          {/* Pravni tekstovi stoje u dnu, gdje ih gost i traži. */}
          <p className="flex gap-5">
            <Link href="/privatnost" className="transition-colors hover:text-sand-50">
              {t.footer.privacy}
            </Link>
            <Link href="/uslovi" className="transition-colors hover:text-sand-50">
              {t.footer.terms}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
