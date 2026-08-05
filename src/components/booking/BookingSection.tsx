'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Reveal } from '@/components/site/Reveal';
import { formatLong, nightsBetween, toDateStr } from '@/lib/dates';
import { formatMoney, quoteStay, rangeHasConflict, validateStay } from '@/lib/pricing';
import { t } from '@/lib/strings';
import type { BookingContext, PaymentMethod } from '@/lib/types';

import { StayCalendar } from './StayCalendar';
import { useAvailability } from './useAvailability';

const METHOD_COPY: Record<string, { label: string; hint: string }> = {
  bank_transfer: { label: t.booking.payTransfer, hint: t.booking.payTransferHint },
  cash: { label: t.booking.payCash, hint: t.booking.payCashHint },
  test: { label: t.booking.payTest, hint: t.booking.payTestHint },
};

export function BookingSection({ context }: { context: BookingContext }) {
  const router = useRouter();
  const { periods, settings, paymentMethods } = context;

  const slots = useAvailability(context.slots);

  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<PaymentMethod | null>(paymentMethods[0] ?? null);
  const [submitting, setSubmitting] = useState(false);
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
    if (!method) return t.errors.REQUIRED_METHOD;
    return stayError;
  }

  async function submit() {
    const problem = formError();
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/booking/reserve', {
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
          payment_method: method,
        }),
      });

      const data = (await res.json()) as { token?: string; error?: string };

      if (!res.ok || !data.token) {
        setError(data.error ?? t.errors.SERVER_ERROR);
        setSubmitting(false);
        return;
      }

      // Spinner namjerno ostaje upaljen — stranica odlazi na potvrdu.
      router.push(`/rezervacija/${data.token}`);
    } catch {
      setError(t.errors.SERVER_ERROR);
      setSubmitting(false);
    }
  }

  const busy = submitting;

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

              {/* ── Način plaćanja ── */}
              <fieldset className="mt-6 border-t border-sand-200 pt-6">
                <legend className="sr-only">{t.booking.payMethodTitle}</legend>
                <p className="field-label">{t.booking.payMethodTitle}</p>

                <div className="space-y-2.5">
                  {paymentMethods.map((id) => {
                    const copy = METHOD_COPY[id];
                    if (!copy) return null;
                    const selected = method === id;

                    return (
                      <label
                        key={id}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                          selected
                            ? 'border-forest-600 bg-forest-700/5 ring-2 ring-forest-600/20'
                            : 'border-sand-300 hover:border-forest-600/40'
                        } ${busy ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={id}
                          checked={selected}
                          disabled={busy}
                          onChange={() => {
                            setMethod(id);
                            setError(null);
                          }}
                          className="mt-1 h-4 w-4 shrink-0 accent-forest-700"
                        />
                        <span className="min-w-0">
                          <span
                            className={`block text-sm font-semibold ${
                              id === 'test' ? 'text-warn-600' : 'text-ink-900'
                            }`}
                          >
                            {copy.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                            {copy.hint}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {(error || stayError) && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-danger-600/25 bg-danger-600/5 px-4 py-3 text-sm text-danger-600"
                >
                  {error ?? stayError}
                </p>
              )}

              <button
                type="button"
                onClick={() => void submit()}
                disabled={busy || paymentMethods.length === 0}
                className="btn-accent mt-6 w-full"
              >
                {busy ? t.booking.submitting : t.booking.reserve}
              </button>
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
