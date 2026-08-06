'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { formatDateTime, formatRange, todayStr } from '@/lib/dates';
import { count } from '@/lib/i18n';
import { paymentReference } from '@/lib/payments';
import { formatMoney } from '@/lib/pricing';
import type { Booking, RatePeriod, Settings } from '@/lib/types';

import { PricingTab } from './PricingTab';

type Tab = 'requests' | 'bookings' | 'calendar' | 'pricing';

export function Dashboard({
  bookings,
  periods,
  settings,
}: {
  bookings: Booking[];
  periods: RatePeriod[];
  settings: Settings;
}) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('requests');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const requests = bookings.filter((b) => b.status === 'pending_cash');
  const transfers = bookings.filter((b) => b.status === 'pending_transfer');
  const blocked = bookings.filter((b) => b.status === 'blocked' && b.end_date >= todayStr());

  /** Zajednički poziv admin API-ja: uradi, pa osvježi podatke sa servera. */
  async function call(url: string, init: RequestInit): Promise<boolean> {
    setError(null);
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? t.errors.SERVER_ERROR);
        return false;
      }

      startTransition(() => router.refresh());
      return true;
    } catch {
      setError(t.errors.SERVER_ERROR);
      return false;
    }
  }

  async function decide(bookingId: string, decision: 'approve' | 'reject') {
    const isTransfer = transfers.some((b) => b.id === bookingId);
    const message =
      decision === 'reject'
        ? t.admin.rejectConfirm
        : isTransfer
          ? t.admin.markPaidConfirm
          : t.admin.approveConfirm;

    if (!window.confirm(message)) return;

    await call('/api/admin/bookings', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, decision }),
    });
  }

  async function cancel(bookingId: string, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    await call(`/api/admin/bookings?id=${bookingId}`, { method: 'DELETE' });
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.refresh();
  }

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'requests', label: t.admin.tabRequests, badge: requests.length + transfers.length },
    { id: 'bookings', label: t.admin.tabBookings },
    { id: 'calendar', label: t.admin.tabCalendar },
    { id: 'pricing', label: t.admin.tabPricing },
  ];

  return (
    <main className="min-h-dvh bg-sand-50">
      <header className="border-b border-sand-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="font-display text-lg text-forest-900">{t.site.name}</p>
            <p className="text-xs text-ink-400">{t.admin.title}</p>
          </div>
          <button type="button" onClick={() => void logout()} className="btn-ghost px-4 py-2 text-xs">
            {t.admin.logout}
          </button>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 sm:px-8">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === item.id
                  ? 'border-forest-700 text-forest-800'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              }`}
            >
              {item.label}
              {item.badge ? (
                <span className="ms-2 rounded-full bg-ember-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-danger-600/25 bg-danger-600/5 px-4 py-3 text-sm text-danger-600"
          >
            {error}
          </p>
        )}

        <div className={pending ? 'pointer-events-none opacity-60 transition-opacity' : ''}>
          {tab === 'requests' && (
            <>
              {/* Uplate na račun idu prve — tu novac stvarno čeka na izvodu. */}
              <Section heading={t.admin.transfersHeading}>
                {transfers.length === 0 ? (
                  <Empty>{t.admin.transfersEmpty}</Empty>
                ) : (
                  <ul className="space-y-4">
                    {transfers.map((booking) => (
                      <li key={booking.id} className="card p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-display text-lg text-forest-900">
                              {formatRange(booking.start_date, booking.end_date, locale)}
                            </p>
                            <p className="mt-1 text-sm text-ink-700">
                              {booking.guest_name} ·{' '}
                              {count(locale, booking.guests ?? 1, t.common.guests)}
                            </p>
                            <p className="mt-0.5 text-sm text-ink-500">
                              {booking.guest_email} · {booking.guest_phone}
                            </p>
                            <p className="mt-2 text-sm">
                              <span className="text-ink-500">{t.admin.transferRef}: </span>
                              <span dir="ltr" className="font-mono font-semibold text-forest-800">
                                {paymentReference(booking.public_token)}
                              </span>
                            </p>
                            {booking.hold_expires_at && (
                              <p className="mt-1 text-xs text-warn-600">
                                {t.admin.deadlineAt}: {formatDateTime(booking.hold_expires_at, locale)}
                              </p>
                            )}
                          </div>

                          <div className="text-end">
                            <p className="font-display text-2xl text-forest-800">
                              {formatMoney(booking.total_cents, settings.currency_symbol, locale)}
                            </p>
                            <p className="text-xs text-ink-400">{t.admin.byTransfer}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex gap-3 border-t border-sand-200 pt-4">
                          <button
                            type="button"
                            onClick={() => void decide(booking.id, 'approve')}
                            className="btn-primary flex-1 py-2.5 text-xs"
                          >
                            {t.admin.markPaid}
                          </button>
                          <button
                            type="button"
                            onClick={() => void decide(booking.id, 'reject')}
                            className="btn-ghost flex-1 py-2.5 text-xs"
                          >
                            {t.admin.reject}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <div className="mt-12">
                <Section heading={t.admin.requestsHeading}>
                  {requests.length === 0 ? (
                <Empty>{t.admin.requestsEmpty}</Empty>
              ) : (
                <ul className="space-y-4">
                  {requests.map((booking) => (
                    <li key={booking.id} className="card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-display text-lg text-forest-900">
                            {formatRange(booking.start_date, booking.end_date, locale)}
                          </p>
                          <p className="mt-1 text-sm text-ink-700">
                            {booking.guest_name} ·{' '}
                            {count(locale, booking.guests ?? 1, t.common.guests)}
                          </p>
                          <p className="mt-0.5 text-sm text-ink-500">
                            {booking.guest_email} · {booking.guest_phone}
                          </p>
                          <p className="mt-2 text-xs text-ink-400">
                            {t.admin.receivedAt(formatDateTime(booking.created_at, locale))}
                          </p>
                          {booking.note && (
                            <p className="mt-3 rounded-lg bg-sand-100 px-3 py-2 text-sm text-ink-700">
                              {booking.note}
                            </p>
                          )}
                        </div>

                        <div className="text-end">
                          <p className="font-display text-2xl text-forest-800">
                            {formatMoney(booking.total_cents, settings.currency_symbol, locale)}
                          </p>
                          <p className="text-xs text-ink-400">{t.admin.byCash}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3 border-t border-sand-200 pt-4">
                        <button
                          type="button"
                          onClick={() => void decide(booking.id, 'approve')}
                          className="btn-primary flex-1 py-2.5 text-xs"
                        >
                          {t.admin.approve}
                        </button>
                        <button
                          type="button"
                          onClick={() => void decide(booking.id, 'reject')}
                          className="btn-ghost flex-1 py-2.5 text-xs"
                        >
                          {t.admin.reject}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
                </Section>
              </div>
            </>
          )}

          {tab === 'bookings' && (
            <Section heading={t.admin.bookingsHeading}>
              {bookings.length === 0 ? (
                <Empty>{t.admin.bookingsEmpty}</Empty>
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full min-w-[720px] text-start text-sm">
                    <thead className="border-b border-sand-200 text-xs uppercase tracking-wider text-ink-400">
                      <tr>
                        <th className="px-5 py-3 font-medium">{t.admin.colStay}</th>
                        <th className="px-5 py-3 font-medium">{t.admin.colGuest}</th>
                        <th className="px-5 py-3 font-medium">{t.admin.colMethod}</th>
                        <th className="px-5 py-3 font-medium">{t.admin.colStatus}</th>
                        <th className="px-5 py-3 text-end font-medium">{t.admin.colAmount}</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-5 py-3.5 font-medium text-ink-900">
                            {formatRange(booking.start_date, booking.end_date, locale)}
                          </td>
                          <td className="px-5 py-3.5 text-ink-700">
                            {booking.guest_name ?? (
                              <span className="text-ink-400">{booking.admin_note ?? '—'}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-ink-500">
                            {t.admin.methodLabels[booking.payment_method]}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="px-5 py-3.5 text-end tabular-nums text-ink-900">
                            {booking.total_cents > 0
                              ? formatMoney(booking.total_cents, settings.currency_symbol, locale)
                              : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-end">
                            {['confirmed', 'pending_cash', 'pending_payment'].includes(
                              booking.status
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  void cancel(booking.id, t.admin.cancelConfirm)
                                }
                                className="text-xs font-medium text-danger-600 underline underline-offset-4"
                              >
                                {t.admin.cancel}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          )}

          {tab === 'calendar' && (
            <BlockTab
              blocked={blocked}
              onBlock={(body) =>
                call('/api/admin/block', { method: 'POST', body: JSON.stringify(body) })
              }
              onUnblock={(id) => cancel(id, t.admin.unblockConfirm)}
            />
          )}

          {tab === 'pricing' && (
            <PricingTab settings={settings} periods={periods} onCall={call} />
          )}
        </div>
      </div>
    </main>
  );
}

function BlockTab({
  blocked,
  onBlock,
  onUnblock,
}: {
  blocked: Booking[];
  onBlock: (body: { start_date: string; end_date: string; reason?: string }) => Promise<boolean>;
  onUnblock: (id: string) => Promise<void>;
}) {
  const { locale, t } = useI18n();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onBlock({ start_date: start, end_date: end, reason: reason || undefined });
    if (ok) {
      setStart('');
      setEnd('');
      setReason('');
    }
  }

  return (
    <Section heading={t.admin.calendarHeading}>
      <p className="-mt-4 mb-6 max-w-2xl text-sm leading-relaxed text-ink-500">
        {t.admin.calendarLead}
      </p>

      <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="block-start" className="field-label">
            {t.admin.seasonFrom}
          </label>
          <input
            id="block-start"
            type="date"
            required
            min={todayStr()}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="block-end" className="field-label">
            {t.admin.seasonTo}
          </label>
          <input
            id="block-end"
            type="date"
            required
            min={start || todayStr()}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="block-reason" className="field-label">
            {t.admin.blockReason}
          </label>
          <input
            id="block-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t.admin.blockReasonPlaceholder}
            className="field-input"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full py-2.5 text-xs">
            {t.admin.blockSubmit}
          </button>
        </div>
      </form>

      <h3 className="mt-10 font-display text-lg text-forest-900">{t.admin.blockedHeading}</h3>
      {blocked.length === 0 ? (
        <Empty>{t.admin.blockedEmpty}</Empty>
      ) : (
        <ul className="mt-4 space-y-2">
          {blocked.map((item) => (
            <li key={item.id} className="card flex items-center justify-between gap-4 px-5 py-3.5">
              <div>
                <p className="font-medium text-ink-900">
                  {formatRange(item.start_date, item.end_date, locale)}
                </p>
                {item.admin_note && <p className="text-sm text-ink-500">{item.admin_note}</p>}
              </div>
              <button
                type="button"
                onClick={() => void onUnblock(item.id)}
                className="text-xs font-medium text-danger-600 underline underline-offset-4"
              >
                {t.admin.unblock}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();

  const tone: Record<string, string> = {
    confirmed: 'bg-success-600/12 text-success-600',
    pending_cash: 'bg-warn-600/12 text-warn-600',
    pending_payment: 'bg-warn-600/12 text-warn-600',
    blocked: 'bg-ink-500/12 text-ink-700',
    cancelled: 'bg-danger-600/10 text-danger-600',
    expired: 'bg-ink-400/12 text-ink-400',
  };

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        tone[status] ?? 'bg-sand-200 text-ink-700'
      }`}
    >
      {t.admin.statusLabels[status] ?? status}
    </span>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-6 font-display text-2xl text-forest-900">{heading}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-sand-300 px-6 py-12 text-center text-sm text-ink-400">
      {children}
    </p>
  );
}
