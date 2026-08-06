/**
 * Čitanje varijabli okruženja na jednom mjestu.
 *
 * Aplikacija je namjerno napravljena tako da se PODIŽE i bez ijednog ključa —
 * tako možeš vidjeti cijeli sajt prije nego otvoriš ijedan nalog.
 * Ono što nedostaje se javlja jasnom porukom tek kad se stvarno zatreba.
 */

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

/** Obavezan ključ — baca jasnu grešku umjesto zagonetnog "undefined". */
function required(name: string): string {
  const value = optional(name);
  if (!value) {
    throw new Error(
      `Nedostaje varijabla okruženja: ${name}. ` +
        `Dodaj je u .env.local (pogledaj .env.example) ili u Vercel → Settings → Environment Variables.`
    );
  }
  return value;
}

export const env = {
  supabase: {
    url: optional('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: optional('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY'),
  },
  /**
   * Test način plaćanja — potvrđuje rezervaciju bez ijednog pravog centa.
   * Postoji da se cijeli tok može isprobati. Uključuje se samo izričito.
   */
  enableTestPayments: optional('ENABLE_TEST_PAYMENTS') === 'true',
  admin: {
    accessCode: optional('ADMIN_ACCESS_CODE'),
    sessionSecret: optional('ADMIN_SESSION_SECRET'),
  },
  cronSecret: optional('CRON_SECRET'),
  siteUrl: optional('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000',
  email: {
    apiKey: optional('RESEND_API_KEY'),
    from: optional('EMAIL_FROM') ?? 'TreeScape <onboarding@resend.dev>',
    ownerEmail: optional('OWNER_EMAIL'),
  },
} as const;

/** Je li baza uopće podešena? Ako nije, sajt radi na demo podacima. */
export const isDatabaseConfigured = Boolean(
  env.supabase.url && env.supabase.anonKey && env.supabase.serviceRoleKey
);

export const isEmailConfigured = Boolean(env.email.apiKey && env.email.ownerEmail);

export { required as requireEnv };
