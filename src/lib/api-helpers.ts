import 'server-only';

import { NextResponse } from 'next/server';

import { isDatabaseConfigured } from './env';
import { DEFAULT_LOCALE, getStrings, type Locale } from './i18n';

/**
 * Kratka provjera prije nego ruta dodirne bazu.
 *
 * Bez ovoga bi `supabaseAdmin()` bacio izuzetak zbog nedostajućeg ključa, a
 * pozivalac bi dobio goli 500 bez ikakvog objašnjenja šta da uradi.
 */
export function requireDatabase(locale: Locale = DEFAULT_LOCALE): NextResponse | null {
  if (isDatabaseConfigured) return null;

  return NextResponse.json({ error: getStrings(locale).errors.DATABASE_MISSING }, { status: 503 });
}

/** Sigurno čitanje JSON tijela — neispravan JSON ne smije rušiti rutu. */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function invalidInput(locale: Locale = DEFAULT_LOCALE): NextResponse {
  return NextResponse.json({ error: getStrings(locale).errors.INVALID_INPUT }, { status: 400 });
}

export function serverError(locale: Locale = DEFAULT_LOCALE): NextResponse {
  return NextResponse.json({ error: getStrings(locale).errors.SERVER_ERROR }, { status: 500 });
}
