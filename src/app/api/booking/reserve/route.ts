import { NextResponse } from 'next/server';

import { invalidInput, readJson, requireDatabase } from '@/lib/api-helpers';
import { createBooking } from '@/lib/booking-service';
import {
  sendGuestCashRequest,
  sendGuestConfirmation,
  sendOwnerNotification,
} from '@/lib/email';
import { localeFromRequest } from '@/lib/i18n';
import { bookingRequestSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Jedini put kojim gost pravi rezervaciju — bez obzira na način plaćanja.
 *
 * Šta se dešava nakon upisa određuje `lib/payments`, pa dodavanje novog načina
 * plaćanja ne znači i novu API rutu koju treba zasebno čuvati i štititi.
 */
export async function POST(request: Request) {
  // Jezik gosta određuje i poruke o greškama i, kasnije, jezik svih mailova.
  const locale = localeFromRequest(request);

  const notReady = requireDatabase(locale);
  if (notReady) return notReady;

  const parsed = bookingRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput(locale);

  const { payment_method, ...booking } = parsed.data;

  const result = await createBooking(booking, payment_method, locale);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: result.status }
    );
  }

  // Mailovi ne smiju blokirati odgovor gostu — termin je već siguran u bazi,
  // a neuspio mail nije razlog da gost vidi grešku.
  void notifyByMethod(result);

  return NextResponse.json({
    token: result.booking.public_token,
    status: result.booking.status,
  });
}

async function notifyByMethod(result: Extract<Awaited<ReturnType<typeof createBooking>>, { ok: true }>) {
  const { booking } = result;

  switch (booking.payment_method) {
    case 'cash':
      await Promise.all([
        sendGuestCashRequest(booking),
        sendOwnerNotification(booking, 'cash'),
      ]);
      break;

    case 'test':
      // Test rezervacija je odmah potvrđena — vlasnik ne treba obavijest
      // o novcu koji nikad nije stigao.
      await sendGuestConfirmation(booking);
      break;

    default:
      break;
  }
}
