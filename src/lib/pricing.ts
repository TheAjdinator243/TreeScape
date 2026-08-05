/**
 * Obračun cijene — jedina implementacija, koriste je i preglednik i server.
 *
 * Preglednik računa da bi gost odmah vidio iznos dok pomjera datume.
 * Server računa PONOVO, iz baze, prije nego što napravi Stripe sesiju.
 * Broj koji stigne od klijenta se nikada ne vjeruje — inače bi svako mogao
 * poslati `total_cents: 1` i rezervisati sedmicu za jedan cent.
 */

import { eachNight, isWithin, nightsBetween, todayStr, type DateStr } from './dates';
import { t } from './strings';
import type { AvailabilitySlot, PriceBreakdown, RatePeriod, Settings } from './types';

/**
 * Cijena za jednu noć: pobjeđuje sezona s najvećim `priority` koja pokriva
 * taj datum. Ako nijedna ne pokriva — osnovna cijena iz postavki.
 */
function rateForNight(
  night: DateStr,
  periods: RatePeriod[],
  settings: Settings
): { cents: number; periodName: string | null; minNights: number | null } {
  let winner: RatePeriod | null = null;

  for (const period of periods) {
    if (!isWithin(night, period.start_date, period.end_date)) continue;
    if (!winner || period.priority > winner.priority) winner = period;
  }

  if (!winner) {
    return { cents: settings.default_nightly_cents, periodName: null, minNights: null };
  }

  return {
    cents: winner.nightly_price_cents,
    periodName: winner.name,
    minNights: winner.min_nights,
  };
}

/** Puni obračun za boravak [start, end). Dan odlaska se ne naplaćuje. */
export function quoteStay(
  start: DateStr,
  end: DateStr,
  periods: RatePeriod[],
  settings: Settings
): PriceBreakdown {
  const nights = eachNight(start, end).map((date) => {
    const rate = rateForNight(date, periods, settings);
    return { date, cents: rate.cents, periodName: rate.periodName };
  });

  // Minimum boravka je najstroži zahtjev među dodirnutim sezonama.
  let effectiveMinNights = settings.min_nights;
  for (const date of eachNight(start, end)) {
    const rate = rateForNight(date, periods, settings);
    if (rate.minNights && rate.minNights > effectiveMinNights) {
      effectiveMinNights = rate.minNights;
    }
  }

  const subtotalCents = nights.reduce((sum, n) => sum + n.cents, 0);
  const cleaningFeeCents = nights.length > 0 ? settings.cleaning_fee_cents : 0;

  return {
    nights,
    nightCount: nights.length,
    subtotalCents,
    cleaningFeeCents,
    totalCents: subtotalCents + cleaningFeeCents,
    averageNightlyCents: nights.length ? Math.round(subtotalCents / nights.length) : 0,
    currency: settings.currency,
    currencySymbol: settings.currency_symbol,
    effectiveMinNights,
  };
}

export type ValidationResult = { ok: true } | { ok: false; code: string; message: string };

/**
 * Sva pravila boravka na jednom mjestu. Server ovo pokreće obavezno;
 * klijent iz uljudnosti, da gost ne klikne pa tek onda sazna za problem.
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

  const nights = nightsBetween(start, end);
  const quote = quoteStay(start, end, periods, settings);

  if (nights < quote.effectiveMinNights) {
    return {
      ok: false,
      code: 'MIN_NIGHTS',
      message: t.errors.MIN_NIGHTS(quote.effectiveMinNights),
    };
  }

  if (nights > settings.max_nights) {
    return { ok: false, code: 'MAX_NIGHTS', message: t.errors.MAX_NIGHTS(settings.max_nights) };
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
export function rangeHasConflict(
  start: DateStr,
  end: DateStr,
  slots: AvailabilitySlot[]
): boolean {
  return slots.some((slot) => start < slot.end_date && slot.start_date < end);
}

/** Skup pojedinačnih zauzetih dana — kalendar ih tako najlakše iscrtava. */
export function takenDayMap(slots: AvailabilitySlot[]): Map<DateStr, 'hard' | 'pending'> {
  const map = new Map<DateStr, 'hard' | 'pending'>();

  for (const slot of slots) {
    const level = slot.kind === 'pending' ? 'pending' : 'hard';
    for (const night of eachNight(slot.start_date, slot.end_date)) {
      // Potvrđeno uvijek nadjačava rezervisano-u-toku.
      if (level === 'hard' || !map.has(night)) map.set(night, level);
    }
  }

  return map;
}

/** Najniža cijena po noćenju — za "od 120 € po noćenju" u heroju. */
export function lowestNightlyCents(periods: RatePeriod[], settings: Settings): number {
  return periods.reduce(
    (min, p) => Math.min(min, p.nightly_price_cents),
    settings.default_nightly_cents
  );
}

// ── Formatiranje novca ─────────────────────────────────────────────────────

/** 18000 → "180 €" (bez decimala kad su nule, jer tako izgleda čistije). */
export function formatMoney(cents: number, symbol = '€'): string {
  const amount = cents / 100;
  const hasFraction = cents % 100 !== 0;
  const formatted = new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
}
