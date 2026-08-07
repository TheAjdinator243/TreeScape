import { NextResponse } from 'next/server';

import { testGuestEmail } from '@/lib/email';
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
export async function POST(request: Request) {
  // `?kanal=mail` šalje GOSTOV mail na vlasnikovu adresu; bez njega se
  // provjerava Telegram. Dva dugmeta, jedna ruta.
  const kanal = new URL(request.url).searchParams.get('kanal');

  if (kanal === 'mail') {
    const email = await testGuestEmail();
    return NextResponse.json({
      channel: 'email',
      configured: isEmailConfigured,
      ok: email.ok,
      detail: email.detail,
    });
  }

  const telegram = await testTelegram();
  return NextResponse.json({
    channel: 'telegram',
    configured: isTelegramConfigured,
    ok: telegram.ok,
    detail: telegram.detail,
  });
}
