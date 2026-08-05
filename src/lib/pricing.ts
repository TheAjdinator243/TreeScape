/**
 * Obračun cijene — jedina implementacija, koriste je i preglednik i server.
 *
 * Preglednik računa da bi gost odmah vidio iznos dok pomjera datume.
 * Server računa PONOVO, iz baze, prije nego što upiše rezervaciju. Broj koji
 * stigne od klijenta se nikada ne vjeruje — inače bi svako mogao poslati
 * `total_cents: 1` i rezervisati sedmicu za jedan fening.
 *
 * ── Jedinica je DAN, ne noćenje ────────────────────────────────────────────
 * Kuća se može uzeti i samo za jedan dan, bez spavanja. Zato se sve broji u
 * danima koje boravak zauzima, a raspon je [dolazak, odlazak):
 *
 *   · jedan dan (10.08)          → [10.08, 11.08) = 1 dan
 *   · od 10.08 do 12.08          → [10.08, 12.08) = 2 dana
 *
 * Dan odlaska ostaje slobodan za sljedećeg gosta — što se lijepo poklapa s
 * odjavom u 09:00 i prijavom u 11:00 istog dana.
 */

import { daysBetween, eachDay, isWithin, todayStr, type DateStr } from './dates';
import { t } from './strings';
import type { AvailabilitySlot, PriceBreakdown, RatePeriod, Settings } from './types';

/**
 * Cijena za jedan dan: pobjeđuje sezona s najvećim `priority` koja pokriva
 * taj datum. Ako nijedna ne pokriva — osnovna cijena iz postavki.
 */
function rateForDay(
  day: DateStr,
  periods: RatePeriod[],
  settings: Settings
): { cents: number; periodName: string | null } {
  let winner: RatePeriod | null = null;

  for (const period of periods) {
    if (!isWithin(day, period.start_date, period.end_date)) continue;
    if (!winner || period.priority > winner.priority) winner = period;
  }

  if (!winner) {
    return { cents: settings.default_nightly_cents, periodName: null };
  }

  return { cents: winner.nightly_price_cents, periodName: winner.name };
}

/** Puni obračun za boravak [start, end). Dan odlaska se ne naplaćuje. */
export function quoteStay(
  start: DateStr,
  end: DateStr,
  periods: RatePeriod[],
  settings: Settings
): PriceBreakdown {
  const days = eachDay(start, end).map((date) => {
    const rate = rateForDay(date, periods, settings);
    return { date, cents: rate.cents, periodName: rate.periodName };
  });

  const totalCents = days.reduce((sum, d) => sum + d.cents, 0);

  return {
    days,
    dayCount: days.length,
    totalCents,
    averageDailyCents: days.length ? Math.round(totalCents / days.length) : 0,
    currency: settings.currency,
    currencySymbol: settings.currency_symbol,
  };
}

export type ValidationResult = { ok: true } | { ok: false; code: string; message: string };

/**
 * Sva pravila boravka na jednom mjestu. Server ovo pokreće obavezno;
 * klijent iz uljudnosti, da gost ne klikne pa tek onda sazna za problem.
 *
 * Minimalnog broja dana NEMA — može se rezervisati i jedan jedini dan.
 */
export function validateStay(
  start: DateStr,
  end: DateStr,
  guests: number,
  periods: RatePeriod[],
  settings: Settings
): ValidationResult {
  if (end <= start) {
    return { ok: false, code: 'INVALID_RANGE', message: t.errors.INVALID_RANGE };
  }

  if (start < todayStr()) {
    return { ok: false, code: 'PAST_DATE', message: t.errors.PAST_DATE };
  }

  if (daysBetween(start, end) > settings.max_nights) {
    return { ok: false, code: 'MAX_DAYS', message: t.errors.MAX_DAYS(settings.max_nights) };
  }

  if (!Number.isInteger(guests) || guests < 1) {
    return { ok: false, code: 'INVALID_INPUT', message: t.errors.INVALID_INPUT };
  }

  if (guests > settings.max_guests) {
    return {
      ok: false,
      code: 'TOO_MANY_GUESTS',
      message: t.errors.TOO_MANY_GUESTS(settings.max_guests),
    };
  }

  return { ok: true };
}

/**
 * Da li raspon dodiruje ijedan zauzet termin.
 *
 * Ovo je samo za prijateljsku poruku u sučelju. Pravu odbranu od dvostrukog
 * bookinga radi EXCLUDE ograničenje u bazi — ovdje se utrka može izgubiti,
 * tamo ne može.
 */
export function rangeHasConflict(start: DateStr, end: DateStr, slots: AvailabilitySlot[]): boolean {
  return slots.some((slot) => start < slot.end_date && slot.start_date < end);
}

/** Skup pojedinačnih zauzetih dana — kalendar ih tako najlakše iscrtava. */
export function takenDayMap(slots: AvailabilitySlot[]): Map<DateStr, 'hard' | 'pending'> {
  const map = new Map<DateStr, 'hard' | 'pending'>();

  for (const slot of slots) {
    const level = slot.kind === 'pending' ? 'pending' : 'hard';
    for (const day of eachDay(slot.start_date, slot.end_date)) {
      // Potvrđeno uvijek nadjačava rezervisano-u-toku.
      if (level === 'hard' || !map.has(day)) map.set(day, level);
    }
  }

  return map;
}

/** Najniža dnevna cijena — za "od 180 KM po danu" u heroju. */
export function lowestNightlyCents(periods: RatePeriod[], settings: Settings): number {
  return periods.reduce(
    (min, p) => Math.min(min, p.nightly_price_cents),
    settings.default_nightly_cents
  );
}

// ── Formatiranje novca ─────────────────────────────────────────────────────

/** 18000 → "180 KM" (bez decimala kad su nule, jer tako izgleda čistije). */
export function formatMoney(cents: number, symbol = '€'): string {
  const amount = cents / 100;
  const hasFraction = cents % 100 !== 0;
  const formatted = new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
}
