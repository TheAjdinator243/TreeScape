import { NextResponse } from 'next/server';

import { createHold } from '@/lib/booking-service';
import { sendGuestCashRequest, sendOwnerNotification } from '@/lib/email';
import { isDatabaseConfigured } from '@/lib/env';
import { t } from '@/lib/strings';
import { bookingRequestSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Zahtjev za plaćanje u gotovini.
 *
 * Termin se odmah drži (status `pending_cash`) i drugim gostima izgleda
 * zauzeto — inače bi vlasnik odobrio zahtjev tek da otkrije da je termin u
 * međuvremenu neko platio karticom. Ne oslobađa se sam: čeka vlasnikovu
 * odluku u administraciji.
 */
export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: 'Baza nije podešena. Pogledaj .env.example i README.' },
      { status: 503 }
    );
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

  const result = await createHold(parsed.data, 'cash');
  if (!result.ok) {
    return NextResponse.json({ error: result.message, code: result.code }, { status: result.status });
  }

  // Mailovi ne smiju blokirati odgovor gostu — termin je već siguran u bazi.
  void Promise.all([
    sendGuestCashRequest(result.booking),
    sendOwnerNotification(result.booking, 'cash'),
  ]);

  return NextResponse.json({ token: result.booking.public_token });
}
