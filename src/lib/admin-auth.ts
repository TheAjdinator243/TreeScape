import 'server-only';

import { createHash, timingSafeEqual } from 'node:crypto';

import { env } from './env';

export {
  ADMIN_COOKIE,
  createSessionToken,
  isValidSession,
  sessionCookieOptions,
} from './admin-session';

/**
 * Poređenje pristupnog koda u konstantnom vremenu.
 *
 * Obični `===` prekida poređenje na prvom različitom znaku, pa se iz razlike u
 * trajanju odgovora kod može pogađati znak po znak. Zato se oba niza prvo
 * svedu na SHA-256 sažetak — uvijek tačno 32 bajta, bez obzira na dužinu
 * unosa — a onda porede u konstantnom vremenu. Tako ne curi ni sadržaj ni
 * dužina pravog koda.
 */
export function isValidAccessCode(input: string): boolean {
  const expected = env.admin.accessCode;
  if (!expected) return false;

  const a = createHash('sha256').update(input.normalize('NFKC'), 'utf8').digest();
  const b = createHash('sha256').update(expected.normalize('NFKC'), 'utf8').digest();

  return timingSafeEqual(a, b);
}
