import type { BookingStatus, PaymentMethod, Settings } from '../types';

/**
 * Načini plaćanja na jednom mjestu.
 *
 * Cijela aplikacija zna samo za ovaj spisak — kalendar, API i administracija
 * ne poznaju nijednog konkretnog procesora. Kad jednog dana stigne ugovor s
 * bankom (Monri, WSPay, PaySpot), dodaje se jedan unos ovdje i jedna datoteka
 * pored ove. Ništa drugo se ne dira.
 */

export interface PaymentMethodInfo {
  id: PaymentMethod;
  /** Status koji rezervacija dobija odmah po slanju. */
  initialStatus: BookingStatus;
  /**
   * Koliko sati se termin drži prije nego se sam oslobodi.
   * `null` znači da se drži dok vlasnik ne odluči (nikad ne istekne sam).
   */
  holdHours: number | null;
  /** Da li je gostu potrebno nešto uraditi nakon rezervacije. */
  requiresGuestAction: boolean;
}

/**
 * Gotovina — gost plaća po dolasku, vlasnik prvo mora potvrditi.
 * Termin se drži dok vlasnik ne odluči; zato holdHours = null.
 */
const CASH: PaymentMethodInfo = {
  id: 'cash',
  initialStatus: 'pending_cash',
  holdHours: null,
  requiresGuestAction: false,
};

/**
 * Bankovni transfer — novac ide DIREKTNO na račun vlasnika.
 *
 * Nema posrednika, nema provizije i ne treba nikakav ugovor s procesorom.
 * Cijena je što nije trenutno: termin se drži nekoliko dana dok uplata ne
 * legne, a vlasnik je ručno potvrdi u administraciji kad je vidi na izvodu.
 */
function bankTransfer(settings: Settings): PaymentMethodInfo {
  return {
    id: 'bank_transfer',
    initialStatus: 'pending_transfer',
    holdHours: settings.transfer_days * 24,
    requiresGuestAction: true,
  };
}

/**
 * Test — simulira uspješnu uplatu i odmah potvrđuje rezervaciju.
 *
 * Postoji samo da se može proći kroz cijeli tok (rezervacija → potvrda →
 * termin osivi kod svih uživo) bez ijednog naloga i bez pravog novca.
 * Nikada se ne nudi osim ako je izričito uključen prekidačem u okruženju.
 */
const TEST: PaymentMethodInfo = {
  id: 'test',
  initialStatus: 'confirmed',
  holdHours: null,
  requiresGuestAction: false,
};

/** Da li su bankovni podaci popunjeni toliko da se transfer može ponuditi. */
export function isBankTransferReady(settings: Settings): boolean {
  return settings.bank_iban.trim().length > 0 && settings.bank_account_name.trim().length > 0;
}

/** Načini koje gost stvarno vidi na sajtu, u ovom redoslijedu. */
export function availableMethods(settings: Settings, testEnabled: boolean): PaymentMethodInfo[] {
  const methods: PaymentMethodInfo[] = [];

  if (isBankTransferReady(settings)) methods.push(bankTransfer(settings));
  methods.push(CASH);
  if (testEnabled) methods.push(TEST);

  return methods;
}

export function methodInfo(
  id: PaymentMethod,
  settings: Settings,
  testEnabled: boolean
): PaymentMethodInfo | null {
  return availableMethods(settings, testEnabled).find((m) => m.id === id) ?? null;
}

/**
 * Poziv na broj — po njemu vlasnik na bankovnom izvodu prepozna ko je uplatio.
 *
 * Izvedeno iz javnog tokena rezervacije, pa je jedinstveno i ne otkriva ništa.
 * Samo cifre, jer banke u pozivu na broj često ne primaju slova.
 */
export function paymentReference(publicToken: string): string {
  const digits = publicToken.replace(/\D/g, '');
  const padded = (digits + '0000000000').slice(0, 10);
  return `${padded.slice(0, 4)}-${padded.slice(4, 10)}`;
}

/** Ono što gost vidi na stranici s potvrdom i dobija u mailu. */
export interface TransferInstructions {
  accountName: string;
  bankName: string;
  iban: string;
  reference: string;
  amountCents: number;
  currencySymbol: string;
  deadline: string | null;
}

export function transferInstructions(
  booking: { public_token: string; total_cents: number; hold_expires_at: string | null },
  settings: Settings
): TransferInstructions {
  return {
    accountName: settings.bank_account_name,
    bankName: settings.bank_name,
    iban: settings.bank_iban,
    reference: paymentReference(booking.public_token),
    amountCents: booking.total_cents,
    currencySymbol: settings.currency_symbol,
    deadline: booking.hold_expires_at,
  };
}
