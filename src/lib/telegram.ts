import 'server-only';

import { formatRange } from './dates';
import { env, isTelegramConfigured } from './env';
import { DEFAULT_LOCALE, getStrings, normalizeLocale } from './i18n';
import { formatMoney } from './pricing';
import type { Booking } from './types';

/**
 * Obavijest vlasniku preko Telegrama.
 *
 * Zašto uopće postoji, kad već ima mail: zahtjev za plaćanje gotovinom drži
 * termin samo neko vrijeme, pa je bitno da vlasnik sazna ODMAH. Mail za to nije
 * dobar — traži verifikovan domen, ume da kasni i rado završi u promocijama.
 * Telegram stigne kao poruka na telefon, besplatno i bez domena.
 *
 * Kao i mail, potpuno je NEOBAVEZAN. Bez ključeva se preskoči i sajt radi
 * normalno. I kao kod maila: rezervacija se NIKADA ne ruši zato što obavijest
 * nije prošla — termin je već siguran u bazi, a to je ono što se ne smije
 * izgubiti.
 */

/** Telegram odustaje sam, ali ne brzo. Bez ovoga bi ruta visila na njemu. */
const TIMEOUT_MS = 8000;

/**
 * Telegram u `HTML` načinu traži da se ova tri znaka pobjegnu — inače ime gosta
 * s ampersandom ili poruka s "<" obori cijelu obavijest greškom o parsiranju.
 */
function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Red "Naziv: vrijednost" — prazne vrijednosti se ne prikazuju kao "undefined". */
function row(label: string, value: string | null | undefined): string {
  return `<b>${esc(label)}:</b> ${esc(value?.trim() || '—')}`;
}

function message(booking: Booking, kind: 'cash' | 'card'): string {
  const t = getStrings(DEFAULT_LOCALE);
  const guestLocale = normalizeLocale(booking.locale) ?? DEFAULT_LOCALE;

  const title = kind === 'cash' ? t.email.ownerCashTitle : t.email.ownerCardTitle;

  const lines = [
    `<b>${esc(title)}</b>`,
    '',
    row(t.email.rowStay, formatRange(booking.start_date, booking.end_date, DEFAULT_LOCALE)),
    row(t.email.rowGuests, booking.guests ? String(booking.guests) : null),
    row(
      t.email.rowAmount,
      formatMoney(
        booking.total_cents,
        booking.price_breakdown?.currencySymbol ?? '€',
        DEFAULT_LOCALE
      )
    ),
    row(t.email.rowReference, booking.public_token.slice(0, 8).toUpperCase()),
    '',
    row(t.email.rowGuest, booking.guest_name),
    row(t.email.rowEmail, booking.guest_email),
    row(t.email.rowPhone, booking.guest_phone),
    row(t.language.label, t.language.names[guestLocale]),
  ];

  if (booking.note?.trim()) {
    lines.push('', row(t.email.rowNote, booking.note));
  }

  if (kind === 'cash') {
    lines.push('', `${esc(t.email.ownerCashHint)}`, `${env.siteUrl}/admin`);
  }

  return lines.join('\n');
}

export async function sendOwnerTelegram(booking: Booking, kind: 'cash' | 'card'): Promise<boolean> {
  if (!isTelegramConfigured) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.telegram.chatId,
        text: message(booking, kind),
        parse_mode: 'HTML',
        // Link na administraciju je tu da se klikne, a ne da zauzme pola poruke
        // pretpregledom stranice.
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!res.ok) {
      // Telegram uz odbijenicu pošalje i razlog ("chat not found", "unauthorized").
      // Bez njega se ovakva greška traži satima, pa ga ispisujemo.
      const detail = await res.text().catch(() => '');
      console.error(`[treescape] Telegram obavijest nije prošla (${res.status}): ${detail}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[treescape] Telegram obavijest nije prošla:', err);
    return false;
  }
}
