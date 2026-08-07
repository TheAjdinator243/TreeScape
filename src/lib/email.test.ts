import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Kojim putem ide mail.
 *
 * Ovo su testovi za jednu tihu vrstu kvara: mail se "šalje", nigdje nema
 * greške, a gostu ništa ne stiže — jer nijedan put nije podešen, ili je
 * podešen onaj koji u tom trenutku ne može do tuđe adrese.
 */

async function ucitaj(kljucevi: Record<string, string>) {
  vi.resetModules();
  vi.unstubAllEnvs();
  for (const [ime, vrijednost] of Object.entries(kljucevi)) vi.stubEnv(ime, vrijednost);
  return import('./env');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('emailTransport', () => {
  it('bez ijednog ključa nema puta — i to nije greška', async () => {
    const { emailTransport, isEmailConfigured } = await ucitaj({});

    expect(emailTransport()).toBeNull();
    expect(isEmailConfigured).toBe(false);
  });

  it('Gmail traži i adresu i lozinku za aplikacije', async () => {
    const samoAdresa = await ucitaj({ GMAIL_USER: 'vlasnik@gmail.com' });
    expect(samoAdresa.emailTransport()).toBeNull();

    const samoLozinka = await ucitaj({ GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop' });
    expect(samoLozinka.emailTransport()).toBeNull();

    const oboje = await ucitaj({
      GMAIL_USER: 'vlasnik@gmail.com',
      GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop',
    });
    expect(oboje.emailTransport()).toBe('gmail');
  });

  it('sam Resend ključ je dovoljan', async () => {
    const { emailTransport } = await ucitaj({ RESEND_API_KEY: 're_test' });
    expect(emailTransport()).toBe('resend');
  });

  it('kad su podešena oba, Gmail ima prednost', async () => {
    // Namjerno: Resend bez potvrđenog domena ne može pisati pravom gostu, a
    // Gmail može. Da je obrnuto, gost bi tiho ostao bez maila.
    const { emailTransport } = await ucitaj({
      RESEND_API_KEY: 're_test',
      GMAIL_USER: 'vlasnik@gmail.com',
      GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop',
    });

    expect(emailTransport()).toBe('gmail');
  });

  it('OWNER_EMAIL ne otvara put sam za sebe', async () => {
    // Adresa vlasnika kaže KOME se javlja, ne ČIME. Bez puta nema slanja.
    const { emailTransport } = await ucitaj({ OWNER_EMAIL: 'vlasnik@primjer.ba' });
    expect(emailTransport()).toBeNull();
  });

  it('prazan ključ se broji kao da ga nema', async () => {
    // Vercel rado ostavi varijablu praznu umjesto da je obriše.
    const { emailTransport } = await ucitaj({ RESEND_API_KEY: '   ' });
    expect(emailTransport()).toBeNull();
  });
});

describe('send bez podešenog puta', () => {
  it('ne baca grešku i kaže šta nedostaje', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();

    const { testGuestEmail } = await import('./email');
    const rezultat = await testGuestEmail();

    expect(rezultat.ok).toBe(false);
    // Poruka mora imenovati oba puta — inače vlasnik ne zna šta mu je izbor.
    expect(rezultat.detail).toContain('OWNER_EMAIL');
  });

  it('s adresom vlasnika, ali bez puta, javlja oba načina', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('OWNER_EMAIL', 'vlasnik@primjer.ba');

    const { testGuestEmail } = await import('./email');
    const rezultat = await testGuestEmail();

    expect(rezultat.ok).toBe(false);
    expect(rezultat.detail).toContain('GMAIL_USER');
    expect(rezultat.detail).toContain('RESEND_API_KEY');
  });
});

describe('lozinka za aplikacije s razmacima', () => {
  it('razmaci iz Googleovog prikaza ne obaraju prijavu', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    // Tačno onako kako Google pokaže i kako se prepiše.
    vi.stubEnv('GMAIL_USER', 'vlasnik@gmail.com');
    vi.stubEnv('GMAIL_APP_PASSWORD', 'alzx zksq yxuc odbp');
    vi.stubEnv('OWNER_EMAIL', 'vlasnik@gmail.com');

    const poslano: { pass?: string }[] = [];
    vi.doMock('nodemailer', () => ({
      default: {
        createTransport: (opts: { auth?: { pass?: string } }) => {
          poslano.push({ pass: opts.auth?.pass });
          return { sendMail: async () => ({}) };
        },
      },
    }));

    const { testGuestEmail } = await import('./email');
    const rezultat = await testGuestEmail();

    expect(rezultat.ok).toBe(true);
    expect(poslano[0]?.pass).toBe('alzxzksqyxucodbp');
  });
});

describe('poruka o grešci objašnjava zašto', () => {
  async function sResendom(env: Record<string, string>, poruka: string) {
    vi.resetModules();
    vi.unstubAllEnvs();
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.doMock('resend', () => ({
      Resend: class {
        emails = { send: async () => ({ error: { message: poruka } }) };
      },
    }));
    const { testGuestEmail } = await import('./email');
    return (await testGuestEmail()).detail;
  }

  it('Gmail adresa preko Resenda je slijepa ulica, i to se kaže', async () => {
    const detalj = await sResendom(
      {
        RESEND_API_KEY: 're_test',
        OWNER_EMAIL: 'vlasnik@gmail.com',
        EMAIL_FROM: 'TreeScape <vlasnik@gmail.com>',
      },
      'The gmail.com domain is not verified. Please, add and verify your domain on https://resend.com/domains'
    );

    // Ključno: ne smije zvučati kao "potvrdi domen gmail.com", jer to je nemoguće.
    expect(detalj).toContain('ne može slati');
    expect(detalj).toContain('GMAIL_APP_PASSWORD');
  });

  it('napola podešen Gmail se prijavi kao pravi uzrok', async () => {
    const detalj = await sResendom(
      {
        RESEND_API_KEY: 're_test',
        OWNER_EMAIL: 'vlasnik@gmail.com',
        GMAIL_USER: 'vlasnik@gmail.com',
      },
      'The gmail.com domain is not verified.'
    );

    expect(detalj).toContain('GMAIL_APP_PASSWORD');
    expect(detalj).toContain('napola podešen');
  });
});

describe('lažno zelena proba', () => {
  it('uspjeh preko onboarding@resend.dev nosi upozorenje da gost svejedno neće dobiti', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('OWNER_EMAIL', 'vlasnik@gmail.com');
    // Zadana vrijednost EMAIL_FROM — Resendova zajednička adresa.
    vi.doMock('resend', () => ({
      Resend: class {
        emails = { send: async () => ({ error: null }) };
      },
    }));

    const { testGuestEmail } = await import('./email');
    const rezultat = await testGuestEmail();

    // Poslano jeste — ali samo vlasniku, i to ništa ne dokazuje.
    expect(rezultat.ok).toBe(true);
    expect(rezultat.detail).toContain('NE dokazuje');
    expect(rezultat.detail).toContain('GMAIL_USER');
  });

  it('s potvrđenim domenom nema upozorenja', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('OWNER_EMAIL', 'vlasnik@treescape.ba');
    vi.stubEnv('EMAIL_FROM', 'TreeScape <rezervacije@treescape.ba>');
    vi.doMock('resend', () => ({
      Resend: class {
        emails = { send: async () => ({ error: null }) };
      },
    }));

    const { testGuestEmail } = await import('./email');
    const rezultat = await testGuestEmail();

    expect(rezultat.ok).toBe(true);
    expect(rezultat.detail).not.toContain('NE dokazuje');
  });
});
