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

export function Nav() {
  const { t } = useI18n();

  // Preko heroja je navigacija providna i bijela; čim se skrola, dobija podlogu.
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dok je mobilni meni otvoren, pozadina ne smije da se skrola ispod njega.
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
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest-800 focus:px-5 focus:py-3 focus:text-sm focus:text-sand-50"
      >
        {t.nav.skipToBooking}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          solid
            ? 'border-b border-sand-200 bg-sand-50/90 backdrop-blur-md'
            : 'border-b border-transparent'
        }`}
      >
        <nav
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
          aria-label={t.nav.mainNav}
        >
          <a
            href="#vrh"
            className={`font-display text-lg font-semibold tracking-tight transition-colors ${
              solid ? 'text-forest-900' : 'text-white drop-shadow-sm'
            }`}
          >
            {t.site.name}
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    solid
                      ? 'text-ink-700 hover:text-forest-700'
                      : 'text-white/90 drop-shadow-sm hover:text-white'
                  }`}
                >
                  {t.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex">
              <LanguageSwitcher tone={solid ? 'light' : 'dark'} />
            </span>

            <a href="#rezervacija" className="btn-primary hidden px-5 py-2.5 sm:inline-flex">
              {t.nav.book}
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`-me-2 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors md:hidden ${
                solid ? 'text-forest-900 hover:bg-sand-200' : 'text-white hover:bg-white/15'
              }`}
              aria-expanded={open}
              aria-controls="mobilni-meni"
              aria-label={open ? t.nav.close : t.nav.menu}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobilni meni */}
      <div
        id="mobilni-meni"
        hidden={!open}
        className="fixed inset-0 top-16 z-40 bg-sand-50 px-5 py-8 md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3.5 font-display text-2xl text-forest-900 hover:bg-sand-100"
              >
                {t.nav[link.key]}
              </a>
            </li>
          ))}
        </ul>

        <a href="#rezervacija" onClick={() => setOpen(false)} className="btn-primary mt-6 w-full">
          {t.nav.book}
        </a>

        <div className="mt-6 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
