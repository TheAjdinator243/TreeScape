'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { LOCALES, LOCALE_COOKIE, LOCALE_MAX_AGE, directionOf, isLocale } from '@/lib/i18n';

import { useI18n } from './LocaleProvider';

/**
 * Prebacivanje jezika.
 *
 * Izbor ide u kolačić, pa ga sljedeći zahtjev vidi i server — tako i naslov
 * stranice, i mailovi, i poruke o greškama iz API-ja stignu na pravom jeziku.
 *
 * `lang` i `dir` na <html> se mijenjaju odmah, ručno, a tek onda se traži
 * osvježenje sa servera. Bez toga bi stranica na trenutak stajala s arapskim
 * tekstom u lijevo-desnom rasporedu, dok ne stigne novi odgovor.
 */
export function LanguageSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: string) {
    if (!isLocale(next) || next === locale) return;

    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_MAX_AGE}; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = directionOf(next);

    startTransition(() => router.refresh());
  }

  const styles = {
    light: 'rounded-full border-cream-300 bg-paper text-ink-700 hover:border-olive-600',
    dark: 'rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20',
  }[tone];

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t.language.label}</span>

      <GlobeIcon />

      <select
        value={locale}
        disabled={pending}
        onChange={(e) => choose(e.target.value)}
        className={`cursor-pointer appearance-none border py-1.5 pe-7 ps-8 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-olive-600/30 disabled:opacity-60 ${styles}`}
      >
        {LOCALES.map((option) => (
          // Nazivi jezika su uvijek na svom jeziku — "العربية", a ne "arapski".
          // Onaj ko traži svoj jezik ne razumije nužno onaj u kojem trenutno gleda sajt.
          <option key={option} value={option} className="bg-paper text-ink-900">
            {t.language.names[option]}
          </option>
        ))}
      </select>

      <ChevronIcon />
    </label>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="pointer-events-none absolute start-2.5 h-4 w-4 opacity-70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute end-2 h-3.5 w-3.5 opacity-70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
