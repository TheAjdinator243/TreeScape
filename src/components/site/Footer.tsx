import Link from 'next/link';

import { Lines } from '@/components/motion/Lines';
import { Reveal } from '@/components/motion/Reveal';
import { getServerStrings } from '@/lib/i18n/server';

/**
 * Kontakt podatke promijeni ovdje — na jednom mjestu za cijeli sajt.
 */
export const CONTACT = {
  phone: '+387 61 000 000',
  phoneHref: 'tel:+38761000000',
  email: 'info@treescape.ba',
};

const QUICK = [
  { href: '#o-kuci', key: 'about' },
  { href: '#galerija', key: 'gallery' },
  { href: '#pitanja', key: 'faq' },
  { href: '#rezervacija', key: 'book' },
] as const;

export async function Footer() {
  const { t } = await getServerStrings();
  const year = new Date().getFullYear();

  return (
    <footer className="grain relative bg-bark-950 text-sand-200">
      <div className="relative z-[2] mx-auto max-w-6xl px-5 pb-10 pt-24 sm:px-8 md:pt-28">
        {/*
          Ime kuće u dnu, veliko, i posljednje što se otkriva na stranici. Nije
          logotip nego potpis — isto pismo i isti pokret kao naslovi iznad, pa
          se stranica zatvara onim čim je i počela.
        */}
        <Reveal>
          <p className="font-display text-[clamp(2.75rem,1.5rem+6vw,6rem)] leading-none tracking-[-0.035em] text-sand-50">
            <Lines text={t.site.name} step={110} />
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-moss-300/75">
            {t.site.description}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2">
          <Reveal delay={80}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-moss-400">
              {t.footer.contact}
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm">
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
              <li className="text-moss-300/70">{t.footer.address}</li>
            </ul>
          </Reveal>

          <Reveal delay={160}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-moss-400">
              {t.footer.quickLinks}
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {QUICK.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-sand-50">
                    {t.nav[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <div className="relative z-[2] border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-moss-300/60 sm:px-8">
          <p>
            © {year} {t.site.name}. {t.footer.rights}
          </p>

          {/* Pravni tekstovi stoje u dnu, gdje ih gost i traži. */}
          <p className="flex gap-6">
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
