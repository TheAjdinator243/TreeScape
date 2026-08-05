import 'server-only';

import Stripe from 'stripe';

import { env, requireEnv } from '../env';
import { formatRange } from '../dates';
import { t } from '../strings';
import type { Booking, PriceBreakdown } from '../types';

/**
 * Sve što dodiruje Stripe živi u ovom folderu.
 *
 * Razlog: Stripe trenutno ne otvara naloge firmama registrovanim u BiH. Ako
 * jednog dana treba preći na domaći procesor (Monri, PaySpot, banka), mijenja
 * se ovaj fajl — a ne kalendar, ne baza i ne sučelje.
 */
let cached: Stripe | null = null;

function stripe(): Stripe {
  if (cached) return cached;

  cached = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
    // Verzija je zakucana namjerno: da Stripe promjena na njihovoj strani
    // ne može preko noći promijeniti ponašanje naplate.
    apiVersion: '2026-07-29.dahlia',
    typescript: true,
    appInfo: { name: 'TreeScape', version: '1.0.0' },
  });

  return cached;
}

export async function createCheckoutSession(
  booking: Booking,
  quote: PriceBreakdown
): Promise<{ url: string; sessionId: string }> {
  const stay = formatRange(booking.start_date, booking.end_date);

  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    // Stripe sam prikuplja podatke kartice na svojoj stranici — nijedan broj
    // kartice nikada ne prolazi kroz ovaj sajt.
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: quote.currency.toLowerCase(),
          unit_amount: quote.totalCents,
          product_data: {
            name: `${t.site.name} — ${stay}`,
            description:
              `${t.booking.nightsLabel(quote.nightCount)}, ` +
              `${t.common.guestsCount(booking.guests ?? 1)}. ` +
              `Uključeno čišćenje.`,
          },
        },
      },
    ],
    customer_email: booking.guest_email ?? undefined,
    client_reference_id: booking.id,
    // Webhook čita ovo da zna koju rezervaciju potvrditi.
    metadata: {
      booking_id: booking.id,
      public_token: booking.public_token,
    },
    // Stripe zatvara sesiju otprilike kad istekne i naše držanje termina,
    // pa se ne desi da gost plati termin koji je već oslobođen.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${env.siteUrl}/rezervacija/${booking.public_token}?placeno=1`,
    cancel_url: `${env.siteUrl}/?otkazano=1#rezervacija`,
    locale: 'auto',
  });

  if (!session.url) {
    throw new Error('Stripe nije vratio URL za plaćanje.');
  }

  return { url: session.url, sessionId: session.id };
}

/**
 * Provjera potpisa webhooka.
 *
 * Bez ovoga bi bilo ko mogao poslati POST na našu adresu i "potvrditi"
 * rezervaciju bez ijednog uplaćenog centa.
 */
export function verifyWebhook(rawBody: string, signature: string): Stripe.Event {
  return stripe().webhooks.constructEvent(
    rawBody,
    signature,
    requireEnv('STRIPE_WEBHOOK_SECRET')
  );
}

export type { Stripe };
