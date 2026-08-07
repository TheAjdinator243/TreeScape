import { NextResponse } from 'next/server';

import { isEmailConfigured, isTelegramConfigured } from '@/lib/env';
import { testTelegram } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Provjera kanala obavijesti — iz administracije, bez pravljenja rezervacije.
 *
 * Ruta je pod /api/admin, pa je čuvar iz `proxy.ts` već zatvorio pristupnim
 * kodom. Odgovor namjerno nosi i razlog kvara: ovo vidi samo vlasnik, a bez
 * razloga bi "ne stiže mi ništa" ostalo pogađanje.
 *
 * Token se NIKADA ne vraća — samo je li podešen.
 */
export async function POST() {
  const telegram = await testTelegram();

  return NextResponse.json({
    telegram: {
      configured: isTelegramConfigured,
      ok: telegram.ok,
      detail: telegram.detail,
    },
    email: {
      configured: isEmailConfigured,
      detail: isEmailConfigured
        ? 'Podešen.'
        : 'Nije podešen (nedostaje RESEND_API_KEY ili OWNER_EMAIL). Nije greška — Telegram je dovoljan.',
    },
  });
}
