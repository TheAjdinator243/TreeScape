import 'server-only';

import { addDaysStr, todayStr } from './dates';
import { DEMO_SETTINGS, demoPeriods, demoSlots } from './demo-data';
import { isDatabaseConfigured } from './env';
import { supabaseAdmin } from './supabase/admin';
import type { AvailabilitySlot, BookingContext, RatePeriod, Settings } from './types';

/**
 * Oslobađa termine koje su gosti ostavili na Stripe stranici pa odustali.
 *
 * Poziva se prije svakog čitanja dostupnosti i prije svakog upisa. Ne oslanjamo
 * se samo na cron: da cron zakaže, termin bi ostao zaključan zauvijek, a ovako
 * ga oslobodi prvi sljedeći posjetilac stranice.
 */
export async function releaseExpiredHolds(): Promise<void> {
  if (!isDatabaseConfigured) return;

  const { error } = await supabaseAdmin().rpc('release_expired_holds');
  if (error) {
    // Nije razlog da stranica padne — u najgorem slučaju je kalendar
    // nakratko konzervativniji nego što mora biti.
    console.error('[treescape] release_expired_holds nije uspio:', error.message);
  }
}

/** Zauzeti termini od danas pa dvije godine unaprijed. */
export async function getAvailability(): Promise<AvailabilitySlot[]> {
  if (!isDatabaseConfigured) return demoSlots();

  await releaseExpiredHolds();

  const horizon = addDaysStr(todayStr(), 730);

  const { data, error } = await supabaseAdmin()
    .from('availability_slots')
    .select('booking_id, start_date, end_date, kind')
    .gte('end_date', todayStr())
    .lte('start_date', horizon)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('[treescape] čitanje dostupnosti nije uspjelo:', error.message);
    return [];
  }

  return (data ?? []) as AvailabilitySlot[];
}

export async function getRatePeriods(): Promise<RatePeriod[]> {
  if (!isDatabaseConfigured) return demoPeriods();

  const { data, error } = await supabaseAdmin()
    .from('rate_periods')
    .select('id, name, start_date, end_date, nightly_price_cents, min_nights, priority')
    .order('priority', { ascending: false });

  if (error) {
    console.error('[treescape] čitanje cjenovnika nije uspjelo:', error.message);
    return [];
  }

  return (data ?? []) as RatePeriod[];
}

export async function getSettings(): Promise<Settings> {
  if (!isDatabaseConfigured) return DEMO_SETTINGS;

  const { data, error } = await supabaseAdmin().from('settings').select('*').eq('id', 1).single();

  if (error || !data) {
    console.error('[treescape] čitanje postavki nije uspjelo:', error?.message);
    return DEMO_SETTINGS;
  }

  return data as Settings;
}

/** Sve što kalendaru treba za prvi prikaz — u jednom prolazu. */
export async function getBookingContext(): Promise<BookingContext> {
  const [slots, periods, settings] = await Promise.all([
    getAvailability(),
    getRatePeriods(),
    getSettings(),
  ]);

  return { slots, periods, settings };
}
