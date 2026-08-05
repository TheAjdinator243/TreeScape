import { jwtVerify, SignJWT } from 'jose';

import { env } from './env';

/**
 * Sesija administracije — potpisani kolačić.
 *
 * Ovaj fajl namjerno koristi SAMO `jose` (koji radi na Web Crypto API-ju) i
 * nijedan `node:` modul. Razlog: uvozi ga `middleware.ts`, koji se izvršava u
 * Edge okruženju gdje `node:crypto` ne postoji. Provjera samog pristupnog koda
 * (koja traži `node:crypto`) živi odvojeno, u `admin-auth.ts`.
 */
export const ADMIN_COOKIE = 'treescape_admin';
const SESSION_HOURS = 12;

function secretKey(): Uint8Array {
  const secret = env.admin.sessionSecret;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET mora imati najmanje 32 znaka. Generiši ga sa: openssl rand -base64 32'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('treescape')
    .setAudience('treescape-admin')
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: 'treescape',
      audience: 'treescape-admin',
    });
    return payload.role === 'admin';
  } catch {
    // Istekao, izmijenjen ili potpisan pogrešnom tajnom — sve je isto "ne".
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true, // JavaScript na stranici ne može doći do njega
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_HOURS * 3600,
};
