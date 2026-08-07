'use client';

import { useEffect, useState } from 'react';

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/LocaleProvider';

/** Sidra u stranici ostaju bosanska bez obzira na jezik — adresa se ne prevodi. */
const LINKS = [
  { href: '#o-kuci', key: 'about' },
  { href: '#galerija', key: 'gallery' },
  { href: '#sadrzaji', key: 'amenities' },
  { href: '#lokacija', key: 'location' },
  { href: '#pitanja', key: 'faq' },
] as const;

export function ProNav() {
  const { t } = useI18n();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dok je meni otvoren, pozadina ne smije da se skrola ispod njega.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const solid = scrolled || open;

  return (
    <>
      <a
        href="#rezervacija"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:bg-brass-400 focus:px-5 focus:py-3 focus:text-sm focus:text-onyx-950"
      >
        {t.nav.skipToBooking}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid ? 'border-b border-ivory-100/10 bg-onyx-950/90 backdrop-blur-xl' : ''
        }`}
      >
        <nav
          className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-10"
          aria-label={t.nav.mainNav}
        >
          <a
            href="#vrh"
            // Ime kuće razmaknutim slovima — jedan potez koji natpis pretvara
            // u znak, a to je razlika između sajta i brenda.
            className="font-[family-name:var(--font-pro-display)] text-xl font-normal tracking-[0.3em] text-ivory-50"
          >
            {t.site.name}
          </a>

          <ul className="hidden items-center gap-10 lg:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ivory-200 transition-colors hover:text-brass-300"
                >
                  {t.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex">
              <LanguageSwitcher tone="pro" />
            </span>

            <a href="#rezervacija" className="pro-btn-solid hidden px-7 py-3 lg:inline-flex">
              {t.nav.book}
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="-me-2 inline-flex h-11 w-11 items-center justify-center text-ivory-50 transition-colors hover:text-brass-300 lg:hidden"
              aria-expanded={open}
              aria-controls="pro-meni"
              aria-label={open ? t.nav.close : t.nav.menu}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="pro-meni"
        hidden={!open}
        className="fixed inset-0 top-20 z-40 bg-onyx-950 px-6 py-10 lg:hidden"
      >
        <ul className="divide-y divide-ivory-100/10 border-y border-ivory-100/10">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-5 font-[family-name:var(--font-pro-display)] text-3xl font-light text-ivory-50"
              >
                {t.nav[link.key]}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#rezervacija"
          onClick={() => setOpen(false)}
          className="pro-btn-solid mt-10 w-full"
        >
          {t.nav.book}
        </a>

        <div className="mt-8 flex justify-center">
          <LanguageSwitcher tone="pro" />
        </div>
      </div>
    </>
  );
}

function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
