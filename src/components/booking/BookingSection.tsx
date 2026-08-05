'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Reveal } from '@/components/site/Reveal';
import { formatLong, nightsBetween, toDateStr } from '@/lib/dates';
import { formatMoney, quoteStay, rangeHasConflict, validateStay } from '@/lib/pricing';
import { t } from '@/lib/strings';
import type { BookingContext } from '@/lib/types';

import { StayCalendar } from './StayCalendar';
import { useAvailability } from './useAvailability';

type Submitting = 'card' | 'cash' | null;

export function BookingSection({
  context,
  stripeEnabled,
}: {
  context: BookingContext;
  stripeEnabled: boolean;
}) {
  const router = useRouter();
  const { periods, settings } = context;

  const slots = useAvailability(context.slots);

  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState<Submitting>(null);
  const [error, setError] = useState<string | null>(null);

  const start = range?.from ? toDateStr(range.from) : null;
  const end = range?.to ? toDateStr(range.to) : null;
  const complete = Boolean(start && end && start !== end);

  const quote = useMemo(
    () => (complete && start && end ? quoteStay(start, end, periods, settings) : null),
    [complete, start, end, periods, settings]
  );

  const stayError = useMemo(() => {
    if (!complete || !start || !end) return null;
    if (rangeHasConflict(start, end, slots)) return t.booking.unavailableRange;
    const result = validateStay(start, end, guests, periods, settings);
    return result.ok ? null : result.message;
  }, [complete, start, end, guests, periods, settings, slots]);

  function formError(): string | null {
    if (!complete) return t.booking.selectDatesFirst;
    if (name.trim().length < 2) return t.errors.REQUIRED_NAME;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return t.errors.REQUIRED_EMAIL;
    if (phone.trim().length < 6) return t.errors.REQUIRED_PHONE;
    return stayError;
  }

  async function submit(method: 'card' | 'cash') {
    const problem = formError();
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSubmitting(method);

    try {
      const res = await fetch(method === 'card' ? '/api/booking/hold' : '/api/booking/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: start,
          end_date: end,
          guests,
          // Cijena se NE šalje — server je računa sam iz baze.
          guest_name: name.trim(),
          guest_email: email.trim(),
          guest_phone: phone.trim(),
          note: note.trim() || null,
        }),
      });

      const data = (await res.json()) as { url?: string; token?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? t.errors.SERVER_ERROR);
        setSubmitting(null);
        return;
      }

      if (method === 'card' && data.url) {
        window.location.href = data.url;
        return; // Namjerno ne gasimo spinner — stranica odlazi na Stripe.
      }

      if (data.token) {
        router.push(`/rezervacija/${data.token}`);
        return;
      }

      setError(t.errors.SERVER_ERROR);
      setSubmitting(null);
    } catch {
      setError(t.errors.SERVER_ERROR);
      setSubmitting(null);
    }
  }

  const busy = submitting !== null;

  return (
    <section id="rezervacija" className="bg-sand-100">
      <div className="section">
        <Reveal>
          <p className="section-eyebrow">{t.nav.book}</p>
          <h2 className="section-title">{t.booking.heading}</h2>
          <p className="section-lead">{t.booking.lead}</p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          {/* ── Kalendar ── */}
          <Reveal className="card p-4 sm:p-6">
            <StayCalendar
              slots={slots}
              range={range}
              onRangeChange={(next) => {
                setRange(next);
                setError(null);
              }}
              maxNights={settings.max_nights}
            />
          </Reveal>

          {/* ── Sažetak i forma ── */}
          <Reveal delay={100} className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h3 className="font-display text-xl text-forest-900">{t.booking.summaryTitle}</h3>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-500">{t.booking.checkIn}</dt>
                  <dd className="text-right font-medium text-ink-900">
                    {start ? formatLong(start) : <span className="text-ink-400">—</span>}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-500">{t.booking.checkOut}</dt>
                  <dd className="text-right font-medium text-ink-900">
                    {end && start !== end ? (
                      formatLong(end)
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              {range?.from && (
                <button
                  type="button"
                  onClick={() => setRange(undefined)}
                  className="mt-3 text-xs font-medium text-forest-600 underline underline-offset-4 hover:text-forest-800"
                >
                  {t.booking.clearDates}
                </button>
              )}

              {quote && (
                <div className="mt-5 border-t border-sand-200 pt-5">
                  <div className="space-y-2.5 text-sm">
                    <Row
                      label={`${t.booking.nightsLabel(quote.nightCount)} × ${formatMoney(
                        quote.averageNightlyCents,
                        quote.currencySymbol
                      )}`}
                      value={formatMoney(quote.subtotalCents, quote.currencySymbol)}
                    />
                    <Row
                      label={t.booking.cleaningFee}
                      value={formatMoney(quote.cleaningFeeCents, quote.currencySymbol)}
                    />
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-sand-200 pt-4">
                    <span className="font-medium text-ink-900">{t.booking.total}</span>
                    <span className="font-display text-2xl text-forest-800">
                      {formatMoney(quote.totalCents, quote.currencySymbol)}
                    </span>
                  </div>

                  {/* Ako sve noći nisu iste cijene, gost zaslužuje objašnjenje. */}
                  {new Set(quote.nights.map((n) => n.cents)).size > 1 && (
                    <p className="mt-2 text-xs text-ink-400">{t.booking.seasonalNote}</p>
                  )}
                </div>
              )}

              {/* ── Podaci gosta ── */}
              <div className="mt-6 space-y-4 border-t border-sand-200 pt-6">
                <div>
                  <label htmlFor="guests" className="field-label">
                    {t.booking.guests}
                  </label>
                  <select
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="field-input"
                    disabled={busy}
                  >
                    {Array.from({ length: settings.max_guests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {t.common.guestsCount(n)}
                      </option>
                    ))}
                  </select>
                </div>

                <Field
                  id="name"
                  label={t.booking.name}
                  value={name}
                  onChange={setName}
                  placeholder={t.booking.namePlaceholder}
                  autoComplete="name"
                  disabled={busy}
                />
                <Field
                  id="email"
                  label={t.booking.email}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder={t.booking.emailPlaceholder}
                  autoComplete="email"
                  disabled={busy}
                />
                <Field
                  id="phone"
                  label={t.booking.phone}
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder={t.booking.phonePlaceholder}
                  autoComplete="tel"
                  disabled={busy}
                />

                <div>
                  <label htmlFor="note" className="field-label">
                    {t.booking.note}{' '}
                    <span className="font-normal text-ink-400">({t.booking.optional})</span>
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder={t.booking.notePlaceholder}
                    className="field-input resize-none"
                    disabled={busy}
                  />
                </div>
              </div>

              {(error || stayError) && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-danger-600/25 bg-danger-600/5 px-4 py-3 text-sm text-danger-600"
                >
                  {error ?? stayError}
                </p>
              )}

              {/* ── Plaćanje ── */}
              <div className="mt-6 space-y-3">
                {stripeEnabled && (
                  <div>
                    <button
                      type="button"
                      onClick={() => void submit('card')}
                      disabled={busy}
                      className="btn-accent w-full"
                    >
                      {submitting === 'card' ? t.booking.redirecting : t.booking.payCard}
                    </button>
                    <p className="mt-2 text-center text-xs leading-relaxed text-ink-400">
                      {t.booking.payCardHint}
                    </p>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => void submit('cash')}
                    disabled={busy}
                    className={stripeEnabled ? 'btn-ghost w-full' : 'btn-primary w-full'}
                  >
                    {submitting === 'cash' ? t.booking.submitting : t.booking.payCash}
                  </button>
                  <p className="mt-2 text-center text-xs leading-relaxed text-ink-400">
                    {t.booking.payCashHint}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Na mobitelu sažetak cijene prati gosta dok bira datume. */}
      {quote && !stayError && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 px-5 py-3 shadow-lift backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-ink-500">
                {start && end ? `${nightsBetween(start, end)} × ${t.common.night}` : ''}
              </p>
              <p className="font-display text-lg text-forest-800">
                {formatMoney(quote.totalCents, quote.currencySymbol)}
              </p>
            </div>
            <a href="#rezervacija" className="btn-primary shrink-0 px-5 py-2.5">
              {t.nav.book}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-900">{value}</span>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="field-input"
      />
    </div>
  );
}
