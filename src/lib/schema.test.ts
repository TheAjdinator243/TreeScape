import { readFileSync } from 'node:fs';
import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Migracija se testira na PRAVOM Postgresu (PGlite = Postgres preveden u WASM),
 * a ne na izmišljenom modelu.
 *
 * Ovo je najvažniji test u projektu. Zabrana dvostrukog bookinga ne živi u
 * TypeScript-u nego u EXCLUDE ograničenju baze — da je to pogrešno napisano,
 * dvoje ljudi bi moglo platiti isti termin, a tek bi se na licu mjesta vidjelo.
 * Ovdje se to provjeri za sekundu, bez ijednog otvorenog naloga.
 */

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '../../supabase/migrations');
const MIGRATIONS = ['0001_init.sql', '0002_bez_stripea.sql', '0003_jezik_gosta.sql'];

let db: PGlite;

/** Rezervacija gosta — potvrđena ako se ne kaže drugačije. */
function guest(
  token: string,
  start: string,
  end: string,
  status:
    | 'confirmed'
    | 'pending_payment'
    | 'pending_cash'
    | 'pending_transfer' = 'confirmed'
) {
  return db.query<{ id: string }>(
    `insert into bookings
       (public_token, guest_name, guest_email, start_date, end_date, status, payment_method, total_cents)
     values ($1, 'Test Gost', 'test@primjer.ba', $2, $3, $4, 'card', 50000)
     returning id`,
    [token, start, end, status]
  );
}

async function isRejected(promise: Promise<unknown>): Promise<boolean> {
  try {
    await promise;
    return false;
  } catch (error) {
    // 23P01 = povreda EXCLUDE ograničenja
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('no_overlap') || message.includes('23P01');
  }
}

beforeAll(async () => {
  db = new PGlite();

  // PGlite nema Supabase-ove role (anon/authenticated) ni publikaciju
  // supabase_realtime. Ta dva mjesta izbacujemo; sve ostalo — tabele,
  // ograničenja, okidači, funkcije — testira se tačno onako kako će raditi.
  //
  // Migracije se puštaju redom, kao na pravoj bazi, pa se usput provjerava
  // i da svaka sljedeća uredno legne na shemu koju je ostavila prethodna.
  for (const file of MIGRATIONS) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      .replace(/do \$\$\s*begin\s*alter publication[\s\S]*?end;\s*\$\$;/i, '')
      .replace(/^\s*to anon, authenticated\s*$/gim, '');

    await db.exec(sql);
  }
}, 60_000);

afterAll(async () => {
  await db?.close();
});

describe('migracija', () => {
  it('kreira sve tabele', async () => {
    const { rows } = await db.query<{ table_name: string }>(
      `select table_name from information_schema.tables
        where table_schema = 'public' order by table_name`
    );
    expect(rows.map((r) => r.table_name)).toEqual([
      'availability_slots',
      'bookings',
      'payment_events',
      'rate_periods',
      'settings',
    ]);
  });

  it('nema više ničega vezanog za Stripe', async () => {
    const { rows } = await db.query<{ column_name: string }>(
      `select column_name from information_schema.columns
        where table_schema = 'public' and column_name like '%stripe%'`
    );
    expect(rows).toHaveLength(0);
  });

  it('bankovni podaci su dio postavki', async () => {
    const { rows } = await db.query<{ bank_iban: string; transfer_days: number }>(
      'select bank_iban, transfer_days from settings where id = 1'
    );
    expect(rows[0]?.bank_iban).toBe('');
    expect(rows[0]?.transfer_days).toBe(3);
  });

  it('rezervacija pamti jezik gosta', async () => {
    const { rows } = await db.query<{ locale: string }>(
      `select locale from bookings where public_token = 'jezik-podrazumijevani'`
    );
    // Red se upisuje u testu ispod; ovdje se provjerava samo da kolona postoji
    // i da ima podrazumijevanu vrijednost.
    expect(rows).toHaveLength(0);

    await db.query(
      `insert into bookings
         (public_token, guest_name, guest_email, start_date, end_date, status, payment_method)
       values ('jezik-podrazumijevani','Gost','g@primjer.ba','2029-06-01','2029-06-03','confirmed','cash')`
    );

    const inserted = await db.query<{ locale: string }>(
      `select locale from bookings where public_token = 'jezik-podrazumijevani'`
    );
    expect(inserted.rows[0]?.locale).toBe('bs');
  });

  it('odbija jezik koji sajt ne govori', async () => {
    await expect(
      db.query(
        `insert into bookings
           (public_token, guest_name, guest_email, start_date, end_date, status, payment_method, locale)
         values ('jezik-nepoznat','Gost','g@primjer.ba','2029-07-01','2029-07-03','confirmed','cash','de')`
      )
    ).rejects.toThrow();
  });

  it('prima sva tri jezika sajta', async () => {
    for (const [i, locale] of ['bs', 'en', 'ar'].entries()) {
      await expect(
        db.query(
          `insert into bookings
             (public_token, guest_name, guest_email, start_date, end_date, status, payment_method, locale)
           values ($1,'Gost','g@primjer.ba',$2,$3,'confirmed','cash',$4)`,
          [`jezik-${locale}`, `2029-08-0${i * 2 + 1}`, `2029-08-0${i * 2 + 2}`, locale]
        )
      ).resolves.toBeDefined();
    }
  });

  it('upisuje početni red postavki', async () => {
    const { rows } = await db.query<{ count: string }>('select count(*) from settings');
    expect(Number(rows[0]?.count)).toBe(1);
  });
});

