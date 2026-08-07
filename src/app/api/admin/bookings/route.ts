import { after, NextResponse } from 'next/server';

import {
  describeIssues,
  invalidInput,
  readJson,
  requireDatabase,
  serverError,
} from '@/lib/api-helpers';
import { sendGuestCashApproved, sendGuestCashRejected } from '@/lib/email';
import { getStrings, localeFromRequest } from '@/lib/i18n';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Booking } from '@/lib/types';
import { bookingDecisionSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Odluka vlasnika o zahtjevu za plaćanje gotovinom.
 *
 * Odobreno → termin ostaje zauzet i postaje potvrđen.
 * Odbijeno → termin se OSLOBAĐA i odmah je opet dostupan drugim gostima
 *            (okidač u bazi sam briše red iz availability_slots).
 */
export async function POST(request: Request) {
  const locale = localeFromRequest(request);

  const notReady = requireDatabase(locale);
  if (notReady) return notReady;

  const parsed = bookingDecisionSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput(locale, describeIssues(parsed.error));

  const { booking_id, decision } = parsed.data;
  const nextStatus = decision === 'approve' ? 'confirmed' : 'cancelled';

  const { data, error } = await supabaseAdmin()
    .from('bookings')
    .update({ status: nextStatus, hold_expires_at: null })
    .eq('id', booking_id)
    // Odlučuje se samo o onome što zaista čeka — ovo sprječava da dvostruki
    // klik ili stara otvorena kartica ponovo "odobri" nešto već riješeno.
    .in('status', ['pending_cash', 'pending_transfer'])
    .select()
    .maybeSingle();

  if (error) {
    console.error('[treescape] odluka o rezervaciji nije upisana:', error.message);
    return serverError(locale, error.message);
  }

  if (!data) {
    return NextResponse.json(
      { error: getStrings(locale).errors.ALREADY_RESOLVED },
      { status: 409 }
    );
  }

  const booking = data as Booking;

  /**
   * Mail gostu ide kroz `after`, a NE kao goli `void`.
   *
   * Ovo je ista greška koja je već jednom popravljena u ruti za rezervaciju, a
   * ovdje je ostala — i zato gost nije dobijao obavijest o odobrenju. Čim se
   * odgovor pošalje, Vercel smije zamrznuti i ugasiti funkciju, a sve što je
   * tada još u zraku nestane s njom. Mail ne stigne ni otići, i nigdje se ne
   * pojavi greška: u administraciji piše da je odobreno, jer jeste — u bazi.
   *
   * `after` platformi kaže da funkciju drži živom dok se posao ne završi.
   */
  after(() =>
    decision === 'approve' ? sendGuestCashApproved(booking) : sendGuestCashRejected(booking)
  );

  return NextResponse.json({ ok: true, status: nextStatus });
}

/** Otkazivanje potvrđene rezervacije ili oslobađanje blokiranog termina. */
export async function DELETE(request: Request) {
  const locale = localeFromRequest(request);

  const notReady = requireDatabase(locale);
  if (notReady) return notReady;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return invalidInput(locale);

  const { error } = await supabaseAdmin()
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    console.error('[treescape] otkazivanje nije uspjelo:', error.message);
    return serverError(locale, error.message);
  }

  return NextResponse.json({ ok: true });
}
