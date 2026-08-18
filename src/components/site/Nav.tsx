'use client';

import { useEffect, useRef, useState } from 'react';

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/LocaleProvider';
import { clamp, onScroll } from '@/components/motion/ticker';

/** Sidra u stranici ostaju bosanska bez obzira na jezik — adresa se ne prevodi. */
const LINKS = [
  { href: '#o-kuci', id: 'o-kuci', key: 'about' },
  { href: '#galerija', id: 'galerija', key: 'gallery' },
  { href: '#sadrzaji', id: 'sadrzaji', key: 'amenities' },
  { href: '#lokacija', id: 'lokacija', key: 'location' },
  { href: '#pitanja', id: 'pitanja', key: 'faq' },
] as const;

export function Nav() {
  const { t } = useI18n();

  // Preko heroja je navigacija providna i bijela; čim se skrola, dobija podlogu.
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const bar = useRef<HTMLDivElement>(null);

  /*
   * Koliko je stranice pročitano, u tanku crtu ispod navigacije.
   *
   * Napredak se upisuje kao CSS promjenljiva, a ne kroz React stanje: to je
   * broj koji se mijenja pri svakom kadru skrola, pa bi kroz stanje pokrenuo
   * ponovno iscrtavanje cijele navigacije stotinu puta u sekundi. Ovako ga
   * čita samo jedna crta, i to iz CSS-a.
   */
  useEffect(() => {
    const node = bar.current;
    if (!node) return;

    return onScroll(() => {
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      node.style.setProperty('--read', travel > 0 ? clamp(window.scrollY / travel).toFixed(4) : '0');
    });
  }, []);

  // Podloga navigacije se, za razliku od crte, mijenja samo dva puta na cijeloj
  // stranici — jednom kad se krene i jednom kad se vrati na vrh. Zato ovdje
  // stanje jeste na mjestu: promjena je rijetka, a od nje zavise boje u pet
  // različitih elemenata.
  useEffect(() => {
    const onWindowScroll = () => setScrolled(window.scrollY > 40);
    onWindowScroll();
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', onWindowScroll);
  }, []);

  /*
   * U kojem je odjeljku gost trenutno.
   *
   * Prag je uska traka pri vrhu ekrana (`-45% 0px -50%`), a ne cijeli ekran:
   * inače bi u vidnom polju bila po dva odjeljka odjednom i oznaka bi
   * poskakivala između njih pri svakom pomjeraju.
   */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    for (const link of LINKS) {
      const section = document.getElementById(link.id);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
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
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-out-soft)] ${
          solid ? 'border-b border-sand-200 bg-sand-50/85 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
          aria-label={t.nav.mainNav}
        >
          <a
            href="#vrh"
            className={`font-display text-lg tracking-tight transition-colors duration-500 ${
              solid ? 'text-forest-900' : 'text-white drop-shadow-sm'
            }`}
          >
            {t.site.name}
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  data-active={active === link.id}
                  className={`nav-link text-[0.8125rem] font-medium tracking-wide transition-colors duration-500 ${
                    solid
                      ? 'text-ink-700 hover:text-forest-800'
                      : 'text-white/85 drop-shadow-sm hover:text-white'
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

            <a
              href="#rezervacija"
              className={`hidden px-6 py-2.5 text-[0.8125rem] sm:inline-flex ${
                solid ? 'btn-primary' : 'btn-onlight'
              }`}
            >
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

        {/* Crta se vidi tek kad navigacija dobije podlogu — preko fotografije
            bi bila samo šara koja ničemu ne služi. */}
        <div
          ref={bar}
          className={`nav-progress transition-opacity duration-500 ${solid ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
      </header>

      {/* Mobilni meni */}
      <div
        id="mobilni-meni"
        hidden={!open}
        className="fixed inset-0 top-16 z-40 bg-sand-50 px-5 py-10 md:hidden"
      >
        <ul className="flex flex-col">
          {LINKS.map((link, i) => (
            <li key={link.href} className="border-b border-sand-200">
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="animate-menu-item flex items-baseline gap-4 py-4 font-display text-3xl text-forest-900"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <span className="text-xs text-ink-400 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {t.nav[link.key]}
              </a>
            </li>
          ))}
        </ul>

        <a href="#rezervacija" onClick={() => setOpen(false)} className="btn-primary mt-8 w-full">
          {t.nav.book}
        </a>

        <div className="mt-8 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
