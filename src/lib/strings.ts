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
    lead: 'Kliknite jedan datum za boravak bez noćenja, ili dva za duži boravak. Zauzeti termini su prikazani sivo i ne mogu se odabrati.',

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
    daysLabel: (n: number) => `${n} ${plural(n, 'dan', 'dana', 'dana')}`,
    perDay: 'po danu',
    total: 'Ukupno',
    seasonalNote: 'Cijena po danu zavisi od sezone.',
    singleDayNote: 'Rezervacija za jedan dan, bez noćenja.',

    payMethodTitle: 'Način plaćanja',

    payTransfer: 'Plaćanje na račun',
    payTransferHint:
      'Dobijate broj računa i poziv na broj. Termin držimo za vas dok uplata ne stigne.',

    payCash: 'Plaćanje u gotovini',
    payCashHint:
      'Šaljete zahtjev domaćinu. Termin držimo za vas dok ga domaćin ne potvrdi — obično isti dan.',

    payTest: 'TEST rezervacija',
    payTestHint:
      'Samo za isprobavanje — potvrđuje rezervaciju bez ikakvog plaćanja. Ne prikazuje se gostima.',

    reserve: 'Rezerviši',

    submitting: 'Trenutak…',

    selectDatesFirst: 'Prvo odaberite datum u kalendaru.',
    singleDayHint:
      'Kliknite jedan datum za boravak bez noćenja, ili još jedan za duži boravak.',
    unavailableRange:
      'U odabranom rasponu ima već rezervisanih dana. Odaberite termin bez zauzetih datuma.',
  },

  confirmation: {
    // "Uspješna" se kaže SAMO kad je rezervacija stvarno prihvaćena.
    // Dok se čeka, termin jeste zauzet, ali gost ne smije misliti da je gotovo.
    confirmedTitle: 'Rezervacija je uspješna',
    confirmedLead:
      'Domaćin je potvrdio vašu rezervaciju. Termin je vaš i drugim gostima je prikazan kao zauzet.',

    pendingTitle: 'Termin je rezervisan za vas',
    pendingLead:
      'Termin držimo za vas i drugim gostima je već prikazan kao zauzet. Rezervacija je konačna tek kad je domaćin prihvati — javljamo vam se emailom u najkraćem roku.',

    transferTitle: 'Termin je rezervisan za vas',
    transferLead:
      'Preostaje još uplata. Termin držimo za vas do isteka roka ispod. Rezervacija je konačna tek kad uplata bude provjerena.',

    transferHeading: 'Podaci za uplatu',
    transferRecipient: 'Primalac',
    transferBank: 'Banka',
    transferIban: 'Broj računa (IBAN)',
    transferReference: 'Poziv na broj',
    transferAmount: 'Iznos za uplatu',
    transferDeadline: 'Uplatiti do',
    transferNote:
      'Obavezno upišite poziv na broj — po njemu domaćin prepoznaje vašu uplatu. Ako uplata ne stigne do navedenog roka, termin se oslobađa.',
    copy: 'Kopiraj',
    copied: 'Kopirano',

    pendingBadge: 'Rezervisano — čeka potvrdu',
    awaitingTransfer: 'Rezervisano — čeka uplatu',
    confirmedBadge: 'Potvrđeno',
    heldNote: 'Termin je već zauzet za vas — niko drugi ga ne može uzeti u međuvremenu.',
    reference: 'Broj rezervacije',
    stay: 'Vaš boravak',
    guestsLabel: 'Gostiju',
    totalLabel: 'Ukupan iznos',
    payOnArrival: 'Iznos se plaća u gotovini po dolasku.',
    paid: 'Uplata je zaprimljena.',
    testBooking: 'Ovo je TEST rezervacija — nikakav novac nije naplaćen.',
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
    MAX_DAYS: (n: number) =>
      `Maksimalan boravak je ${n} ${plural(n, 'dan', 'dana', 'dana')}.`,
    TOO_MANY_GUESTS: (n: number) =>
      `Maksimalan broj gostiju je ${n} ${plural(n, 'gost', 'gosta', 'gostiju')}.`,
    INVALID_INPUT: 'Provjerite unesene podatke i pokušajte ponovo.',
    REQUIRED_NAME: 'Unesite ime i prezime.',
    REQUIRED_EMAIL: 'Unesite ispravnu email adresu.',
    REQUIRED_PHONE: 'Unesite broj telefona.',
    REQUIRED_METHOD: 'Odaberite način plaćanja.',
    METHOD_UNAVAILABLE: 'Odabrani način plaćanja trenutno nije dostupan.',
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
    defaultNightly: 'Osnovna cijena po danu',
    maxNights: 'Maksimalan broj dana',
    maxGuests: 'Maksimalan broj gostiju',
    holdMinutes: 'Trajanje rezervacije termina tokom plaćanja (min)',
    save: 'Sačuvaj',
    saved: 'Sačuvano.',

    seasonsHeading: 'Sezonske cijene',
    seasonsLead:
      'Ako se dvije sezone preklapaju, vrijedi ona s većim prioritetom. Dan odlaska se ne naplaćuje.',
    seasonName: 'Naziv sezone',
    seasonFrom: 'Od',
    seasonTo: 'Do',
    seasonPrice: 'Cijena po danu',
    seasonPriority: 'Prioritet',
    seasonAdd: 'Dodaj sezonu',
    seasonDelete: 'Obriši',
    seasonDeleteConfirm: 'Obrisati ovu sezonu?',
    seasonsEmpty: 'Nema definisanih sezona — svugdje vrijedi osnovna cijena.',

    statusLabels: {
      pending_payment: 'Čeka uplatu',
      pending_cash: 'Čeka odobrenje',
      pending_transfer: 'Čeka uplatu na račun',
      confirmed: 'Potvrđeno',
      expired: 'Isteklo',
      cancelled: 'Otkazano',
      blocked: 'Blokirano',
    } as Record<string, string>,

    methodLabels: {
      card: 'Kartica',
      cash: 'Gotovina',
      bank_transfer: 'Uplata na račun',
      test: 'TEST',
      none: '—',
    } as Record<string, string>,

    markPaid: 'Uplata stigla',
    markPaidConfirm: 'Potvrditi da je uplata legla na račun?',
    transfersHeading: 'Uplate na račun koje se čekaju',
    transfersEmpty: 'Nema rezervacija koje čekaju uplatu.',
    transferRef: 'Poziv na broj',
    deadlineAt: 'Rok',

    bankHeading: 'Podaci za uplatu na račun',
    bankLead:
      'Ovo gost vidi kad odabere plaćanje na račun. Dok je IBAN prazan, ta opcija se uopšte ne nudi.',
    bankAccountName: 'Naziv primaoca',
    bankName: 'Naziv banke',
    bankIban: 'IBAN / broj računa',
    transferDays: 'Rok za uplatu (dana)',
  },

  common: {
    from: 'od',
    day: 'dan',
    loading: 'Učitavanje…',
    tryAgain: 'Pokušaj ponovo',
    guestsCount: (n: number) => `${n} ${plural(n, 'gost', 'gosta', 'gostiju')}`,
    daysCount: (n: number) => `${n} ${plural(n, 'dan', 'dana', 'dana')}`,
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
