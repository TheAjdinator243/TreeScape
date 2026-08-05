import { describe, expect, it } from 'vitest';

import { addDaysStr, daysBetween, eachDay, rangesOverlap, todayStr } from './dates';
import { formatMoney, quoteStay, rangeHasConflict, takenDayMap, validateStay } from './pricing';
import type { AvailabilitySlot, RatePeriod, Settings } from './types';

const settings: Settings = {
  id: 1,
  default_nightly_cents: 25000, // 250 KM po danu
  cleaning_fee_cents: 0, // naknade za čišćenje više nema
  currency: 'BAM',
  currency_symbol: 'KM',
  min_nights: 1,
  max_nights: 30,
  max_guests: 8,
  checkin_time: '11:00',
  checkout_time: '09:00',
  hold_minutes: 15,
  bank_account_name: 'Test Vlasnik',
  bank_name: 'Test banka',
  bank_iban: 'BA391234567890123456',
  transfer_days: 3,
};

const summer: RatePeriod = {
  id: 'summer',
  name: 'Ljeto',
  start_date: '2027-06-15',
  end_date: '2027-09-16',
  nightly_price_cents: 18000,
  min_nights: null,
  priority: 10,
};

/** Preklapa se s ljetom, ali ima veći prioritet — mora pobijediti. */
const augustPeak: RatePeriod = {
  id: 'peak',
  name: 'Vrhunac sezone',
  start_date: '2027-08-01',
  end_date: '2027-08-16',
  nightly_price_cents: 22000,
  min_nights: null,
  priority: 30,
};

describe('daysBetween — dan odlaska se ne naplaćuje', () => {
  it('01.08 → 05.08 su 4 dana', () => {
    expect(daysBetween('2027-08-01', '2027-08-05')).toBe(4);
  });

  it('jedan dan', () => {
    expect(daysBetween('2027-08-01', '2027-08-02')).toBe(1);
  });

  it('radi preko prijelaza mjeseca', () => {
    expect(daysBetween('2027-01-30', '2027-02-02')).toBe(3);
  });

  it('radi preko prijestupnog dana', () => {
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
  });
});

describe('eachDay', () => {
  it('vraća datume [start, end) — bez dana odlaska', () => {
    expect(eachDay('2027-08-01', '2027-08-04')).toEqual([
      '2027-08-01',
      '2027-08-02',
      '2027-08-03',
    ]);
  });

  it('prazan raspon nema dana', () => {
    expect(eachDay('2027-08-01', '2027-08-01')).toEqual([]);
  });
});

describe('rezervacija bez noćenja', () => {
  it('jedan dan se naplaćuje kao jedan dan', () => {
    // Odabir jednog dana u sučelju daje [10.08, 11.08).
    const q = quoteStay('2027-08-10', '2027-08-11', [], settings);
    expect(q.dayCount).toBe(1);
    expect(q.totalCents).toBe(25000);
  });

  it('jedan dan prolazi provjeru — nema minimalnog boravka', () => {
    const day = addDaysStr(todayStr(), 30);
    const r = validateStay(day, addDaysStr(day, 1), 2, [], settings);
    expect(r.ok).toBe(true);
  });

  it('jedan dan stvarno zauzima taj datum', () => {
    const map = takenDayMap([
      { booking_id: 'a', start_date: '2027-08-10', end_date: '2027-08-11', kind: 'booked' },
    ]);
    expect([...map.keys()]).toEqual(['2027-08-10']);
  });

  it('dva gosta ne mogu uzeti isti jedan dan', () => {
    const slots: AvailabilitySlot[] = [
      { booking_id: 'a', start_date: '2027-08-10', end_date: '2027-08-11', kind: 'booked' },
    ];
    expect(rangeHasConflict('2027-08-10', '2027-08-11', slots)).toBe(true);
  });

  it('sljedeći dan je i dalje slobodan', () => {
    const slots: AvailabilitySlot[] = [
      { booking_id: 'a', start_date: '2027-08-10', end_date: '2027-08-11', kind: 'booked' },
    ];
    expect(rangeHasConflict('2027-08-11', '2027-08-12', slots)).toBe(false);
  });
});

describe('quoteStay', () => {
  it('koristi osnovnu cijenu izvan svih sezona', () => {
    const q = quoteStay('2027-03-01', '2027-03-05', [summer], settings);
    expect(q.dayCount).toBe(4);
    expect(q.totalCents).toBe(100000);
    expect(q.days.every((d) => d.periodName === null)).toBe(true);
  });

  it('nema naknade za čišćenje u iznosu', () => {
    const q = quoteStay('2027-03-01', '2027-03-03', [], settings);
    // Točno 2 × 250 KM, ni fening više.
    expect(q.totalCents).toBe(50000);
  });

  it('koristi sezonsku cijenu unutar sezone', () => {
    const q = quoteStay('2027-07-01', '2027-07-04', [summer], settings);
    expect(q.totalCents).toBe(54000); // 3 × 180 KM
    expect(q.days[0]?.periodName).toBe('Ljeto');
  });

  it('kod preklapanja pobjeđuje veći prioritet', () => {
    const q = quoteStay('2027-08-05', '2027-08-08', [summer, augustPeak], settings);
    expect(q.totalCents).toBe(66000); // 3 × 220 KM, ne 3 × 180 KM
    expect(q.days[0]?.periodName).toBe('Vrhunac sezone');
  });

  it('miješani boravak naplaćuje svaki dan po svojoj cijeni', () => {
    // 13.06 i 14.06 su van sezone (250 KM), 15.06 i 16.06 u ljetu (180 KM)
    const q = quoteStay('2027-06-13', '2027-06-17', [summer], settings);
    expect(q.dayCount).toBe(4);
    expect(q.totalCents).toBe(25000 + 25000 + 18000 + 18000);
    expect(q.days.map((d) => d.periodName)).toEqual([null, null, 'Ljeto', 'Ljeto']);
  });

  it('posljednji dan sezone se ne naplaćuje po sezonskoj cijeni', () => {
    // Sezona traje do 16.09 (isključivo) → 15.09 je sezonski, 16.09 nije.
    const q = quoteStay('2027-09-15', '2027-09-17', [summer], settings);
    expect(q.days[0]?.periodName).toBe('Ljeto');
    expect(q.days[1]?.periodName).toBe(null);
  });

  it('računa prosjek po danu', () => {
    const q = quoteStay('2027-06-13', '2027-06-17', [summer], settings);
    expect(q.averageDailyCents).toBe(21500);
  });

  it('prazan raspon nema iznos', () => {
    const q = quoteStay('2027-03-01', '2027-03-01', [], settings);
    expect(q.totalCents).toBe(0);
  });
});

