import 'server-only';

import { NextResponse } from 'next/server';

import { isDatabaseConfigured } from './env';
import { t } from './strings';

/**
 * Kratka provjera prije nego ruta dodirne bazu.
 *
 * Bez ovoga bi `supabaseAdmin()` bacio izuzetak zbog nedostajućeg ključa, a
 * pozivalac bi dobio goli 500 bez ikakvog objašnjenja šta da uradi.
 */
export function requireDatabase(): NextResponse | null {
  if (isDatabaseConfigured) return null;

  return NextResponse.json(
    {
      error:
        'Baza nije podešena. Dodaj Supabase ključeve u .env.local (ili u Vercel → Environment Variables) i pokreni migraciju iz supabase/migrations.',
    },
    { status: 503 }
  );
}

/** Sigurno čitanje JSON tijela — neispravan JSON ne smije rušiti rutu. */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function invalidInput(): NextResponse {
  return NextResponse.json({ error: t.errors.INVALID_INPUT }, { status: 400 });
}

export function serverError(): NextResponse {
  return NextResponse.json({ error: t.errors.SERVER_ERROR }, { status: 500 });
}
