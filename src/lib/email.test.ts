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
