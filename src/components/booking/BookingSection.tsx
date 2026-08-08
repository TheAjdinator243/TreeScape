'use client';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { Reveal } from '@/components/site/Reveal';
import { daysBetween, formatLong } from '@/lib/dates';
import { count } from '@/lib/i18n';
import { WEEKEND_PERIOD, formatMoney } from '@/lib/pricing';
import type { BookingContext } from '@/lib/types';

import { StayCalendar } from './StayCalendar';
import { scrollToSummary, useStayForm } from './useStayForm';

export function BookingSection({ context }: { context: BookingContext }) {
  const { locale, t } = useI18n();
  const { settings, paymentMethods } = context;

  const methodCopy: Record<string, { label: string; hint: string }> = {
    bank_transfer: { label: t.booking.payTransfer, hint: t.booking.payTransferHint },
    cash: { label: t.booking.payCash, hint: t.booking.payCashHint },
    test: { label: t.booking.payTest, hint: t.booking.payTestHint },
  };

  // Stanje, cijena i provjere žive u `useStayForm` — dijeli ih i `pro` izgled,
  // pa se rezervacija ne može razići između dva izgleda istog sajta.
  const form = useStayForm(context);
  const {
    slots,
    range,
    guests,
    name,
    email,
    phone,
    note,
    method,
    start,
    end,
    singleDay,
    quote,
    stayError,
    error,
    busy,
  } = form;

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
            <h3 className="mb-4 text-center font-display text-xl text-forest-900">
              {t.booking.pickDates}
            </h3>
            <StayCalendar
              slots={slots}
              range={range}
              onRangeChange={form.setRange}
              maxNights={settings.max_nights}
            />
          </Reveal>

          {/* ── Sažetak i forma ── */}
          <Reveal delay={100} className="lg:sticky lg:top-24 lg:self-start">
            {/* `id` je meta za dugme iz donje trake na mobitelu — gost je već
                odabrao datum, pa ga vodimo pravo na pregled i formu, a ne na
                vrh kalendara koji je upravo popunio. */}
            {/* Bez `scroll-mt-*`: globalni `scroll-padding-top: 5rem` u
                globals.css već sklanja fiksnu navigaciju. Da su oba, razmak
                bi se udvostručio i pregled bi pao predaleko od vrha. */}
            <div id="pregled" className="card p-6">
              <h3 className="font-display text-xl text-forest-900">{t.booking.summaryTitle}</h3>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-500">{t.booking.checkIn}</dt>
                  <dd className="text-end font-medium text-ink-900">
                    {start ? (
                      formatLong(start, locale)
                    ) : (
                      <span className="text-ink-400">{t.booking.notSelected}</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-500">{t.booking.checkOut}</dt>
                  <dd className="text-end font-medium text-ink-900">
                    {end ? (
                      formatLong(end, locale)
                    ) : (
                      <span className="text-ink-400">{t.booking.notSelected}</span>
                    )}
                  </dd>
                </div>
              </dl>

              {/* Vremena prijave i odjave dolaze iz postavki — ista ona koja
                  vlasnik mijenja u administraciji. Ovdje stoje da gost odmah
                  vidi zašto dan odlaska jednog i dan dolaska drugog gosta
                  mogu biti isti dan. */}
              <p className="mt-3 text-xs text-ink-400">
                {t.booking.timesNote(settings.checkin_time, settings.checkout_time)}
              </p>

              {singleDay && (
                <p className="mt-3 rounded-lg bg-moss-100 px-3 py-2 text-xs text-forest-800">
                  {t.booking.singleDayNote}
                </p>
              )}

              {!range?.from && (
                <p className="mt-3 text-xs text-ink-400">{t.booking.singleDayHint}</p>
              )}

              {range?.from && (
                <button
                  type="button"
                  onClick={form.clearRange}
                  className="mt-3 text-xs font-medium text-forest-600 underline underline-offset-4 hover:text-forest-800"
                >
                  {t.booking.clearDates}
                </button>
              )}

              {quote && (
                <div className="mt-5 border-t border-sand-200 pt-5">
                  <div className="space-y-2.5 text-sm">
                    <Row
                      label={`${t.booking.daysLabel(quote.dayCount)} × ${formatMoney(
                        quote.averageDailyCents,
                        quote.currencySymbol,
                        locale
                      )}`}
                      value={formatMoney(quote.totalCents, quote.currencySymbol, locale)}
                    />
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-sand-200 pt-4">
                    <span className="font-medium text-ink-900">{t.booking.total}</span>
                    <span className="font-display text-2xl text-forest-800">
                      {formatMoney(quote.totalCents, quote.currencySymbol, locale)}
                    </span>
                  </div>

                  {/* Ako svi dani nisu iste cijene, gost zaslužuje objašnjenje —
                      i to ono pravo: vikend i sezona nisu isti razlog. */}
                  {new Set(quote.days.map((d) => d.cents)).size > 1 && (
                    <p className="mt-2 text-xs text-ink-400">
                      {quote.days.some((d) => d.periodName === WEEKEND_PERIOD)
                        ? t.booking.weekendNote
                        : t.booking.seasonalNote}
                    </p>
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
                    onChange={(e) => form.setGuests(Number(e.target.value))}
                    className="field-input"
                    disabled={busy}
                  >
                    {Array.from({ length: settings.max_guests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {count(locale, n, t.common.guests)}
                      </option>
                    ))}
                  </select>
                </div>

                <Field
                  id="name"
                  label={t.booking.name}
                  value={name}
                  onChange={form.setName}
                  placeholder={t.booking.namePlaceholder}
                  autoComplete="name"
                  disabled={busy}
                />
                <Field
                  id="email"
                  label={t.booking.email}
                  type="email"
                  value={email}
                  onChange={form.setEmail}
                  placeholder={t.booking.emailPlaceholder}
                  autoComplete="email"
                  disabled={busy}
                />
                <Field
                  id="phone"
                  label={t.booking.phone}
                  type="tel"
                  value={phone}
                  onChange={form.setPhone}
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
                    onChange={(e) => form.setNote(e.target.value)}
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
                    const copy = methodCopy[id];
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
                          onChange={() => form.setMethod(id)}
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
                onClick={() => void form.submit()}
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
                {start && end ? count(locale, daysBetween(start, end), t.common.days) : ''}
              </p>
              <p className="font-display text-lg text-forest-800">
                {formatMoney(quote.totalCents, quote.currencySymbol, locale)}
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToSummary}
              className="btn-primary shrink-0 px-5 py-2.5"
            >
              {t.nav.book}
            </button>
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
