import { NextResponse } from 'next/server';

import { abandonBooking, createHold } from '@/lib/booking-service';
import { isDatabaseConfigured, isStripeConfigured } from '@/lib/env';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { t } from '@/lib/strings';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { bookingRequestSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Korak 1 plaćanja karticom: zaključaj termin, pa pošalji gosta na Stripe.
 *
 * Termin se drži PRIJE nego što gost ode na plaćanje. Obrnut redoslijed bi
 * značio da dvoje ljudi mogu istovremeno platiti isti termin, a onda bismo
 * jednom morali vraćati novac i objašnjavati se.
 */
export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: 'Baza nije podešena. Pogledaj .env.example i README.' },
      { status: 503 }
    );
  }

  if (!isStripeConfigured) {
    return NextResponse.json({ error: t.errors.PAYMENTS_DISABLED }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: t.errors.INVALID_INPUT }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: t.errors.INVALID_INPUT }, { status: 400 });
  }

  const result = await createHold(parsed.data, 'card');
  if (!result.ok) {
    return NextResponse.json({ error: result.message, code: result.code }, { status: result.status });
  }

  try {
    const session = await createCheckoutSession(result.booking, result.quote);

    await supabaseAdmin()
      .from('bookings')
      .update({ stripe_session_id: session.sessionId })
      .eq('id', result.booking.id);

    return NextResponse.json({ url: session.url, token: result.booking.public_token });
  } catch (error) {
    // Stripe nije uspio — termin se mora odmah osloboditi, inače bi ostao
    // zaključan zbog naše greške.
    console.error('[treescape] Stripe sesija nije napravljena:', error);
    await abandonBooking(result.booking.id);

    return NextResponse.json({ error: t.errors.SERVER_ERROR }, { status: 502 });
  }
}
