/**
 * Sav tekst sajta na jednom mjestu.
 *
 * Zašto ovako: kad jednog dana zatreba engleska verzija, dodaje se drugi
 * objekat istog oblika — a ne traži se tekst po trideset komponenti.
 */

export const t = {
  site: {
    name: 'TreeScape',
    tagline: 'Vila u zagrljaju šume',
    description:
      'TreeScape je vila okružena šumom — mir, priroda i sva udobnost doma. Provjerite slobodne termine i rezervišite online.',
  },

  nav: {
    about: 'O kući',
    gallery: 'Galerija',
    amenities: 'Sadržaji',
    location: 'Lokacija',
    faq: 'Pitanja',
    book: 'Rezerviši',
    menu: 'Meni',
    close: 'Zatvori',
  },

  hero: {
    eyebrow: 'Privatna vila za odmor',
    title: 'TreeScape',
    subtitle: 'Probudite se uz zvuk šume, a ne uz zvuk grada.',
    cta: 'Provjeri dostupnost',
    scroll: 'Saznaj više',
  },

  about: {
    heading: 'Dobrodošli u TreeScape',
    lead: 'Kuća skrivena među stablima, dovoljno blizu da se lako dođe, a dovoljno daleko da se konačno odmorite.',
    body: [
      'TreeScape je porodična vila okružena visokom šumom, sa velikom terasom okrenutom prema dolini. Unutra je sve što treba za duži boravak — potpuno opremljena kuhinja, topla dnevna soba s kaminom i sobe u kojima se stvarno naspavate.',
      'Idealno za porodični odmor, bijeg s prijateljima na vikend ili mirnu sedmicu rada iz prirode. Ljeti roštilj i duge večeri na terasi, zimi snijeg i vatra u kaminu.',
    ],
    stats: {
      guests: 'gostiju',
      bedrooms: 'spavaće sobe',
      bathrooms: 'kupatila',
      area: 'm² prostora',
    },
  },

  gallery: {
    heading: 'Galerija',
    lead: 'Pogledajte kako izgleda vaš sljedeći odmor.',
    open: 'Otvori sliku',
    prev: 'Prethodna slika',
    next: 'Sljedeća slika',
    close: 'Zatvori galeriju',
    counter: (i: number, total: number) => `${i} / ${total}`,
  },

  amenities: {
    heading: 'Šta vas čeka',
    lead: 'Sve je već tu — vi ponesite samo torbu.',
  },

  location: {
    heading: 'Gdje se nalazimo',
    lead: 'Dovoljno blizu da se lako stigne, dovoljno daleko da se čuje samo šuma.',
    directions: 'Tačnu adresu i uputstva za dolazak šaljemo nakon potvrde rezervacije.',
  },

  faq: {
    heading: 'Česta pitanja',
    lead: 'Ako nešto nije jasno, slobodno nas kontaktirajte.',
  },

  booking: {
    heading: 'Rezervišite svoj termin',
    lead: 'Odaberite datume u kalendaru. Zauzeti termini su prikazani sivo i ne mogu se odabrati.',

    pickDates: 'Odaberite datume',
    checkIn: 'Dolazak',
    checkOut: 'Odlazak',
    notSelected: 'Nije odabrano',
    clearDates: 'Poništi odabir',

    legendFree: 'Slobodno',
    legendTaken: 'Zauzeto',
    legendSelected: 'Vaš odabir',

    guests: 'Broj gostiju',
    name: 'Ime i prezime',
    namePlaceholder: 'Vaše ime i prezime',
    email: 'Email adresa',
    emailPlaceholder: 'vas@email.com',
    phone: 'Broj telefona',
    phonePlaceholder: '+387 6x xxx xxx',
    note: 'Napomena za domaćina',
    notePlaceholder: 'Dolazite s kućnim ljubimcem? Kasni dolazak? Recite nam ovdje.',
    optional: 'opcionalno',

    summaryTitle: 'Pregled rezervacije',
    nightsLabel: (n: number) => `${n} ${plural(n, 'noć', 'noći', 'noći')}`,
    perNight: 'po noćenju',
    cleaningFee: 'Čišćenje',
    total: 'Ukupno',
    averagePerNight: 'prosječno po noćenju',
    seasonalNote: 'Cijena po noćenju zavisi od sezone.',

    payCard: 'Plati karticom',
    payCash: 'Plaćanje u gotovini',
    payCardHint: 'Sigurno plaćanje preko Stripe-a. Termin je odmah potvrđen.',
    payCashHint:
      'Šaljete zahtjev domaćinu. Termin držimo za vas dok ga domaćin ne potvrdi — obično isti dan.',

    submitting: 'Trenutak…',
    redirecting: 'Vodimo vas na sigurno plaćanje…',

    minNightsNotice: (n: number) =>
      `Za odabrane datume minimalan boravak je ${n} ${plural(n, 'noćenje', 'noćenja', 'noćenja')}.`,
    selectDatesFirst: 'Prvo odaberite datume dolaska i odlaska.',
    unavailableRange:
      'U odabranom rasponu ima već rezervisanih dana. Odaberite termin bez zauzetih datuma.',
  },

  confirmation: {
    cardTitle: 'Rezervacija je potvrđena',
    cardLead: 'Hvala vam! Vaš termin je zaključan i vidljiv je kao zauzet svim ostalim gostima.',
    cashTitle: 'Zahtjev je zaprimljen',
    cashLead:
      'Termin držimo za vas dok ga domaćin ne potvrdi. Javićemo vam se emailom u najkraćem roku.',
    pendingBadge: 'Čeka potvrdu domaćina',
    confirmedBadge: 'Potvrđeno',
    reference: 'Broj rezervacije',
    stay: 'Vaš boravak',
    guestsLabel: 'Gostiju',
    totalLabel: 'Ukupan iznos',
    payOnArrival: 'Iznos se plaća u gotovini po dolasku.',
    paid: 'Plaćeno karticom.',
    whatNext: 'Šta dalje?',
    whatNextBody:
      'Poslali smo vam email s detaljima. Tačnu adresu, uputstva za dolazak i kontakt domaćina dobijate prije dolaska.',
    backHome: 'Nazad na početnu',
    notFound: 'Rezervacija nije pronađena',
    notFoundBody: 'Link je možda pogrešan ili je istekao. Provjerite email koji smo vam poslali.',
  },

  errors: {
    DATES_TAKEN: 'Ovi datumi su upravo rezervisani. Molimo odaberite druge.',
    INVALID_RANGE: 'Datum odlaska mora biti nakon datuma dolaska.',
    PAST_DATE: 'Ne možete rezervisati datum u prošlosti.',
    MIN_NIGHTS: (n: number) =>
      `Minimalan boravak za odabrane datume je ${n} ${plural(n, 'noćenje', 'noćenja', 'noćenja')}.`,
    MAX_NIGHTS: (n: number) =>
      `Maksimalan boravak je ${n} ${plural(n, 'noćenje', 'noćenja', 'noćenja')}.`,
    TOO_MANY_GUESTS: (n: number) =>
      `Maksimalan broj gostiju je ${n} ${plural(n, 'gost', 'gosta', 'gostiju')}.`,
    INVALID_INPUT: 'Provjerite unesene podatke i pokušajte ponovo.',
    REQUIRED_NAME: 'Unesite ime i prezime.',
    REQUIRED_EMAIL: 'Unesite ispravnu email adresu.',
    REQUIRED_PHONE: 'Unesite broj telefona.',
    PAYMENTS_DISABLED: 'Plaćanje karticom trenutno nije dostupno. Pokušajte plaćanje u gotovini.',
    SERVER_ERROR: 'Došlo je do greške. Pokušajte ponovo za koji trenutak.',
    NOT_FOUND: 'Traženi sadržaj nije pronađen.',
  },

  admin: {
    gateTitle: 'TreeScape administracija',
    gateLead: 'Unesite pristupni kod.',
    gateCode: 'Pristupni kod',
    gateSubmit: 'Otključaj',
    gateWrong: 'Pogrešan kod.',
    gateLocked: 'Previše pokušaja. Sačekajte minutu pa probajte ponovo.',

    logout: 'Odjava',
    title: 'Administracija',

    tabRequests: 'Zahtjevi',
    tabBookings: 'Rezervacije',
    tabCalendar: 'Kalendar',
    tabPricing: 'Cijene',

    requestsHeading: 'Zahtjevi za plaćanje u gotovini',
    requestsEmpty: 'Trenutno nema zahtjeva koji čekaju odobrenje.',
    approve: 'Odobri',
    reject: 'Odbij',
    approveConfirm: 'Potvrditi ovu rezervaciju?',
    rejectConfirm: 'Odbiti ovaj zahtjev? Termin će se osloboditi.',

    bookingsHeading: 'Sve rezervacije',
    bookingsEmpty: 'Još nema nijedne rezervacije.',
    filterAll: 'Sve',

    calendarHeading: 'Blokiranje termina',
    calendarLead:
      'Odaberite raspon datuma koje želite zatvoriti za goste (održavanje, lični boravak…).',
    blockReason: 'Razlog (interno)',
    blockSubmit: 'Blokiraj termin',
    blockedHeading: 'Blokirani termini',
    unblock: 'Oslobodi',
    unblockConfirm: 'Osloboditi ovaj termin?',

    pricingHeading: 'Osnovne cijene',
    pricingLead: 'Vrijede za svaki datum koji ne pripada nijednoj sezoni.',
    defaultNightly: 'Osnovna cijena po noćenju',
    cleaningFee: 'Naknada za čišćenje',
    minNights: 'Minimalan broj noćenja',
    maxNights: 'Maksimalan broj noćenja',
    maxGuests: 'Maksimalan broj gostiju',
    holdMinutes: 'Trajanje rezervacije termina tokom plaćanja (min)',
    save: 'Sačuvaj',
    saved: 'Sačuvano.',

    seasonsHeading: 'Sezonske cijene',
    seasonsLead:
      'Ako se dvije sezone preklapaju, vrijedi ona s većim prioritetom. Datum odlaska se ne naplaćuje.',
    seasonName: 'Naziv sezone',
    seasonFrom: 'Od',
    seasonTo: 'Do',
    seasonPrice: 'Cijena po noćenju',
    seasonMinNights: 'Min. noćenja',
    seasonPriority: 'Prioritet',
    seasonAdd: 'Dodaj sezonu',
    seasonDelete: 'Obriši',
    seasonDeleteConfirm: 'Obrisati ovu sezonu?',
    seasonsEmpty: 'Nema definisanih sezona — svugdje vrijedi osnovna cijena.',

    statusLabels: {
      pending_payment: 'Čeka uplatu',
      pending_cash: 'Čeka odobrenje',
      confirmed: 'Potvrđeno',
      expired: 'Isteklo',
      cancelled: 'Otkazano',
      blocked: 'Blokirano',
    } as Record<string, string>,

    methodLabels: {
      card: 'Kartica',
      cash: 'Gotovina',
      none: '—',
    } as Record<string, string>,
  },

  common: {
    from: 'od',
    night: 'noćenje',
    loading: 'Učitavanje…',
    tryAgain: 'Pokušaj ponovo',
    guestsCount: (n: number) => `${n} ${plural(n, 'gost', 'gosta', 'gostiju')}`,
    nightsCount: (n: number) => `${n} ${plural(n, 'noćenje', 'noćenja', 'noćenja')}`,
  },

  footer: {
    contact: 'Kontakt',
    quickLinks: 'Brzi linkovi',
    rights: 'Sva prava zadržana.',
    builtWith: 'Rezervacije osigurava Stripe.',
  },
} as const;

/**
 * Bosanska množina: 1 kruška, 2–4 kruške, 5+ krušaka.
 * Izuzeci su brojevi 11–14, koji uvijek idu u treći oblik.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
