import { NextResponse } from 'next/server';

import { sendGuestConfirmation, sendOwnerNotification } from '@/lib/email';
import { isDatabaseConfigured, isStripeConfigured } from '@/lib/env';
import { verifyWebhook, type Stripe } from '@/lib/payments/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Booking } from '@/lib/types';

// Potpis se provjerava nad SIROVIM tijelom zahtjeva, pa mora Node runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Ovdje rezervacija postaje stvarna.
 *
 * Namjerno NE potvrđujemo rezervaciju na `success_url` — gost može zatvoriti
 * karticu prije preusmjeravanja, a URL može svako otvoriti ručno. Jedini dokaz
 * da je novac stvarno naplaćen je potpisani događaj od Stripe-a.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured || !isDatabaseConfigured) {
    return NextResponse.json({ error: 'Nije podešeno' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Nedostaje potpis' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = verifyWebhook(rawBody, signature);
  } catch (error) {
    // Neispravan potpis znači da pošiljalac nije Stripe.
    console.error('[treescape] neispravan potpis webhooka:', error);
    return NextResponse.json({ error: 'Neispravan potpis' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Stripe ponavlja slanje dok ne dobije 200 — bez ove provjere bi se isti
  // događaj mogao obraditi (i mail poslati) više puta.
  const { error: dedupeError } = await db
    .from('stripe_events')
    .insert({ event_id: event.id, type: event.type });

  if (dedupeError) {
    if (dedupeError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('[treescape] upis stripe događaja nije uspio:', dedupeError.message);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // `paid` je jedino stanje koje zaista znači da je novac stigao.
        if (session.payment_status === 'paid') {
          await confirmBooking(session);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await releaseBooking(session, 'expired');
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await releaseBooking(session, 'cancelled');
        break;
      }

      default:
        // Ostali događaji nas ne zanimaju, ali ih potvrđujemo da ih Stripe
        // ne bi ponavljao u nedogled.
        break;
    }
  } catch (error) {
    console.error('[treescape] obrada webhooka nije uspjela:', error);
    // 500 → Stripe pokušava ponovo, što je ovdje ispravno ponašanje.
    return NextResponse.json({ error: 'Greška u obradi' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function bookingIdOf(session: Stripe.Checkout.Session): string | null {
  return session.metadata?.booking_id ?? session.client_reference_id ?? null;
}

async function confirmBooking(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = bookingIdOf(session);
  if (!bookingId) {
    console.error('[treescape] sesija bez booking_id:', session.id);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const { data, error } = await supabaseAdmin()
    .from('bookings')
    .update({
      status: 'confirmed',
      stripe_payment_intent_id: paymentIntentId,
      // Potvrđena rezervacija se više nikada ne oslobađa sama.
      hold_expires_at: null,
    })
    .eq('id', bookingId)
    // Potvrđujemo samo ono što još čeka uplatu. Ovo štiti od toga da kasni
    // webhook "oživi" rezervaciju koju je vlasnik u međuvremenu otkazao.
    .eq('status', 'pending_payment')
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    // Nema reda za ažuriranje: ili je već potvrđeno (dupli webhook), ili je
    // rezervacija otkazana. Nijedno nije razlog za grešku.
    console.warn('[treescape] nema rezervacije koja čeka uplatu:', bookingId);
    return;
  }

  const booking = data as Booking;
  await Promise.all([sendGuestConfirmation(booking), sendOwnerNotification(booking, 'card')]);
}

async function releaseBooking(
  session: Stripe.Checkout.Session,
  status: 'expired' | 'cancelled'
): Promise<void> {
  const bookingId = bookingIdOf(session);
  if (!bookingId) return;

  const { error } = await supabaseAdmin()
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    // Nikada ne diramo potvrđenu rezervaciju.
    .eq('status', 'pending_payment');

  if (error) throw new Error(error.message);
}
