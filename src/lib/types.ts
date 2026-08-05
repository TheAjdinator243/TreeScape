/** Oblici podataka koji putuju između baze, servera i preglednika. */

import type { DateStr } from './dates';

export type BookingStatus =
  | 'pending_payment'
  | 'pending_cash'
  | 'confirmed'
  | 'expired'
  | 'cancelled'
  | 'blocked';

export type PaymentMethod = 'card' | 'cash' | 'none';

export type SlotKind = 'booked' | 'pending' | 'blocked';

/** Jedino što preglednik smije vidjeti o tuđim rezervacijama: datumi. */
export interface AvailabilitySlot {
  booking_id: string;
  start_date: DateStr;
  end_date: DateStr;
  kind: SlotKind;
}

export interface RatePeriod {
  id: string;
  name: string;
  start_date: DateStr;
  end_date: DateStr;
  nightly_price_cents: number;
  min_nights: number | null;
  priority: number;
}

export interface Settings {
  id: number;
  default_nightly_cents: number;
  cleaning_fee_cents: number;
  currency: string;
  currency_symbol: string;
  min_nights: number;
  max_nights: number;
  max_guests: number;
  checkin_time: string;
  checkout_time: string;
  hold_minutes: number;
}

export interface Booking {
  id: string;
  public_token: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guests: number | null;
  note: string | null;
  start_date: DateStr;
  end_date: DateStr;
  status: BookingStatus;
  payment_method: PaymentMethod;
  total_cents: number;
  currency: string;
  price_breakdown: PriceBreakdown | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  hold_expires_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface NightPrice {
  date: DateStr;
  cents: number;
  /** Naziv sezone koja je odredila cijenu, ili null za osnovnu cijenu. */
  periodName: string | null;
}

export interface PriceBreakdown {
  nights: NightPrice[];
  nightCount: number;
  subtotalCents: number;
  cleaningFeeCents: number;
  totalCents: number;
  averageNightlyCents: number;
  currency: string;
  currencySymbol: string;
  /** Najstroži minimum među sezonama koje dodiruje ovaj boravak. */
  effectiveMinNights: number;
}

/** Podaci koje početna stranica dobije sa servera pri prvom učitavanju. */
export interface BookingContext {
  slots: AvailabilitySlot[];
  periods: RatePeriod[];
  settings: Settings;
}

export type ApiError = {
  error: string;
  code?: string;
};
