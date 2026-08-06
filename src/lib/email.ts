import 'server-only';

import { Resend } from 'resend';

import { formatRange } from './dates';
import { env, isEmailConfigured } from './env';
import {
  DEFAULT_LOCALE,
  directionOf,
  getStrings,
  normalizeLocale,
  type Locale,
} from './i18n';
import { formatMoney } from './pricing';
import type { Booking } from './types';

/**
 * Mailovi su NEOBAVEZNI. Bez RESEND_API_KEY aplikacija radi potpuno normalno —
 * samo se ništa ne šalje. Nikada ne rušimo rezervaciju zbog toga što mail
 * nije prošao: gost je platio, to je važnije od obavijesti.
 */
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!isEmailConfigured || !env.email.apiKey) return;

  try {
    const resend = new Resend(env.email.apiKey);
    const { error } = await resend.emails.send({ from: env.email.from, to, subject, html });
    if (error) console.error('[treescape] slanje maila nije uspjelo:', error.message);
  } catch (err) {
    console.error('[treescape] slanje maila nije uspjelo:', err);
  }
}

/**
 * Jezik na kojem je gost rezervisao.
 *
 * Stoji uz rezervaciju u bazi (migracija 0003) baš zato što se mailovi šalju i
 * danima kasnije, iz administracije — tada od gosta nema ni kolačića ni
 * zaglavlja preglednika, samo ovaj red u tabeli.
 */
function bookingLocale(booking: Pick<Booking, 'locale'>): Locale {
  return normalizeLocale(booking.locale) ?? DEFAULT_LOCALE;
}

function layout(locale: Locale, title: string, body: string): string {
  const t = getStrings(locale);
  const dir = directionOf(locale);
  // Arapski mail mora biti okrenut zdesna nalijevo, a i poravnanje teksta
  // ide uz smjer — mail klijenti ne nasljeđuju ništa od sajta.
  const align = dir === 'rtl' ? 'right' : 'left';

  return `<!doctype html>
<html lang="${locale}" dir="${dir}"><body style="margin:0;background:#faf7f1;font-family:system-ui,-apple-system,sans-serif;color:#221d18;text-align:${align}">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <p style="font-size:22px;font-weight:600;color:#1f4436;margin:0 0 24px">${t.site.name}</p>
    <div style="background:#fff;border:1px solid #e9dcc7;border-radius:16px;padding:28px">
      <h1 style="font-size:20px;margin:0 0 16px;color:#1f4436">${title}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#8d8377;margin:24px 0 0;text-align:center">
      ${t.site.name} · ${t.site.tagline}
    </p>
  </div>
</body></html>`;
}

/** Naslov maila uvijek nosi i ime kuće — inače se izgubi u pretincu. */
function subject(locale: Locale, line: string): string {
  return `${line} — ${getStrings(locale).site.name}`;
}

