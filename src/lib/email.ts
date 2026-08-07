import 'server-only';

import { Resend } from 'resend';

import { formatRange } from './dates';
import { emailTransport, env } from './env';
import {
  DEFAULT_LOCALE,
  directionOf,
  getStrings,
  normalizeLocale,
  type Locale,
} from './i18n';
import { formatMoney } from './pricing';
import type { Booking } from './types';

/** Ime pošiljaoca — isto ono koje stoji na sajtu, a ne zaseban natpis. */
const SENDER_NAME = getStrings(DEFAULT_LOCALE).site.name;

/**
 * Mailovi su NEOBAVEZNI. Bez ijednog podešenog puta aplikacija radi potpuno
 * normalno — samo se ništa ne šalje. Nikada ne rušimo rezervaciju zbog toga
 * što mail nije prošao: termin je već upisan, to je važnije od obavijesti.
 */
async function send(to: string, subject: string, html: string): Promise<SendResult> {
  const transport = emailTransport();

  if (!transport) {
    return {
      ok: false,
      detail:
        'Mail nije podešen. Ili GMAIL_USER + GMAIL_APP_PASSWORD (šalje odmah, bilo kome), ' +
        'ili RESEND_API_KEY (traži vlastiti domen). Dodaj u Vercel → Settings → ' +
        'Environment Variables, pa pokreni Redeploy.',
    };
  }

  try {
    const result =
      transport === 'gmail'
        ? await sendViaGmail(to, subject, html)
        : await sendViaResend(to, subject, html);

    if (!result.ok) console.error('[treescape] slanje maila nije uspjelo:', result.detail);
    return result;
  } catch (err) {
    console.error('[treescape] slanje maila nije uspjelo:', err);
    return { ok: false, detail: `Slanje nije prošlo (${transport}): ${String(err)}` };
  }
}

/**
 * Gmail preko SMTP-a.
 *
 * `nodemailer` se uvozi tek ovdje, i to dinamički: bez toga bi cijela
 * biblioteka ušla u svaki serverski paket koji ikako dodirne ovu datoteku,
 * uključujući i one koji nikad ne pošalju nijedan mail.
 *
 * Pošiljalac MORA biti ista adresa s koje se prijavljujemo. Google svaku drugu
 * tiho prepiše u svoju, pa bi `EMAIL_FROM` ovdje samo lagao o tome šta gost
 * zaista vidi u pretincu.
 */
async function sendViaGmail(to: string, subject: string, html: string): Promise<SendResult> {
  const { user, appPassword } = env.gmail;
  if (!user || !appPassword) return { ok: false, detail: 'Gmail nije podešen.' };

  const nodemailer = (await import('nodemailer')).default;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass: appPassword },

    /**
     * Rokovi nisu ukras — nodemailer ih sam po sebi NEMA.
     *
     * Ovo se vidjelo tek na probi: kad se do Googlea ne može, `sendMail` ne
     * javi grešku nego jednostavno visi. Na Vercelu bi to značilo funkciju
     * koja ostaje živa dok je platforma ne ubije, i to pri svakoj rezervaciji
     * — jer obavijesti idu kroz `after()`, dakle nakon što je gost već dobio
     * odgovor i niko više ne gleda.
     *
     * Ovako padne za desetak sekundi, s jasnim razlogom u dnevniku.
     */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transporter.sendMail({
    from: `${SENDER_NAME} <${user}>`,
    to,
    subject,
    html,
  });

  return { ok: true, detail: `Poslano na ${to} (Gmail).` };
}

async function sendViaResend(to: string, subject: string, html: string): Promise<SendResult> {
  const resend = new Resend(env.email.apiKey);
  const { error } = await resend.emails.send({ from: env.email.from, to, subject, html });

  if (error) {
    return {
      ok: false,
      detail:
        `Resend je odbio: ${error.message}` +
        (/testing emails|own email/i.test(error.message)
          ? ' — dok domen nije potvrđen, Resend prima samo adresu s kojom je nalog otvoren.'
          : ''),
    };
  }

  return { ok: true, detail: `Poslano na ${to} (Resend).` };
}

/**
 * Zašto `send` vraća razlog umjesto da samo šuti.
 *
 * Pozivaocima iz toka rezervacije je i dalje svejedno — oni ovo namjerno
 * ignorišu, jer neuspio mail ne smije oboriti već upisanu rezervaciju. Ali
 * probno slanje iz administracije mora znati ŠTA je pošlo po zlu: bez toga
 * "gostu ne stiže mail" ostaje pogađanje između pogrešnog ključa, nepotvrđene
 * domene i Resendovog ograničenja na vlastitu adresu.
 */
export interface SendResult {
  ok: boolean;
  detail: string;
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

/**
 * Probni mail GOSTU — isti onaj koji stigne nakon zahtjeva za gotovinu.
 *
 * Šalje se na `OWNER_EMAIL`, a ne na izmišljenu adresu, i to s razlogom: dok
 * domen nije potvrđen u Resend-u, Resend dozvoljava slanje SAMO na adresu s
 * kojom je nalog otvoren. Proba na tuđu adresu bi tada pala s greškom koja
 * djeluje kao kvar, a nije.
 *
 * Podaci u probnom mailu su očigledno lažni; jedini tekst dolazi iz rječnika,
 * kao i u pravom mailu.
 */
export async function testGuestEmail(): Promise<SendResult> {
  if (!env.email.ownerEmail) {
    return { ok: false, detail: 'Nedostaje OWNER_EMAIL — nema se gdje poslati proba.' };
  }

  const locale = DEFAULT_LOCALE;
  const t = getStrings(locale);
  const today = new Date();
  const iso = (offsetDays: number) =>
    new Date(today.getTime() + offsetDays * 86_400_000).toISOString().slice(0, 10);

  const primjer: Booking = {
    id: 'proba',
    public_token: 'probaproba',
    guest_name: t.booking.namePlaceholder,
    guest_email: env.email.ownerEmail,
    guest_phone: null,
    guests: 2,
    note: null,
    start_date: iso(7),
    end_date: iso(9),
    status: 'pending_cash',
    payment_method: 'cash',
    total_cents: 60000,
    currency: 'BAM',
    price_breakdown: null,
    payment_reference: null,
    payment_id: null,
    hold_expires_at: null,
    admin_note: null,
    locale,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  };

  return send(
    env.email.ownerEmail,
    subject(locale, t.email.cashRequestSubject),
    layout(
      locale,
      t.email.cashRequestTitle,
      `${intro(primjer, locale, t.email.cashRequestBody)}
       ${detailRows(primjer, locale)}
       ${footNote(t.email.payOnArrival)}`
    )
  );
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
