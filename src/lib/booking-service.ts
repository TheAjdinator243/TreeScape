import 'server-only';

import { randomBytes } from 'node:crypto';

import { addDaysStr, nightsBetween, todayStr } from './dates';
import { getRatePeriods, getSettings, releaseExpiredHolds } from './data';
import { quoteStay, validateStay } from './pricing';
import { t } from './strings';
import { isOverlapError, supabaseAdmin } from './supabase/admin';
import type { Booking, PriceBreakdown } from './types';
import type { BookingRequest } from './validation';

export type CreateResult =
  | { ok: true; booking: Booking; quote: PriceBreakdown }
  | { ok: false; status: number; code: string; message: string };

/** Nepogodiv token za URL potvrde. */
function newPublicToken(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Pravi rezervaciju koja DRŽI termin.
 *
 * Redoslijed je bitan:
 *  1. oslobodi istekle termine (inače bi napušteni Stripe pokušaj blokirao datume),
 *  2. pročitaj cjenovnik iz baze i sam izračunaj iznos,
 *  3. provjeri pravila boravka,
 *  4. pokušaj upis — a stvarnu provjeru zauzetosti obavlja EXCLUDE ograničenje.
 *
 * Korak 4 je jedini koji se ne može izgubiti u utrci dva istovremena gosta.
 */
export async function createHold(
  input: BookingRequest,
  method: 'card' | 'cash'
): Promise<CreateResult> {
  await releaseExpiredHolds();

  const [periods, settings] = await Promise.all([getRatePeriods(), getSettings()]);

  const check = validateStay(
    input.start_date,
    input.end_date,
    input.guests,
    periods,
    settings
  );

  if (!check.ok) {
    return { ok: false, status: 400, code: check.code, message: check.message };
  }

  const quote = quoteStay(input.start_date, input.end_date, periods, settings);

  // Kartično plaćanje drži termin ograničeno vrijeme; zahtjev za gotovinu
  // drži dok ga vlasnik ne riješi (odobri ili odbije).
  const holdExpiresAt =
    method === 'card'
      ? new Date(Date.now() + settings.hold_minutes * 60_000).toISOString()
      : null;

  const { data, error } = await supabaseAdmin()
    .from('bookings')
    .insert({
      public_token: newPublicToken(),
      guest_name: input.guest_name,
      guest_email: input.guest_email,
      guest_phone: input.guest_phone,
      guests: input.guests,
      note: input.note ?? null,
      start_date: input.start_date,
      end_date: input.end_date,
      status: method === 'card' ? 'pending_payment' : 'pending_cash',
      payment_method: method,
      total_cents: quote.totalCents,
      currency: quote.currency,
      price_breakdown: quote,
      hold_expires_at: holdExpiresAt,
    })
    .select()
    .single();

  if (error) {
    // Ovdje se utrka završava: drugi gost je stigao prvi.
    if (isOverlapError(error)) {
      return { ok: false, status: 409, code: 'DATES_TAKEN', message: t.errors.DATES_TAKEN };
    }

    console.error('[treescape] upis rezervacije nije uspio:', error.message);
    return { ok: false, status: 500, code: 'SERVER_ERROR', message: t.errors.SERVER_ERROR };
  }

  return { ok: true, booking: data as Booking, quote };
}

/** Poništava rezervaciju kad Stripe sesiju nije bilo moguće napraviti. */
export async function abandonBooking(bookingId: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (error) {
    console.error('[treescape] poništavanje rezervacije nije uspjelo:', error.message);
  }
}

export async function getBookingByToken(token: string): Promise<Booking | null> {
  const { data, error } = await supabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('public_token', token)
    .maybeSingle();

  if (error) {
    console.error('[treescape] čitanje rezervacije nije uspjelo:', error.message);
    return null;
  }

  return (data as Booking) ?? null;
}

/** Ručno blokiranje termina iz administracije. */
export async function blockDates(
  startDate: string,
  endDate: string,
  reason?: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (endDate <= startDate) {
    return { ok: false, status: 400, message: t.errors.INVALID_RANGE };
  }

  if (nightsBetween(startDate, endDate) > 365) {
    return { ok: false, status: 400, message: t.errors.MAX_NIGHTS(365) };
  }

  const { error } = await supabaseAdmin().from('bookings').insert({
    public_token: newPublicToken(),
    start_date: startDate,
    end_date: endDate,
    status: 'blocked',
    payment_method: 'none',
    admin_note: reason ?? null,
  });

  if (error) {
    if (isOverlapError(error)) {
      return { ok: false, status: 409, message: t.errors.DATES_TAKEN };
    }
    console.error('[treescape] blokiranje termina nije uspjelo:', error.message);
    return { ok: false, status: 500, message: t.errors.SERVER_ERROR };
  }

  return { ok: true };
}

/** Termini u budućnosti — koristi ih administracija. */
export async function listBookings(statuses?: string[]): Promise<Booking[]> {
  let query = supabaseAdmin()
    .from('bookings')
    .select('*')
    .gte('end_date', addDaysStr(todayStr(), -365))
    .order('start_date', { ascending: true });

  if (statuses?.length) query = query.in('status', statuses);

  const { data, error } = await query;

  if (error) {
    console.error('[treescape] čitanje rezervacija nije uspjelo:', error.message);
    return [];
  }

  return (data ?? []) as Booking[];
}
