import 'server-only';

import { cookies, headers } from 'next/headers';

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  normalizeLocale,
  type Locale,
} from './config';
import { getStrings } from './index';
import type { Dictionary } from './dictionary';

/**
 * Jezik za serverske komponente.
 *
 * Redoslijed je bitan: izričit izbor iz kolačića uvijek pobjeđuje ono što
 * preglednik nagađa. Ko je jednom kliknuo "English", ne želi da mu se sajt
 * vrati na bosanski samo zato što mu je Windows na tom jeziku.
 *
 * Napomena: `cookies()` čini cijelo stablo dinamičnim. Ovdje to ništa ne
 * mijenja — sve stranice su ionako `force-dynamic`, jer dostupnost termina ne
 * smije biti keširana.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const chosen = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  if (chosen) return chosen;

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get('accept-language')) ?? DEFAULT_LOCALE;
}

/** Prečica za komponente kojima trebaju i jezik i tekst. */
export async function getServerStrings(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getStrings(locale) };
}