describe('validateStay', () => {
  const future = addDaysStr(todayStr(), 200);

  it('prihvata ispravan boravak', () => {
    const r = validateStay(future, addDaysStr(future, 4), 4, [], settings);
    expect(r.ok).toBe(true);
  });

  it('odbija odlazak prije dolaska', () => {
    const r = validateStay(future, addDaysStr(future, -1), 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'INVALID_RANGE' });
  });

  it('odbija prazan raspon', () => {
    const r = validateStay(future, future, 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'INVALID_RANGE' });
  });

  it('odbija datum u prošlosti', () => {
    const past = addDaysStr(todayStr(), -3);
    const r = validateStay(past, addDaysStr(past, 4), 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'PAST_DATE' });
  });

  it('odbija predugačak boravak', () => {
    const r = validateStay(future, addDaysStr(future, 45), 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'MAX_DAYS' });
  });

  it('odbija previše gostiju', () => {
    const r = validateStay(future, addDaysStr(future, 4), 12, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'TOO_MANY_GUESTS' });
  });

  it('odbija nula gostiju', () => {
    const r = validateStay(future, addDaysStr(future, 4), 0, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'INVALID_INPUT' });
  });
});

describe('preklapanje termina', () => {
  const slots: AvailabilitySlot[] = [
    { booking_id: 'a', start_date: '2027-08-10', end_date: '2027-08-15', kind: 'booked' },
  ];

  it('dolazak na dan tuđeg odlaska NIJE sudar', () => {
    // Gost A odlazi 15.08 u 09:00, gost B dolazi 15.08 u 11:00.
    expect(rangeHasConflict('2027-08-15', '2027-08-18', slots)).toBe(false);
    expect(rangesOverlap('2027-08-10', '2027-08-15', '2027-08-15', '2027-08-18')).toBe(false);
  });

  it('odlazak na dan tuđeg dolaska NIJE sudar', () => {
    expect(rangeHasConflict('2027-08-06', '2027-08-10', slots)).toBe(false);
  });

  it('preklapanje na početku jeste sudar', () => {
    expect(rangeHasConflict('2027-08-08', '2027-08-12', slots)).toBe(true);
  });

  it('preklapanje na kraju jeste sudar', () => {
    expect(rangeHasConflict('2027-08-14', '2027-08-20', slots)).toBe(true);
  });

  it('boravak koji obuhvata tuđi jeste sudar', () => {
    expect(rangeHasConflict('2027-08-01', '2027-08-30', slots)).toBe(true);
  });

  it('boravak unutar tuđeg jeste sudar', () => {
    expect(rangeHasConflict('2027-08-11', '2027-08-13', slots)).toBe(true);
  });

  it('potpuno odvojen termin nije sudar', () => {
    expect(rangeHasConflict('2027-09-01', '2027-09-05', slots)).toBe(false);
  });
});

describe('takenDayMap', () => {
  it('označava svaki dan termina, ali ne i dan odlaska', () => {
    const map = takenDayMap([
      { booking_id: 'a', start_date: '2027-08-10', end_date: '2027-08-13', kind: 'booked' },
    ]);
    expect([...map.keys()].sort()).toEqual(['2027-08-10', '2027-08-11', '2027-08-12']);
    expect(map.has('2027-08-13')).toBe(false);
  });

  it('razlikuje potvrđeno od rezervisanog-u-toku', () => {
    const map = takenDayMap([
      { booking_id: 'a', start_date: '2027-08-10', end_date: '2027-08-11', kind: 'booked' },
      { booking_id: 'b', start_date: '2027-08-12', end_date: '2027-08-13', kind: 'pending' },
    ]);
    expect(map.get('2027-08-10')).toBe('hard');
    expect(map.get('2027-08-12')).toBe('pending');
  });

  it('potvrđeno nadjačava rezervisano-u-toku na istom danu', () => {
    const map = takenDayMap([
      { booking_id: 'b', start_date: '2027-08-10', end_date: '2027-08-12', kind: 'pending' },
      { booking_id: 'a', start_date: '2027-08-10', end_date: '2027-08-12', kind: 'booked' },
    ]);
    expect(map.get('2027-08-10')).toBe('hard');
  });
});

describe('formatMoney', () => {
  it('izostavlja decimale kad su nule', () => {
    expect(formatMoney(25000, 'KM')).toBe('250 KM');
  });

  it('prikazuje obje decimale kad iznos nije okrugao', () => {
    expect(formatMoney(18050, 'KM')).toBe('180,50 KM');
  });

  it('podržava drugu valutu', () => {
    expect(formatMoney(35000, '€')).toBe('350 €');
  });
});