describe('dvostruki booking je nemoguć', () => {
  beforeAll(async () => {
    await guest('zauzeto', '2027-08-10', '2027-08-15');
  });

  it.each([
    ['identičan termin', '2027-08-10', '2027-08-15'],
    ['preklapa početak', '2027-08-08', '2027-08-12'],
    ['preklapa kraj', '2027-08-14', '2027-08-20'],
    ['obuhvata postojeći', '2027-08-01', '2027-08-30'],
    ['pada unutar postojećeg', '2027-08-11', '2027-08-13'],
  ])('baza odbija: %s', async (name, start, end) => {
    expect(await isRejected(guest(`sudar-${name}`, start, end))).toBe(true);
  });

  it('zahtjev za gotovinu također blokira termin', async () => {
    expect(await isRejected(guest('gotovina', '2027-08-12', '2027-08-14', 'pending_cash'))).toBe(
      true
    );
  });

  it('nezavršena uplata također blokira termin', async () => {
    expect(await isRejected(guest('uplata', '2027-08-12', '2027-08-14', 'pending_payment'))).toBe(
      true
    );
  });

  it('bankovni transfer koji se čeka također blokira termin', async () => {
    expect(
      await isRejected(guest('transfer', '2027-08-12', '2027-08-14', 'pending_transfer'))
    ).toBe(true);
  });
});

describe('bankovni transfer', () => {
  it('rezervacija koja čeka uplatu odmah zauzima kalendar', async () => {
    const { rows } = await guest('bt-1', '2028-03-01', '2028-03-05', 'pending_transfer');
    const slot = await db.query<{ kind: string }>(
      'select kind from availability_slots where booking_id = $1',
      [rows[0]!.id]
    );
    expect(slot.rows[0]?.kind).toBe('pending');
  });

  it('neplaćen transfer istekne i oslobodi termin', async () => {
    await db.query(
      `insert into bookings
         (public_token, guest_name, guest_email, start_date, end_date, status, payment_method, hold_expires_at)
       values ('bt-istekao','Spor','s@e.ba','2028-04-01','2028-04-05','pending_transfer','bank_transfer', now() - interval '1 day')`
    );

    await db.query('select release_expired_holds()');

    const { rows } = await db.query<{ status: string }>(
      `select status from bookings where public_token = 'bt-istekao'`
    );
    expect(rows[0]?.status).toBe('expired');

    // …i termin je opet slobodan za nekog drugog
    await expect(guest('bt-novi', '2028-04-01', '2028-04-05')).resolves.toBeDefined();
  });

  it('potvrda uplate mijenja termin u "booked"', async () => {
    const { rows } = await guest('bt-2', '2028-05-01', '2028-05-05', 'pending_transfer');
    await db.query(`update bookings set status='confirmed' where id=$1`, [rows[0]!.id]);

    const slot = await db.query<{ kind: string }>(
      'select kind from availability_slots where booking_id = $1',
      [rows[0]!.id]
    );
    expect(slot.rows[0]?.kind).toBe('booked');
  });
});

describe('dan odlaska pripada sljedećem gostu', () => {
  it('dolazak na dan tuđeg odlaska prolazi', async () => {
    await expect(guest('nakon', '2027-08-15', '2027-08-18')).resolves.toBeDefined();
  });

  it('odlazak na dan tuđeg dolaska prolazi', async () => {
    await expect(guest('prije', '2027-08-06', '2027-08-10')).resolves.toBeDefined();
  });
});

describe('otkazivanje oslobađa termin', () => {
  it('otkazan termin se može ponovo rezervisati', async () => {
    const { rows } = await guest('prvi', '2027-10-01', '2027-10-05');
    await db.query(`update bookings set status='cancelled' where id=$1`, [rows[0]!.id]);
    await expect(guest('drugi', '2027-10-01', '2027-10-05')).resolves.toBeDefined();
  });
});

