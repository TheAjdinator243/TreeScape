import 'server-only';

import { Resend } from 'resend';

import { formatRange } from './dates';
import { env, isEmailConfigured } from './env';
import { formatMoney } from './pricing';
import { t } from './strings';
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

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="bs"><body style="margin:0;background:#faf7f1;font-family:system-ui,-apple-system,sans-serif;color:#221d18">
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

function detailRows(booking: Booking): string {
  const stay = formatRange(booking.start_date, booking.end_date);
  const total = formatMoney(booking.total_cents, booking.price_breakdown?.currencySymbol ?? '€');

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#6b6157">Termin</td><td style="padding:8px 0;text-align:right;font-weight:600">${stay}</td></tr>
      <tr><td style="padding:8px 0;color:#6b6157">Gostiju</td><td style="padding:8px 0;text-align:right;font-weight:600">${booking.guests ?? '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#6b6157">Iznos</td><td style="padding:8px 0;text-align:right;font-weight:600">${total}</td></tr>
      <tr><td style="padding:8px 0;color:#6b6157">Broj rezervacije</td><td style="padding:8px 0;text-align:right;font-family:monospace">${booking.public_token.slice(0, 8).toUpperCase()}</td></tr>
    </table>`;
}

/** Gostu — rezervacija plaćena karticom. */
export async function sendGuestConfirmation(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  await send(
    booking.guest_email,
    `Rezervacija potvrđena — ${t.site.name}`,
    layout(
      `Vaša rezervacija je potvrđena`,
      `<p style="font-size:15px;line-height:1.6;color:#453d35;margin:0 0 20px">
         Poštovani/a ${booking.guest_name ?? ''}, hvala vam na rezervaciji. Termin je zaključan i plaćen.
       </p>
       ${detailRows(booking)}
       <p style="font-size:14px;line-height:1.6;color:#6b6157;margin:20px 0 0">
         Tačnu adresu, uputstva za dolazak i kontakt domaćina šaljemo prije dolaska.
       </p>`
    )
  );
}

/** Gostu — zahtjev za plaćanje gotovinom je zaprimljen. */
export async function sendGuestCashRequest(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  await send(
    booking.guest_email,
    `Zahtjev zaprimljen — ${t.site.name}`,
    layout(
      `Zahtjev za rezervaciju je zaprimljen`,
      `<p style="font-size:15px;line-height:1.6;color:#453d35;margin:0 0 20px">
         Poštovani/a ${booking.guest_name ?? ''}, primili smo vaš zahtjev. Termin držimo za vas
         dok ga domaćin ne potvrdi — javljamo se u najkraćem roku.
       </p>
       ${detailRows(booking)}
       <p style="font-size:14px;line-height:1.6;color:#6b6157;margin:20px 0 0">
         Iznos se plaća u gotovini po dolasku.
       </p>`
    )
  );
}

/** Gostu — domaćin je potvrdio zahtjev za gotovinu. */
export async function sendGuestCashApproved(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  await send(
    booking.guest_email,
    `Rezervacija potvrđena — ${t.site.name}`,
    layout(
      `Domaćin je potvrdio vašu rezervaciju`,
      `<p style="font-size:15px;line-height:1.6;color:#453d35;margin:0 0 20px">
         Poštovani/a ${booking.guest_name ?? ''}, termin je vaš. Vidimo se!
       </p>
       ${detailRows(booking)}
       <p style="font-size:14px;line-height:1.6;color:#6b6157;margin:20px 0 0">
         Iznos se plaća u gotovini po dolasku.
       </p>`
    )
  );
}

/** Gostu — domaćin je odbio zahtjev. */
export async function sendGuestCashRejected(booking: Booking): Promise<void> {
  if (!booking.guest_email) return;

  await send(
    booking.guest_email,
    `Rezervacija nije potvrđena — ${t.site.name}`,
    layout(
      `Nažalost, termin nije dostupan`,
      `<p style="font-size:15px;line-height:1.6;color:#453d35;margin:0 0 20px">
         Poštovani/a ${booking.guest_name ?? ''}, domaćin nije bio u mogućnosti potvrditi
         traženi termin. Termin je oslobođen, pa slobodno odaberite drugi.
       </p>
       ${detailRows(booking)}`
    )
  );
}

/** Vlasniku — stigla je nova rezervacija ili zahtjev. */
export async function sendOwnerNotification(booking: Booking, kind: 'card' | 'cash'): Promise<void> {
  if (!env.email.ownerEmail) return;

  const title =
    kind === 'cash' ? 'Novi zahtjev za plaćanje gotovinom' : 'Nova plaćena rezervacija';

  const action =
    kind === 'cash'
      ? `<p style="margin:20px 0 0">
           <a href="${env.siteUrl}/admin" style="display:inline-block;background:#2a5a47;color:#faf7f1;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600">
             Otvori administraciju
           </a>
         </p>
         <p style="font-size:13px;color:#b7791f;margin:16px 0 0">
           Termin je rezervisan i nevidljiv drugim gostima dok ne odlučite.
         </p>`
      : '';

  await send(
    env.email.ownerEmail,
    `${title} — ${t.site.name}`,
    layout(
      title,
      `${detailRows(booking)}
       <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;border-top:1px solid #e9dcc7">
         <tr><td style="padding:8px 0;color:#6b6157">Gost</td><td style="padding:8px 0;text-align:right">${booking.guest_name ?? '—'}</td></tr>
         <tr><td style="padding:8px 0;color:#6b6157">Email</td><td style="padding:8px 0;text-align:right">${booking.guest_email ?? '—'}</td></tr>
         <tr><td style="padding:8px 0;color:#6b6157">Telefon</td><td style="padding:8px 0;text-align:right">${booking.guest_phone ?? '—'}</td></tr>
       </table>
       ${booking.note ? `<p style="font-size:14px;color:#453d35;background:#f4ede0;padding:12px 16px;border-radius:10px;margin:16px 0 0"><strong>Napomena gosta:</strong><br>${booking.note}</p>` : ''}
       ${action}`
    )
  );
}
