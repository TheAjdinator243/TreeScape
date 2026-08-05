import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/site/Footer';
import { getBookingByToken } from '@/lib/booking-service';
import { formatLong, formatRange } from '@/lib/dates';
import { isDatabaseConfigured } from '@/lib/env';
import { formatMoney } from '@/lib/pricing';
import { t } from '@/lib/strings';

export const dynamic = 'force-dynamic';

// Potvrde su privatne — nemaju šta tražiti u pretraživačima.
export const metadata: Metadata = {
  title: 'Vaša rezervacija',
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isDatabaseConfigured) notFound();

  const booking = await getBookingByToken(token);
  if (!booking || booking.status === 'blocked') notFound();

  const isCash = booking.payment_method === 'cash';
  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending_cash' || booking.status === 'pending_payment';
  const isDead = booking.status === 'cancelled' || booking.status === 'expired';

  const symbol = booking.price_breakdown?.currencySymbol ?? '€';

  return (
    <>
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
          </div>

          <h1 className="mt-6 font-display text-3xl leading-tight text-forest-900">
            {isDead
              ? 'Rezervacija više nije aktivna'
              : isConfirmed
                ? t.confirmation.cardTitle
                : t.confirmation.cashTitle}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-ink-500">
            {isDead
              ? 'Ovaj termin je oslobođen i ponovo je dostupan drugim gostima.'
              : isConfirmed
                ? t.confirmation.cardLead
                : t.confirmation.cashLead}
          </p>

          {isPending && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-warn-600/10 px-4 py-1.5 text-sm font-medium text-warn-600">
              <span className="h-2 w-2 rounded-full bg-warn-600" aria-hidden="true" />
              {t.confirmation.pendingBadge}
            </p>
          )}

          <dl className="mt-8 space-y-4 border-t border-sand-200 pt-8 text-sm">
            <Row label={t.confirmation.reference}>
              <span className="font-mono text-base tracking-wider text-forest-800">
                {booking.public_token.slice(0, 8).toUpperCase()}
              </span>
            </Row>

            <Row label={t.confirmation.stay}>
              {formatRange(booking.start_date, booking.end_date)}
            </Row>

            <Row label={t.booking.checkIn}>{formatLong(booking.start_date)}</Row>
            <Row label={t.booking.checkOut}>{formatLong(booking.end_date)}</Row>
            <Row label={t.confirmation.guestsLabel}>{booking.guests ?? '—'}</Row>

            <div className="flex items-baseline justify-between gap-4 border-t border-sand-200 pt-4">
              <dt className="font-medium text-ink-900">{t.confirmation.totalLabel}</dt>
              <dd className="font-display text-2xl text-forest-800">
                {formatMoney(booking.total_cents, symbol)}
              </dd>
            </div>
          </dl>

          {!isDead && (
            <p className="mt-4 text-sm text-ink-500">
              {isCash ? t.confirmation.payOnArrival : t.confirmation.paid}
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
      <dd className="text-right font-medium text-ink-900">{children}</dd>
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