describe('availability_slots prati bookings', () => {
  it('zahtjev za gotovinu odmah zauzima termin', async () => {
    const { rows } = await guest('tok-slot', '2027-11-01', '2027-11-04', 'pending_cash');
    const slot = await db.query<{ kind: string }>(
      'select kind from availability_slots where booking_id=$1',
      [rows[0]!.id]
    );
    expect(slot.rows[0]?.kind).toBe('pending');
  });

  it('odobrenje mijenja vrstu u booked, a odbijanje briše red', async () => {
    const { rows } = await guest('tok-slot2', '2027-11-10', '2027-11-14', 'pending_cash');
    const id = rows[0]!.id;

    await db.query(`update bookings set status='confirmed' where id=$1`, [id]);
    let slot = await db.query<{ kind: string }>(
      'select kind from availability_slots where booking_id=$1',
      [id]
    );
    expect(slot.rows[0]?.kind).toBe('booked');

    await db.query(`update bookings set status='cancelled' where id=$1`, [id]);
    slot = await db.query('select kind from availability_slots where booking_id=$1', [id]);
    expect(slot.rows).toHaveLength(0);
  });

  it('ne izlaže nijedan podatak o gostu', async () => {
    const { rows } = await db.query<{ column_name: string }>(
      `select column_name from information_schema.columns
        where table_name = 'availability_slots' order by column_name`
    );
    expect(rows.map((r) => r.column_name)).toEqual([
      'booking_id',
      'end_date',
      'kind',
      'start_date',
    ]);
  });
});

describe('vlasnik može blokirati termin', () => {
  it('blokiran termin odbija goste', async () => {
    await db.query(
      `insert into bookings (public_token, start_date, end_date, status, payment_method, admin_note)
       values ('blok','2027-12-01','2027-12-10','blocked','none','krečenje')`
    );
    expect(await isRejected(guest('u-bloku', '2027-12-05', '2027-12-08'))).toBe(true);
  });
});

describe('release_expired_holds', () => {
  it('oslobađa samo istekle, a svježe ostavlja', async () => {
    await db.query(
      `insert into bookings (public_token, guest_name, guest_email, start_date, end_date, status, payment_method, hold_expires_at)
       values ('istekao','A','a@b.ba','2028-01-01','2028-01-05','pending_payment','card', now() - interval '1 hour'),
              ('svjez',  'B','b@b.ba','2028-02-01','2028-02-05','pending_payment','card', now() + interval '10 minutes')`
    );

    const { rows } = await db.query<{ n: number }>('select release_expired_holds() as n');
    expect(rows[0]?.n).toBe(1);

    const stale = await db.query<{ status: string }>(
      `select status from bookings where public_token='istekao'`
    );
    expect(stale.rows[0]?.status).toBe('expired');

    const fresh = await db.query<{ status: string }>(
      `select status from bookings where public_token='svjez'`
    );
    expect(fresh.rows[0]?.status).toBe('pending_payment');

    // Napušten termin je opet slobodan…
    await expect(guest('novi-gost', '2028-01-01', '2028-01-05')).resolves.toBeDefined();
    // …a onaj koji još traje i dalje drži svoj.
    expect(await isRejected(guest('prerano', '2028-02-01', '2028-02-05'))).toBe(true);
  });
});

describe('ograničenja podataka', () => {
  it('odbija odlazak isti kao dolazak', async () => {
    await expect(guest('nula-noci', '2027-09-10', '2027-09-10')).rejects.toThrow();
  });

  it('odbija odlazak prije dolaska', async () => {
    await expect(guest('unazad', '2027-09-10', '2027-09-05')).rejects.toThrow();
  });

  it('odbija rezervaciju gosta bez imena i maila', async () => {
    await expect(
      db.query(
        `insert into bookings (public_token, start_date, end_date, status, payment_method)
         values ('bez-gosta','2029-01-01','2029-01-05','confirmed','card')`
      )
    ).rejects.toThrow();
  });

  it('dozvoljava blokadu bez podataka o gostu', async () => {
    await expect(
      db.query(
        `insert into bookings (public_token, start_date, end_date, status, payment_method)
         values ('blok2','2029-03-01','2029-03-05','blocked','none')`
      )
    ).resolves.toBeDefined();
  });

  it('ne dozvoljava dva reda u tabeli postavki', async () => {
    await expect(db.query('insert into settings (id) values (2)')).rejects.toThrow();
  });
});
