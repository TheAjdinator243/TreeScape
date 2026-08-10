import { NextResponse } from 'next/server';

import {
  ADMIN_COOKIE,
  createSessionToken,
  isValidAccessCode,
  MIN_ACCESS_CODE_LENGTH,
  sessionCookieOptions,
} from '@/lib/admin-auth';
import { rateLimitKey } from '@/lib/client-ip';
import { requireSameOrigin } from '@/lib/csrf';
import { env } from '@/lib/env';
import { getStrings, localeFromRequest } from '@/lib/i18n';
import { consumeRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { adminLoginSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Usporavanje napada grubom silom: pet pokušaja u minuti po adresi.
 *
 * Brojanje ide preko `rateLimitKey`, a ne preko golog `x-forwarded-for`.
 * Razlika je bitna: to zaglavlje je lista kojoj klijent sam piše lijevi kraj,
 * pa je ranije bilo dovoljno uz svaki pokušaj poslati izmišljenu adresu i
 * brojač se nikad ne bi napunio. Sada se uzima ono što upisuje platforma.
 *
 * Kad adrese uopće nema, pokušaji se broje na zajedničkom ključu. To je grubo,
 * ali ide u sigurnu stranu — bez toga bi izostanak zaglavlja bio prolaz.
 *
 * Ograničenje i dalje živi u memoriji jedne instance i nije potpuna zaštita.
 * Prava odbrana je dovoljno dug ADMIN_ACCESS_CODE — vidi `admin-auth.ts`.
 */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const locale = localeFromRequest(request);
  const t = getStrings(locale);

  // Prijava je stanje koje se mijenja, pa i nju se tiče provjera porijekla.
  const wrongOrigin = requireSameOrigin(request, locale);
  if (wrongOrigin) return wrongOrigin;

  if (!env.admin.accessCode || !env.admin.sessionSecret) {
    return NextResponse.json({ error: t.errors.ADMIN_MISSING }, { status: 503 });
  }

  /**
   * Prekratak kod se odbija PRIJE brojanja pokušaja i s jasnom porukom.
   * Bez ovoga bi vlasnik dobijao samo "Pogrešan kod" na kod koji sigurno zna da
   * je tačan, i tražio grešku na pogrešnom mjestu.
   */
  if (env.admin.accessCode.length < MIN_ACCESS_CODE_LENGTH) {
    return NextResponse.json(
      { error: t.errors.ADMIN_CODE_WEAK(MIN_ACCESS_CODE_LENGTH) },
      { status: 503 }
    );
  }

  const key = rateLimitKey(request, 'admin-login') ?? 'admin-login:bez-adrese';
  const limit = consumeRateLimit(key, MAX_ATTEMPTS, WINDOW_MS);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: t.admin.gateLocked },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: t.errors.INVALID_INPUT }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(payload);
  if (!parsed.success || !isValidAccessCode(parsed.data.code)) {
    return NextResponse.json({ error: t.admin.gateWrong }, { status: 401 });
  }

  resetRateLimit(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(), sessionCookieOptions);
  return response;
}

/** Odjava — briše kolačić sesije. */
export async function DELETE(request: Request) {
  const wrongOrigin = requireSameOrigin(request, localeFromRequest(request));
  if (wrongOrigin) return wrongOrigin;

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
