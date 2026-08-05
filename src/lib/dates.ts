/**
 * Datumi se kroz cijelu aplikaciju prenose kao obični stringovi 'YYYY-MM-DD'.
 *
 * Razlog: `new Date('2026-08-05')` JavaScript tumači kao ponoć po UTC-u, pa u
 * Sarajevu (UTC+1/+2) ispadne 4. avgust. Za rezervacije je to katastrofa —
 * gost odabere 5., a u bazi završi 4. Zato: string u bazi, string u API-ju,
 * string u stanju komponente, a pravi `Date` se pravi samo za prikaz.
 */

import { format } from 'date-fns';
import { bs } from 'date-fns/locale';

/** Datum bez vremena, u obliku 'YYYY-MM-DD'. */
export type DateStr = string;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateStr(value: unknown): value is DateStr {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = fromDateStr(value);
  return !Number.isNaN(d.getTime()) && toDateStr(d) === value;
}

/** `Date` (lokalna vremenska zona) → 'YYYY-MM-DD'. */
export function toDateStr(date: Date): DateStr {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 'YYYY-MM-DD' → `Date` u lokalnoj ponoći (bez UTC pomaka). */
export function fromDateStr(value: DateStr): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function todayStr(): DateStr {
  return toDateStr(new Date());
}

export function addDaysStr(value: DateStr, days: number): DateStr {
  const d = fromDateStr(value);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

/** Broj dana koje boravak zauzima. 01.08 → 05.08 = 4; 01.08 → 02.08 = 1. */
export function daysBetween(start: DateStr, end: DateStr): number {
  const ms = fromDateStr(end).getTime() - fromDateStr(start).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Datumi koji se stvarno naplaćuju: [start, end) — dan odlaska ne ulazi.
 * Isti dogovor koji koristi i `daterange(..., '[)')` u bazi.
 */
export function eachDay(start: DateStr, end: DateStr): DateStr[] {
  const days: DateStr[] = [];
  let cursor = start;
  // Zaštita od beskonačne petlje ako neko pošalje end < start.
  let guard = 0;
  while (cursor < end && guard++ < 3650) {
    days.push(cursor);
    cursor = addDaysStr(cursor, 1);
  }
  return days;
}

/** Da li se dva raspona [aStart, aEnd) i [bStart, bEnd) preklapaju. */
export function rangesOverlap(
  aStart: DateStr,
  aEnd: DateStr,
  bStart: DateStr,
  bEnd: DateStr
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Da li datum pada unutar raspona [start, end). */
export function isWithin(date: DateStr, start: DateStr, end: DateStr): boolean {
  return date >= start && date < end;
}

// ── Prikaz ─────────────────────────────────────────────────────────────────

/** npr. "5. avgust 2026." */
export function formatLong(value: DateStr): string {
  return format(fromDateStr(value), 'd. MMMM yyyy.', { locale: bs });
}

/** npr. "5. avg" */
export function formatShort(value: DateStr): string {
  return format(fromDateStr(value), 'd. MMM', { locale: bs });
}

/** npr. "5.8.2026." */
export function formatNumeric(value: DateStr): string {
  return format(fromDateStr(value), 'd.M.yyyy.', { locale: bs });
}

/** npr. "5. avg – 9. avg 2026." */
export function formatRange(start: DateStr, end: DateStr): string {
  const a = fromDateStr(start);
  const b = fromDateStr(end);
  const sameYear = a.getFullYear() === b.getFullYear();
  const left = format(a, sameYear ? 'd. MMM' : 'd. MMM yyyy.', { locale: bs });
  const right = format(b, 'd. MMM yyyy.', { locale: bs });
  return `${left} – ${right}`;
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return format(d, 'd.M.yyyy. HH:mm', { locale: bs });
}
