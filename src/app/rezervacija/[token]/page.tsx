import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LiveStatus } from '@/components/booking/LiveStatus';
import { Footer } from '@/components/site/Footer';
import { getBookingByToken } from '@/lib/booking-service';
import { getSettings } from '@/lib/data';
import { formatLong, formatRange } from '@/lib/dates';
import { isDatabaseConfigured } from '@/lib/env';
import { getServerStrings } from '@/lib/i18n/server';
import { formatMoney } from '@/lib/pricing';
import { bookingReference } from '@/lib/reference';

export const dynamic = 'force-dynamic';

// Potvrde su privatne — nemaju šta tražiti u pretraživačima.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerStrings();

  return {
    title: t.confirmation.pageTitle,
    robots: { index: false, follow: false },
  };
}

export default async function ConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { locale, t } = await getServerStrings();

  if (!isDatabaseConfigured) notFound();

  const booking = await getBookingByToken(token);
  if (!booking || booking.status === 'blocked') notFound();

  // Vremena prijave i odjave se čitaju iz postavki pri svakom otvaranju, a ne
  // pamte uz rezervaciju: kad ih vlasnik promijeni u administraciji, promijene
  // se svuda — i ovdje, i u mailu, i u čestim pitanjima.
  const settings = await getSettings();

  const isCash = booking.payment_method === 'cash';
  const isTest = booking.payment_method === 'test';

  const isConfirmed = booking.status === 'confirmed';
  // `pending_transfer` postoji u bazi zbog starih rezervacija; sajt ga više
  // ne pravi, pa se ovdje tretira kao svaka druga rezervacija koja čeka.
  const isPending =
    booking.status === 'pending_cash' ||
    booking.status === 'pending_payment' ||
    booking.status === 'pending_transfer';
  const isDead = booking.status === 'cancelled' || booking.status === 'expired';

  const symbol = booking.price_breakdown?.currencySymbol ?? '€';

  return (
    <>
      {/* Dok se čeka odluka, stranica se sama osvježi čim domaćin odluči.
          Nakon odluke nema šta više da se mijenja, pa se ni ne sluša. */}
      {isPending && <LiveStatus bookingId={booking.id} />}

      <main className="flex min-h-dvh flex-col items-center justify-center bg-sand-100 px-5 py-16">
        <div className="card w-full max-w-lg p-8 sm:p-10">
          <Link
            href="/"
            className="font-display text-lg font-semibold text-forest-800 hover:text-forest-600"
          >
            {t.site.name}
          </Link>

          <div className="mt-8">
            {isDead ? (
              <StatusMark tone="danger" />
            ) : isConfirmed ? (
              <StatusMark tone="success" />
            ) : (
              <StatusMark tone="pending" />
            )}
            {isTest && (
              <span className="ms-3 inline-flex items-center rounded-full bg-warn-600/12 px-3 py-1 align-middle text-xs font-semibold uppercase tracking-wider text-warn-600">
                test
              </span>
            )}
          </div>

          <h1 className="mt-6 font-display text-3xl leading-tight text-forest-900">
            {isDead
              ? t.confirmation.inactiveTitle
              : isConfirmed
                ? t.confirmation.confirmedTitle
                : t.confirmation.pendingTitle}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-ink-500">
            {isDead
              ? t.confirmation.inactiveLead
              : isConfirmed
                ? t.confirmation.confirmedLead
                : t.confirmation.pendingLead}
          </p>

          {isPending && (
            <>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-warn-600/10 px-4 py-1.5 text-sm font-medium text-warn-600">
                <span className="h-2 w-2 rounded-full bg-warn-600" aria-hidden="true" />
                {t.confirmation.pendingBadge}
              </p>
              <p className="mt-3 text-sm text-ink-500">{t.confirmation.heldNote}</p>
            </>
          )}

          <dl className="mt-8 space-y-4 border-t border-sand-200 pt-8 text-sm">
            <Row label={t.confirmation.reference}>
              {/* Broj rezervacije je latinični niz — čita se slijeva nadesno
                  i na arapskoj stranici. */}
              <span dir="ltr" className="font-mono text-base tracking-wider text-forest-800">
                {bookingReference(booking.public_token)}
              </span>
            </Row>

            <Row label={t.confirmation.stay}>
              {formatRange(booking.start_date, booking.end_date, locale)}
              <span className="mt-1 block text-xs font-normal text-ink-400">
                {t.booking.timesNote(settings.checkin_time, settings.checkout_time)}
              </span>
            </Row>

            <Row label={t.booking.checkIn}>{formatLong(booking.start_date, locale)}</Row>
            <Row label={t.booking.checkOut}>{formatLong(booking.end_date, locale)}</Row>
            <Row label={t.confirmation.guestsLabel}>{booking.guests ?? '—'}</Row>

            <div className="flex items-baseline justify-between gap-4 border-t border-sand-200 pt-4">
              <dt className="font-medium text-ink-900">{t.confirmation.totalLabel}</dt>
              <dd className="font-display text-2xl text-forest-800">
                {formatMoney(booking.total_cents, symbol, locale)}
              </dd>
            </div>
          </dl>

          {!isDead && (
            <p className="mt-4 text-sm text-ink-500">
              {isTest
                ? t.confirmation.testBooking
                : isCash
                  ? t.confirmation.payOnArrival
                  : t.confirmation.paid}
            </p>
          )}

          {!isDead && (
            <div className="mt-8 rounded-xl bg-sand-100 px-5 py-4">
              <h2 className="font-sans text-sm font-semibold text-forest-900">
                {t.confirmation.whatNext}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {t.confirmation.whatNextBody}
              </p>
            </div>
          )}

          <Link href="/" className="btn-ghost mt-8 w-full">
            {t.confirmation.backHome}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-end font-medium text-ink-900">{children}</dd>
    </div>
  );
}

function StatusMark({ tone }: { tone: 'success' | 'pending' | 'danger' }) {
  const styles = {
    success: 'bg-success-600/12 text-success-600',
    pending: 'bg-warn-600/12 text-warn-600',
    danger: 'bg-danger-600/12 text-danger-600',
  }[tone];

  return (
    <span
      className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${styles}`}
      aria-hidden="true"
    >
      {tone === 'success' ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : tone === 'pending' ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 7.5V12l3 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7l10 10M17 7L7 17"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}
