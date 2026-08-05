import { NextResponse } from 'next/server';

import {
  ADMIN_COOKIE,
  createSessionToken,
  isValidAccessCode,
  sessionCookieOptions,
} from '@/lib/admin-auth';
import { env } from '@/lib/env';
import { t } from '@/lib/strings';
import { adminLoginSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Jednostavno usporavanje napada grubom silom.
 *
 * Drži se u memoriji procesa, pa se na Vercelu resetuje pri hladnom startu i
 * ne dijeli između instanci. Namjerno: ovo je prepreka za skriptu koja gađa
 * kod, a ne potpuna zaštita. Prava odbrana je dovoljno dug ADMIN_ACCESS_CODE.
 */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

function clientKey(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'nepoznato'
  );
}

export async function POST(request: Request) {
  if (!env.admin.accessCode || !env.admin.sessionSecret) {
    return NextResponse.json(
      { error: 'Administracija nije podešena — nedostaju ADMIN_ACCESS_CODE i ADMIN_SESSION_SECRET.' },
      { status: 503 }
    );
  }

  const key = clientKey(request);
  const record = attempts.get(key);
  const now = Date.now();

  if (record && record.count >= MAX_ATTEMPTS && now < record.until) {
    return NextResponse.json({ error: t.admin.gateLocked }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: t.errors.INVALID_INPUT }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(payload);
  if (!parsed.success || !isValidAccessCode(parsed.data.code)) {
    const next = record && now < record.until ? record.count + 1 : 1;
    attempts.set(key, { count: next, until: now + LOCK_MS });
    return NextResponse.json({ error: t.admin.gateWrong }, { status: 401 });
  }

  attempts.delete(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(), sessionCookieOptions);
  return response;
}

/** Odjava — briše kolačić sesije. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
