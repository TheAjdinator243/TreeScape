import { describe, expect, it } from 'vitest';

import { addDaysStr, eachNight, nightsBetween, rangesOverlap, todayStr } from './dates';
import {
  formatMoney,
  quoteStay,
  rangeHasConflict,
  takenDayMap,
  validateStay,
} from './pricing';
import type { AvailabilitySlot, RatePeriod, Settings } from './types';

const settings: Settings = {
  id: 1,
  default_nightly_cents: 10000, // 100 €
  cleaning_fee_cents: 3000, // 30 €
  currency: 'EUR',
  currency_symbol: '€',
  min_nights: 2,
  max_nights: 30,
  max_guests: 8,
  checkin_time: '15:00',
  checkout_time: '11:00',
  hold_minutes: 15,
};

const summer: RatePeriod = {
  id: 'summer',
  name: 'Ljeto',
  start_date: '2027-06-15',
  end_date: '2027-09-16',
  nightly_price_cents: 18000, // 180 €
  min_nights: 3,
  priority: 10,
};

const newYear: RatePeriod = {
  id: 'nye',
  name: 'Nova godina',
  start_date: '2027-12-29',
  end_date: '2028-01-03',
  nightly_price_cents: 26000,
  min_nights: 4,
  priority: 20,
};

/** Preklapa se s ljetom, ali ima veći prioritet — mora pobijediti. */
const augustPeak: RatePeriod = {
  id: 'peak',
  name: 'Vrhunac sezone',
  start_date: '2027-08-01',
  end_date: '2027-08-16',
  nightly_price_cents: 22000,
  min_nights: 5,
  priority: 30,
};

describe('nightsBetween — dan odlaska se ne naplaćuje', () => {
  it('01.08 → 05.08 je 4 noćenja, ne 5', () => {
    expect(nightsBetween('2027-08-01', '2027-08-05')).toBe(4);
  });

  it('jedna noć', () => {
    expect(nightsBetween('2027-08-01', '2027-08-02')).toBe(1);
  });

  it('radi i preko prijelaza mjeseca', () => {
    expect(nightsBetween('2027-01-30', '2027-02-02')).toBe(3);
  });

  it('radi i preko prijestupnog dana', () => {
    expect(nightsBetween('2028-02-28', '2028-03-01')).toBe(2);
  });
});

describe('eachNight', () => {
  it('vraća datume [start, end) — bez dana odlaska', () => {
    expect(eachNight('2027-08-01', '2027-08-04')).toEqual([
      '2027-08-01',
      '2027-08-02',
      '2027-08-03',
    ]);
  });

  it('prazan raspon nema noćenja', () => {
    expect(eachNight('2027-08-01', '2027-08-01')).toEqual([]);
  });
});

