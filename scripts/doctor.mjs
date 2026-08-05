#!/usr/bin/env node
/**
 * Provjera podešavanja — `npm run doctor`
 *
 * Prolazi kroz sve što mora biti tačno da bi rezervacije radile, i javi
 * TAČNO šta fali i gdje se to popravlja.
 *
 * Nijedan ključ se ne ispisuje — samo maskirano (sk_t••••••••4242), tako da
 * izlaz ove komande možeš slobodno nekome pokazati.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

let failures = 0;
let warnings = 0;

const ok = (msg, extra = '') => console.log(`  ${c.green('✓')} ${msg} ${c.dim(extra)}`);
const bad = (msg, fix) => {
  failures++;
  console.log(`  ${c.red('✗')} ${msg}`);
  if (fix) console.log(`      ${c.yellow('→')} ${fix}`);
};
const warn = (msg, fix) => {
  warnings++;
  console.log(`  ${c.yellow('!')} ${msg}`);
  if (fix) console.log(`      ${c.dim('→')} ${fix}`);
};
const section = (title) => console.log(c.cyan(`\n─── ${title} ───`));

function mask(v) {
  if (!v) return '';
  return v.length <= 10 ? '••••' : `${v.slice(0, 6)}${'•'.repeat(8)}${v.slice(-4)}`;
}

// ── Učitavanje .env.local ───────────────────────────────────────────────────
const ENV_PATH = path.resolve(process.cwd(), '.env.local');

console.log(c.bold('\n╔════════════════════════════════════════════╗'));
console.log(c.bold('║   TreeScape — provjera podešavanja         ║'));
console.log(c.bold('╚════════════════════════════════════════════╝'));

section('Datoteka .env.local');

if (!existsSync(ENV_PATH)) {
  bad('.env.local ne postoji', 'pokreni: npm run setup');
  console.log(c.red('\nBez te datoteke dalje nema šta da se provjerava.\n'));
  process.exit(1);
}
ok('.env.local postoji');

const env = {};
for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && m[2].trim()) env[m[1]] = m[2].trim();
}

// ── Supabase ────────────────────────────────────────────────────────────────
section('Supabase');

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

let db = null;

if (!url || !anonKey || !serviceKey) {
  bad(
    'nedostaju Supabase ključevi',
    'npm run setup  (Supabase → Project Settings → API)'
  );
  console.log(
    c.dim('\n  Bez baze sajt i dalje radi, ali na demo podacima — prave rezervacije ne rade.')
  );
} else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
  bad(`adresa ne izgleda ispravno: ${url}`, 'treba oblik https://abcdefgh.supabase.co');
} else if (serviceKey === anonKey) {
  bad(
    'service role ključ je isti kao anon ključ',
    'to su dva RAZLIČITA ključa na istoj stranici u Supabase-u'
  );
} else {
  ok('ključevi postavljeni', `${mask(serviceKey)}`);

  const { createClient } = await import('@supabase/supabase-js');
  db = createClient(url, serviceKey, { auth: { persistSession: false } });

  // ── Migracija ─────────────────────────────────────────────────────────────
  section('Migracija baze');

  const tables = ['bookings', 'availability_slots', 'rate_periods', 'settings', 'stripe_events'];
  let missing = [];

  for (const table of tables) {
    const { error } = await db.from(table).select('*', { count: 'exact', head: true });
    if (error) missing.push(table);
  }

  if (missing.length === tables.length) {
    bad(
      'nijedna tabela ne postoji — migracija nije pokrenuta',
      'Supabase → SQL Editor → zalijepi cijeli supabase/migrations/0001_init.sql → Run'
    );
  } else if (missing.length > 0) {
    bad(
      `nedostaju tabele: ${missing.join(', ')}`,
      'ponovo pokreni supabase/migrations/0001_init.sql u SQL Editoru'
    );
  } else {
    ok('sve tabele postoje', tables.join(', '));

    const { data: settings } = await db.from('settings').select('*').eq('id', 1).maybeSingle();
    if (!settings) {
      bad('nema reda u tabeli settings', "pokreni: insert into settings (id) values (1);");
    } else {
      ok(
        'postavke učitane',
        `${settings.default_nightly_cents / 100} ${settings.currency_symbol}/noćenje, ` +
          `čišćenje ${settings.cleaning_fee_cents / 100}, min ${settings.min_nights} noćenja`
      );
    }

    const { error: rpcError } = await db.rpc('release_expired_holds');
    if (rpcError) {
      bad('funkcija release_expired_holds ne postoji', 'ponovo pokreni migraciju');
    } else {
      ok('funkcija release_expired_holds radi');
    }

    // ── NAJVAŽNIJA PROVJERA ────────────────────────────────────────────────
    // Ne gledamo metapodatke nego stvarno ponašanje: upišemo dva termina koja
    // se preklapaju i tražimo da baza odbije drugi. Koristi 2099. godinu i
    // sve za sobom počisti.
    section('Zaštita od dvostrukog bookinga');

    const tokenA = `doctor-a-${Date.now()}`;
    const tokenB = `doctor-b-${Date.now()}`;
    const row = (token) => ({
      public_token: token,
      start_date: '2099-01-10',
      end_date: '2099-01-15',
      status: 'blocked',
      payment_method: 'none',
      admin_note: 'automatska provjera — briše se odmah',
    });

    try {
      const { error: firstError } = await db.from('bookings').insert(row(tokenA));

      if (firstError) {
        bad(`ne mogu upisati probni termin: ${firstError.message}`, 'provjeri migraciju');
      } else {
        const { error: secondError } = await db.from('bookings').insert(row(tokenB));

        if (!secondError) {
          bad(
            'BAZA JE PRIMILA DVA PREKLAPAJUĆA TERMINA — dvostruki booking je moguć!',
            'ograničenje bookings_no_overlap nedostaje. Ponovo pokreni 0001_init.sql.'
          );
        } else if (secondError.code === '23P01') {
          ok('baza odbija preklapanje', 'greška 23P01 — tačno kako treba');
        } else {
          warn(
            `drugi upis je odbijen, ali s neočekivanom greškom: ${secondError.code}`,
            secondError.message
          );
        }

        // Da li okidač održava javni kalendar?
        const { data: slot } = await db
          .from('availability_slots')
          .select('kind')
          .eq('start_date', '2099-01-10')
          .maybeSingle();

        if (slot) ok('okidač upisuje termin u javni kalendar', `vrsta: ${slot.kind}`);
        else bad('okidač ne puni availability_slots', 'ponovo pokreni migraciju');
      }
    } finally {
      await db.from('bookings').delete().in('public_token', [tokenA, tokenB]);
      const { data: leftovers } = await db
        .from('bookings')
        .select('public_token')
        .in('public_token', [tokenA, tokenB]);
      if (leftovers?.length) {
        warn('probni redovi nisu obrisani', `obriši ručno: ${leftovers.map((l) => l.public_token).join(', ')}`);
      } else {
        ok('probni podaci obrisani');
      }
    }

    // ── Privatnost gostiju ─────────────────────────────────────────────────
    section('Privatnost podataka o gostima');

    const publicDb = createClient(url, anonKey, { auth: { persistSession: false } });

    const { data: leaked, error: blockedError } = await publicDb
      .from('bookings')
      .select('guest_name, guest_email, guest_phone');

    if (leaked && leaked.length > 0) {
      bad(
        `PREGLEDNIK MOŽE ČITATI PODATKE GOSTIJU (${leaked.length} redova)!`,
        'RLS nije uključen. Ponovo pokreni 0001_init.sql, dio pod "7. SIGURNOST".'
      );
    } else if (blockedError || (leaked && leaked.length === 0)) {
      ok('imena, mailovi i telefoni gostiju su nedostupni iz preglednika');
    }

    const { error: slotsError } = await publicDb
      .from('availability_slots')
      .select('start_date')
      .limit(1);

    if (slotsError) {
      bad(
        'preglednik NE MOŽE čitati slobodne termine — kalendar će biti prazan',
        'ponovo pokreni migraciju (politika "javno citanje dostupnosti")'
      );
    } else {
      ok('preglednik može čitati slobodne termine');
    }
  }
}

// ── Stripe ──────────────────────────────────────────────────────────────────
section('Stripe');

if (!env.STRIPE_SECRET_KEY) {
  warn(
    'Stripe nije podešen — plaćanje karticom se neće prikazati',
    'to je u redu ako za sada želiš samo plaćanje gotovinom'
  );
} else {
  const { default: Stripe } = await import('stripe');
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-07-29.dahlia' });
    const balance = await stripe.balance.retrieve();

    ok('ključ je ispravan', mask(env.STRIPE_SECRET_KEY));

    if (balance.livemode) {
      warn('koristiš PRODUKCIJSKI ključ (sk_live_) — naplaćuju se pravi novci');
    } else {
      ok('test mod', 'kartica za probu: 4242 4242 4242 4242');
    }
  } catch (error) {
    bad(`Stripe odbija ključ: ${error.message}`, 'Stripe → Developers → API keys');
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    bad(
      'nedostaje STRIPE_WEBHOOK_SECRET — uplate se NIKAD neće potvrditi',
      'lokalno: stripe listen --forward-to localhost:3000/api/stripe/webhook'
    );
  } else if (!env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    bad('STRIPE_WEBHOOK_SECRET ne počinje sa whsec_', 'prekopiraj ga ponovo');
  } else {
    ok('webhook tajna postavljena', mask(env.STRIPE_WEBHOOK_SECRET));
  }
}

// ── Administracija ──────────────────────────────────────────────────────────
section('Administracija');

if (!env.ADMIN_ACCESS_CODE) {
  bad('nema ADMIN_ACCESS_CODE — /admin se ne može otvoriti', 'npm run setup');
} else if (env.ADMIN_ACCESS_CODE.length < 12) {
  warn(
    `pristupni kod ima samo ${env.ADMIN_ACCESS_CODE.length} znakova`,
    'neka bude bar 16 — ovo je jedina brava na administraciji'
  );
} else {
  ok('pristupni kod postavljen', `${env.ADMIN_ACCESS_CODE.length} znakova`);
}

if (!env.ADMIN_SESSION_SECRET) {
  bad('nema ADMIN_SESSION_SECRET', 'npm run setup');
} else if (env.ADMIN_SESSION_SECRET.length < 32) {
  bad(
    `ADMIN_SESSION_SECRET ima ${env.ADMIN_SESSION_SECRET.length} znakova, treba najmanje 32`,
    'npm run setup  (Enter na tom pitanju generiše ispravnu tajnu)'
  );
} else {
  ok('tajna sesije dovoljno duga');
}

if (!env.CRON_SECRET) {
  warn('nema CRON_SECRET — svako bi mogao pozvati cron adresu', 'npm run setup');
} else {
  ok('cron tajna postavljena');
}

// ── Ostalo ──────────────────────────────────────────────────────────────────
section('Ostalo');

const site = env.NEXT_PUBLIC_SITE_URL;
if (!site) {
  warn('nema NEXT_PUBLIC_SITE_URL', 'lokalno: http://localhost:3000');
} else if (site.endsWith('/')) {
  bad(`NEXT_PUBLIC_SITE_URL završava kosom crtom: ${site}`, 'ukloni / s kraja');
} else {
  ok('adresa sajta', site);
  if (site.includes('localhost') && env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    warn('produkcijski Stripe ključ uz localhost adresu', 'to skoro sigurno nije namjerno');
  }
}

if (!env.RESEND_API_KEY) {
  warn('email nije podešen — potvrde se neće slati', 'opcionalno: resend.com');
} else if (!env.OWNER_EMAIL) {
  warn('nema OWNER_EMAIL — nećeš dobijati obavijesti o rezervacijama');
} else {
  ok('email podešen', env.OWNER_EMAIL);
}

// ── Zaključak ───────────────────────────────────────────────────────────────
console.log();
console.log('─'.repeat(48));

if (failures === 0 && warnings === 0) {
  console.log(c.green(c.bold('\n  Sve je ispravno podešeno. ✓')));
  console.log(c.dim('\n  Pokreni: npm run dev\n'));
} else if (failures === 0) {
  console.log(c.green(c.bold(`\n  Radi. ${warnings} upozorenje/a (ništa kritično).`)));
  console.log(c.dim('\n  Pokreni: npm run dev\n'));
} else {
  console.log(c.red(c.bold(`\n  ${failures} greška/e${warnings ? `, ${warnings} upozorenje/a` : ''}.`)));
  console.log(c.dim('  Popravi ono označeno crvenim ✗ pa pokreni ponovo: npm run doctor\n'));
}

process.exit(failures > 0 ? 1 : 0);
