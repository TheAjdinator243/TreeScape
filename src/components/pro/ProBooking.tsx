'use client';

import { StayCalendar } from '@/components/booking/StayCalendar';
import { scrollToSummary, useStayForm } from '@/components/booking/useStayForm';
import { useI18n } from '@/components/i18n/LocaleProvider';
import { Reveal } from '@/components/site/Reveal';
import { daysBetween, formatLong } from '@/lib/dates';
import { count } from '@/lib/i18n';
import { WEEKEND_PERIOD, formatMoney } from '@/lib/pricing';
import type { BookingContext } from '@/lib/types';

/**
 * Rezervacija u "pro" izgledu.
 *
 * Ovdje je SAMO izgled. Stanje, cijena, provjere i slanje žive u
 * `useStayForm`, koji dijeli s osnovnom verzijom — pa se ne može desiti da
 * jedna verzija prima termin koji druga odbija.
 *
 * Vizuelno: nema kartica ni okvira. Forma je jedna ploha, polja su samo
 * linije, a ukupan iznos je krupan serif — kao na računu u hotelu, a ne kao
 * u korpi web-prodavnice.
 */
export function ProBooking({ context }: { context: BookingContext }) {
  const { locale, t } = useI18n();
  const { settings, paymentMethods } = context;

  const methodCopy: Record<string, { label: string; hint: string }> = {
    bank_transfer: { label: t.booking.payTransfer, hint: t.booking.payTransferHint },
    cash: { label: t.booking.payCash, hint: t.booking.payCashHint },
    test: { label: t.booking.payTest, hint: t.booking.payTestHint },
  };

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
    <section id="rezervacija" className="bg-onyx-950">
      <div className="pro-section">
        <Reveal className="max-w-2xl">
          <p className="pro-eyebrow">{t.nav.book}</p>
          <h2 className="pro-title mt-6 text-ivory-50">{t.booking.heading}</h2>
          <p className="pro-lead">{t.booking.lead}</p>
        </Reveal>

        <div className="mt-16 grid gap-px border border-ivory-100/12 bg-ivory-100/12 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* ── Kalendar ── */}
          <div className="bg-onyx-950 p-6 sm:p-10">
            {/* Forma desno je znatno viša od kalendara. Bez ovoga bi kalendar
                ostao gore, a ispod njega bi zjapilo pola ekrana praznine —
                ovako prati gosta dok popunjava podatke. */}
            <div className="lg:sticky lg:top-28">
              <h3 className="mb-8 text-center text-2xl text-ivory-50">{t.booking.pickDates}</h3>
              <StayCalendar
                slots={slots}
                range={range}
                onRangeChange={form.setRange}
                maxNights={settings.max_nights}
              />
            </div>
          </div>

          {/* ── Sažetak i forma ── */}
          {/* `id` je meta za dugme iz donje trake na mobitelu — gost je već
              odabrao datum, pa ga vodimo pravo na pregled i formu. */}
          <div id="pregled" className="bg-onyx-900 p-6 sm:p-10">
            <h3 className="text-2xl text-ivory-50">{t.booking.summaryTitle}</h3>

            <dl className="mt-8 space-y-4 text-base font-light">
              <Line
                label={t.booking.checkIn}
                value={start ? formatLong(start, locale) : null}
                empty={t.booking.notSelected}
              />
              <Line
                label={t.booking.checkOut}
                value={end ? formatLong(end, locale) : null}
                empty={t.booking.notSelected}
              />
            </dl>

            {/* Vremena prijave i odjave dolaze iz postavki — ista ona koja
                  vlasnik mijenja u administraciji. Ovdje stoje da gost odmah
                  vidi zašto dan odlaska jednog i dan dolaska drugog gosta
                  mogu biti isti dan. */}
            <p className="mt-5 text-sm font-light text-ivory-500">
              {t.booking.timesNote(settings.checkin_time, settings.checkout_time)}
            </p>

            {singleDay && (
              <p className="mt-5 border-s-2 border-brass-400 ps-4 text-sm font-light leading-relaxed text-ivory-200">
                {t.booking.singleDayNote}
              </p>
            )}

            {!range?.from && (
              <p className="mt-5 text-sm font-light text-ivory-500">{t.booking.singleDayHint}</p>
            )}

            {range?.from && (
              <button
                type="button"
                onClick={form.clearRange}
                className="mt-5 text-[0.74rem] uppercase tracking-[0.2em] text-brass-400 transition-colors hover:text-brass-300"
              >
                {t.booking.clearDates}
              </button>
            )}

            {quote && (
              <div className="mt-8 border-t border-ivory-100/12 pt-8">
                <div className="flex items-baseline justify-between gap-4 text-base font-light text-ivory-200">
                  <span>
                    {t.booking.daysLabel(quote.dayCount)} ×{' '}
                    {formatMoney(quote.averageDailyCents, quote.currencySymbol, locale)}
                  </span>
                  <span className="text-ivory-50">
                    {formatMoney(quote.totalCents, quote.currencySymbol, locale)}
                  </span>
                </div>

                <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-ivory-100/12 pt-6">
                  <span className="text-[0.76rem] uppercase tracking-[0.22em] text-ivory-400">
                    {t.booking.total}
                  </span>
                  <span className="font-[family-name:var(--font-pro-display)] text-4xl font-light text-brass-300">
                    {formatMoney(quote.totalCents, quote.currencySymbol, locale)}
                  </span>
                </div>

                {/* Ako svi dani nisu iste cijene, gost zaslužuje objašnjenje —
                    i to ono pravo: vikend i sezona nisu isti razlog. */}
                {new Set(quote.days.map((d) => d.cents)).size > 1 && (
                  <p className="mt-3 text-sm font-light text-ivory-500">
                    {quote.days.some((d) => d.periodName === WEEKEND_PERIOD)
                      ? t.booking.weekendNote
                      : t.booking.seasonalNote}
                  </p>
                )}
              </div>
            )}

            {/* ── Podaci gosta ── */}
            <div className="mt-10 space-y-6 border-t border-ivory-100/12 pt-10">
              <div>
                <label htmlFor="pro-guests" className="pro-label">
                  {t.booking.guests}
                </label>
                <select
                  id="pro-guests"
                  value={guests}
                  onChange={(e) => form.setGuests(Number(e.target.value))}
                  className="pro-field"
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
                id="pro-name"
                label={t.booking.name}
                value={name}
                onChange={form.setName}
                placeholder={t.booking.namePlaceholder}
                autoComplete="name"
                disabled={busy}
              />
              <Field
                id="pro-email"
                label={t.booking.email}
                type="email"
                value={email}
                onChange={form.setEmail}
                placeholder={t.booking.emailPlaceholder}
                autoComplete="email"
                disabled={busy}
              />
              <Field
                id="pro-phone"
                label={t.booking.phone}
                type="tel"
                value={phone}
                onChange={form.setPhone}
                placeholder={t.booking.phonePlaceholder}
                autoComplete="tel"
                disabled={busy}
              />

              <div>
                <label htmlFor="pro-note" className="pro-label">
                  {t.booking.note}{' '}
                  <span className="normal-case tracking-normal text-ivory-500">
                    ({t.booking.optional})
                  </span>
                </label>
                <textarea
                  id="pro-note"
                  value={note}
                  onChange={(e) => form.setNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder={t.booking.notePlaceholder}
                  className="pro-field resize-none"
                  disabled={busy}
                />
              </div>
            </div>

            {/* ── Način plaćanja ── */}
            <fieldset className="mt-10 border-t border-ivory-100/12 pt-10">
              <legend className="sr-only">{t.booking.payMethodTitle}</legend>
              <p className="pro-label">{t.booking.payMethodTitle}</p>

              <div className="mt-4 space-y-3">
                {paymentMethods.map((id) => {
                  const copy = methodCopy[id];
                  if (!copy) return null;
                  const selected = method === id;

                  return (
                    <label
                      key={id}
                      className={`flex cursor-pointer gap-4 border p-5 transition-colors ${
                        selected
                          ? 'border-brass-400 bg-brass-400/5'
                          : 'border-ivory-100/15 hover:border-ivory-100/35'
                      } ${busy ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <input
                        type="radio"
                        name="pro_payment_method"
                        value={id}
                        checked={selected}
                        disabled={busy}
                        onChange={() => form.setMethod(id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-brass-400"
                      />
                      <span className="min-w-0">
                        <span
                          className={`block text-[0.8rem] font-medium uppercase tracking-[0.18em] ${
                            id === 'test' ? 'text-brass-400' : 'text-ivory-50'
                          }`}
                        >
                          {copy.label}
                        </span>
                        <span className="mt-2 block text-sm font-light leading-relaxed text-ivory-400">
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
                className="mt-8 border-s-2 border-danger-600 bg-danger-600/10 px-4 py-3 text-base font-light text-ivory-50"
              >
                {error ?? stayError}
              </p>
            )}

            <button
              type="button"
              onClick={() => void form.submit()}
              disabled={busy || paymentMethods.length === 0}
              className="pro-btn-solid mt-10 w-full"
            >
              {busy ? t.booking.submitting : t.booking.reserve}
            </button>
          </div>
        </div>
      </div>

      {/* Na mobitelu sažetak cijene prati gosta dok bira datume. */}
      {quote && !stayError && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ivory-100/15 bg-onyx-950/95 px-6 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[0.7rem] uppercase tracking-[0.2em] text-ivory-400">
                {start && end ? count(locale, daysBetween(start, end), t.common.days) : ''}
              </p>
              <p className="font-[family-name:var(--font-pro-display)] text-2xl text-brass-300">
                {formatMoney(quote.totalCents, quote.currencySymbol, locale)}
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToSummary}
              className="pro-btn-outline shrink-0 px-6 py-3"
            >
              {t.nav.book}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Line({ label, value, empty }: { label: string; value: string | null; empty: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ivory-100/10 pb-4">
      <dt className="text-[0.76rem] uppercase tracking-[0.2em] text-ivory-400">{label}</dt>
      <dd className="text-end text-ivory-50">
        {value ?? <span className="text-ivory-500">{empty}</span>}
      </dd>
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
      <label htmlFor={id} className="pro-label">
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
        className="pro-field"
      />
    </div>
  );
}