describe('quoteStay', () => {
  it('koristi osnovnu cijenu izvan svih sezona', () => {
    const q = quoteStay('2027-03-01', '2027-03-05', [summer], settings);
    expect(q.nightCount).toBe(4);
    expect(q.subtotalCents).toBe(40000);
    expect(q.cleaningFeeCents).toBe(3000);
    expect(q.totalCents).toBe(43000);
    expect(q.nights.every((n) => n.periodName === null)).toBe(true);
  });

  it('koristi sezonsku cijenu unutar sezone', () => {
    const q = quoteStay('2027-07-01', '2027-07-04', [summer], settings);
    expect(q.subtotalCents).toBe(54000); // 3 × 180 €
    expect(q.totalCents).toBe(57000);
    expect(q.nights[0]?.periodName).toBe('Ljeto');
  });

  it('kod preklapanja pobjeđuje veći prioritet', () => {
    const q = quoteStay('2027-08-05', '2027-08-08', [summer, augustPeak], settings);
    expect(q.subtotalCents).toBe(66000); // 3 × 220 €, ne 3 × 180 €
    expect(q.nights[0]?.periodName).toBe('Vrhunac sezone');
  });

  it('miješani boravak naplaćuje svaku noć po svojoj cijeni', () => {
    // 13.06 i 14.06 su van sezone (100 €), 15.06 i 16.06 u ljetu (180 €)
    const q = quoteStay('2027-06-13', '2027-06-17', [summer], settings);
    expect(q.nightCount).toBe(4);
    expect(q.subtotalCents).toBe(10000 + 10000 + 18000 + 18000);
    expect(q.nights.map((n) => n.periodName)).toEqual([null, null, 'Ljeto', 'Ljeto']);
  });

  it('posljednji dan sezone se ne naplaćuje po sezonskoj cijeni', () => {
    // Sezona traje do 16.09 (isključivo) → noć 15.09 je sezonska, 16.09 nije.
    const q = quoteStay('2027-09-15', '2027-09-17', [summer], settings);
    expect(q.nights[0]?.periodName).toBe('Ljeto');
    expect(q.nights[1]?.periodName).toBe(null);
  });

  it('uzima najstroži minimum među dodirnutim sezonama', () => {
    const q = quoteStay('2027-06-13', '2027-06-17', [summer], settings);
    expect(q.effectiveMinNights).toBe(3); // ljeto traži 3, osnovno 2
  });

  it('bez sezone vrijedi minimum iz postavki', () => {
    const q = quoteStay('2027-03-01', '2027-03-05', [summer], settings);
    expect(q.effectiveMinNights).toBe(2);
  });

  it('računa prosjek po noćenju', () => {
    const q = quoteStay('2027-06-13', '2027-06-17', [summer], settings);
    expect(q.averageNightlyCents).toBe(14000);
  });

  it('bez noćenja nema ni naknade za čišćenje', () => {
    const q = quoteStay('2027-03-01', '2027-03-01', [], settings);
    expect(q.totalCents).toBe(0);
  });

  it('Nova godina nadjačava zimu i traži 4 noćenja', () => {
    const q = quoteStay('2027-12-30', '2028-01-02', [newYear], settings);
    expect(q.subtotalCents).toBe(78000); // 3 × 260 €
    expect(q.effectiveMinNights).toBe(4);
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

  it('odbija isti dan dolaska i odlaska', () => {
    const r = validateStay(future, future, 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'INVALID_RANGE' });
  });

  it('odbija datum u prošlosti', () => {
    const past = addDaysStr(todayStr(), -3);
    const r = validateStay(past, addDaysStr(past, 4), 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'PAST_DATE' });
  });

  it('odbija boravak kraći od minimuma', () => {
    const r = validateStay(future, addDaysStr(future, 1), 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'MIN_NIGHTS' });
  });

  it('primjenjuje strožiji sezonski minimum', () => {
    // 3 noćenja u ljetu su ok za osnovni minimum (2), ali ljeto traži 3.
    const ok = validateStay('2027-07-01', '2027-07-04', 2, [summer], settings);
    expect(ok.ok).toBe(true);

    const tooShort = validateStay('2027-07-01', '2027-07-03', 2, [summer], settings);
    expect(tooShort).toMatchObject({ ok: false, code: 'MIN_NIGHTS' });
  });

  it('odbija predugačak boravak', () => {
    const r = validateStay(future, addDaysStr(future, 45), 2, [], settings);
    expect(r).toMatchObject({ ok: false, code: 'MAX_NIGHTS' });
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
    // Gost A odlazi 15.08, gost B dolazi 15.08 — potpuno legitimno.
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
  it('označava svaku noć termina, ali ne i dan odlaska', () => {
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
    expect(formatMoney(18000, '€')).toBe('180 €');
  });

  it('prikazuje obje decimale kad iznos nije okrugao', () => {
    expect(formatMoney(18050, '€')).toBe('180,50 €');
    expect(formatMoney(18099, '€')).toBe('180,99 €');
  });

  it('podržava drugu valutu', () => {
    expect(formatMoney(35000, 'KM')).toBe('350 KM');
  });
});