function detailRows(booking: Booking, locale: Locale): string {
  const t = getStrings(locale);
  const dir = directionOf(locale);
  const start = dir === 'rtl' ? 'right' : 'left';
  const end = dir === 'rtl' ? 'left' : 'right';

  const stay = formatRange(booking.start_date, booking.end_date, locale);
  const total = formatMoney(
    booking.total_cents,
    booking.price_breakdown?.currencySymbol ?? '€',
    locale
  );

  const row = (label: string, value: string, mono = false) =>
    `<tr>
       <td style="padding:8px 0;color:#6b6157;text-align:${start}">${label}</td>
       <td style="padding:8px 0;text-align:${end};font-weight:600${mono ? ';font-family:monospace' : ''}">${value}</td>
     </tr>`;

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${row(t.email.rowStay, stay)}
      ${row(t.email.rowGuests, String(booking.guests ?? '—'))}
      ${row(t.email.rowAmount, total)}
      ${row(t.email.rowReference, booking.public_token.slice(0, 8).toUpperCase(), true)}
    </table>`;
}

/** Uvodni pasus: "Poštovani/a Ime, …" pa poruka. */
function intro(booking: Booking, locale: Locale, message: string): string {
  const t = getStrings(locale);

  return `<p style="font-size:15px;line-height:1.6;color:#453d35;margin:0 0 20px">
            ${t.email.greeting(booking.guest_name ?? '')} ${message}
          </p>`;
}

function footNote(text: string): string {
  return `<p style="font-size:14px;line-height:1.6;color:#6b6157;margin:20px 0 0">${text}</p>`;
}

/** Gostu — rezervacija je plaćena i potvrđena. */
export async function sendGuestConfirmation(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  const locale = bookingLocale(booking);
  const t = getStrings(locale);

  await send(
    booking.guest_email,
    subject(locale, t.email.confirmedSubject),
    layout(
      locale,
      t.email.confirmedTitle,
      `${intro(booking, locale, t.email.confirmedBody)}
       ${detailRows(booking, locale)}
       ${footNote(t.email.addressLater)}`
    )
  );
}

/** Gostu — zahtjev za plaćanje gotovinom je zaprimljen. */
export async function sendGuestCashRequest(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  const locale = bookingLocale(booking);
  const t = getStrings(locale);

  await send(
    booking.guest_email,
    subject(locale, t.email.cashRequestSubject),
    layout(
      locale,
      t.email.cashRequestTitle,
      `${intro(booking, locale, t.email.cashRequestBody)}
       ${detailRows(booking, locale)}
       ${footNote(t.email.payOnArrival)}`
    )
  );
}

/** Gostu — domaćin je potvrdio zahtjev za gotovinu. */
export async function sendGuestCashApproved(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  const locale = bookingLocale(booking);
  const t = getStrings(locale);

  await send(
    booking.guest_email,
    subject(locale, t.email.cashApprovedSubject),
    layout(
      locale,
      t.email.cashApprovedTitle,
      `${intro(booking, locale, t.email.cashApprovedBody)}
       ${detailRows(booking, locale)}
       ${footNote(t.email.payOnArrival)}`
    )
  );
}

/** Gostu — domaćin je odbio zahtjev. */
export async function sendGuestCashRejected(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  const locale = bookingLocale(booking);
  const t = getStrings(locale);

  await send(
    booking.guest_email,
    subject(locale, t.email.cashRejectedSubject),
    layout(
      locale,
      t.email.cashRejectedTitle,
      `${intro(booking, locale, t.email.cashRejectedBody)}
       ${detailRows(booking, locale)}`
    )
  );
}

/**
 * Vlasniku — stigla je nova rezervacija ili zahtjev.
 *
 * Ovaj mail ide vlasniku kuće, pa ide na jeziku kuće, a ne na jeziku gosta.
 * Gostov jezik se ipak vidi — u redu s podacima o gostu.
 */
export async function sendOwnerNotification(
  booking: Booking,
  kind: 'cash' | 'card'
): Promise<void> {
  if (!env.email.ownerEmail) return;

  const locale = DEFAULT_LOCALE;
  const t = getStrings(locale);

  const title = kind === 'cash' ? t.email.ownerCashTitle : t.email.ownerCardTitle;
  const hint = kind === 'cash' ? t.email.ownerCashHint : '';

  const action =
    kind === 'card'
      ? ''
      : `<p style="margin:20px 0 0">
           <a href="${env.siteUrl}/admin" style="display:inline-block;background:#2a5a47;color:#faf7f1;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600">
             ${t.email.ownerOpenAdmin}
           </a>
         </p>
         <p style="font-size:13px;color:#b7791f;margin:16px 0 0">${hint}</p>`;

  const guestLocale = bookingLocale(booking);
  const languageName = getStrings(locale).language.names[guestLocale];

  await send(
    env.email.ownerEmail,
    subject(locale, title),
    layout(
      locale,
      title,
      `${detailRows(booking, locale)}
       <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;border-top:1px solid #e9dcc7">
         <tr><td style="padding:8px 0;color:#6b6157">${t.email.rowGuest}</td><td style="padding:8px 0;text-align:right">${booking.guest_name ?? '—'}</td></tr>
         <tr><td style="padding:8px 0;color:#6b6157">${t.email.rowEmail}</td><td style="padding:8px 0;text-align:right">${booking.guest_email ?? '—'}</td></tr>
         <tr><td style="padding:8px 0;color:#6b6157">${t.email.rowPhone}</td><td style="padding:8px 0;text-align:right">${booking.guest_phone ?? '—'}</td></tr>
         <tr><td style="padding:8px 0;color:#6b6157">${t.language.label}</td><td style="padding:8px 0;text-align:right">${languageName}</td></tr>
       </table>
       ${booking.note ? `<p style="font-size:14px;color:#453d35;background:#f4ede0;padding:12px 16px;border-radius:10px;margin:16px 0 0"><strong>${t.email.rowNote}:</strong><br>${booking.note}</p>` : ''}
       ${action}`
    )
  );
}
