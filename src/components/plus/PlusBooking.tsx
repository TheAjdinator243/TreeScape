'use client';

import { StayCalendar } from '@/components/booking/StayCalendar';
import { scrollToSummary, useStayForm } from '@/components/booking/useStayForm';
import { useI18n } from '@/components/i18n/LocaleProvider';
import { CountTo } from '@/components/motion/CountTo';
import { LineReveal } from '@/components/motion/LineReveal';
import { Reveal } from '@/components/motion/Reveal';
import { daysBetween, formatLong } from '@/lib/dates';
import { count } from '@/lib/i18n';
import { WEEKEND_PERIOD, formatMoney } from '@/lib/pricing';
import type { BookingContext } from '@/lib/types';

/**
 * Rezervacija u "plus" izgledu.
 *
 * Ovdje je SAMO izgled. Stanje, cijena, provjere i slanje žive u `useStayForm`,
 * koji dijele sve tri verzije sajta — pa se ne može desiti da jedna prima
 * termin koji druga odbija, ni da se ispravka provjere popravi samo na jednom
 * mjestu.
 *
 * Isto vrijedi i za kalendar: `StayCalendar` je zajednički, a boje mu daje
 * `.plus .rdp-root` blok u `globals.css`. Nijedan piksel kalendara nije
 * prepisan.
 */
export function PlusBooking({ context }: { context: BookingContext }) {
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
    <section id="rezervacija" className="border-y border-paper-200 bg-paper-100">
      <div className="plus-section">
        <Reveal>
          <p className="plus-eyebrow">{t.nav.book}</p>
        </Reveal>
        <LineReveal as="h2" className="plus-title" text={t.booking.heading} />
        <LineReveal as="p" className="plus-lead" text={t.booking.lead} delay={120} stagger={70} />

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
          {/* ── Kalendar ── */}
          <Reveal className="plus-card p-4 sm:p-8">
            {/* Forma desno je znatno viša od kalendara. Bez ovoga bi kalendar
                ostao gore, a ispod njega bi zjapilo pola ekrana praznine —
                ovako prati gosta dok popunjava podatke. */}
            <div className="lg:sticky lg:top-28">
              <h3
                className="mb-6 text-center text-2xl text-pine-900"
                style={{ fontFamily: 'var(--font-plus-display)' }}
              >
                {t.booking.pickDates}
              </h3>
              <StayCalendar
                slots={slots}
                range={range}
                onRangeChange={form.setRange}
                maxNights={settings.max_nights}
              />
            </div>
          </Reveal>

          {/* ── Sažetak i forma ── */}
          {/* Sažetak je viša od dvije kolone, pa on stoji, a kalendar pored
              njega prati gosta (`lg:sticky` iznad). Da su obje ljepljive,
              tukle bi se za isti vrh ekrana. */}
          <Reveal delay={100}>
            {/* `id` je meta za dugme iz donje trake na mobitelu — gost je već
                odabrao datum, pa ga vodimo pravo na pregled i formu, a ne na
                vrh kalendara koji je upravo popunio.

                Bez `scroll-mt-*`: globalni `scroll-padding-top: 5rem` u
                globals.css već sklanja fiksnu navigaciju. Da su oba, razmak bi
                se udvostručio i pregled bi pao predaleko od vrha. */}
            <div id="pregled" className="plus-card p-6 sm:p-7">
              <h3
                className="text-2xl text-pine-900"
                style={{ fontFamily: 'var(--font-plus-display)' }}
              >
                {t.booking.summaryTitle}
              </h3>

              <dl className="mt-6 space-y-3 text-sm">
                <Row
                  label={t.booking.checkIn}
                  value={start ? formatLong(start, locale) : null}
                  empty={t.booking.notSelected}
                />
                <Row
                  label={t.booking.checkOut}
                  value={end ? formatLong(end, locale) : null}
                  empty={t.booking.notSelected}
                />
              </dl>

              {/* Vremena prijave i odjave dolaze iz postavki — ista ona koja
                  vlasnik mijenja u administraciji. Ovdje stoje da gost odmah
                  vidi zašto dan odlaska jednog i dan dolaska drugog gosta mogu
                  biti isti dan. */}
              <p className="mt-4 text-xs leading-relaxed text-pine-900/50">
                {t.booking.timesNote(settings.checkin_time, settings.checkout_time)}
              </p>

              {singleDay && (
                <p className="mt-4 rounded-xl bg-sage-100 px-4 py-3 text-xs leading-relaxed text-pine-800">
                  {t.booking.singleDayNote}
                </p>
              )}

              {!range?.from && (
                <p className="mt-4 text-xs text-pine-900/50">{t.booking.singleDayHint}</p>
              )}

              {range?.from && (
                <button
                  type="button"
                  onClick={form.clearRange}
                  className="mt-4 text-xs font-semibold text-clay-500 underline underline-offset-4 transition-colors hover:text-clay-600"
                >
                  {t.booking.clearDates}
                </button>
              )}

              {quote && (
                <div className="plus-summary-in mt-6 border-t border-paper-200 pt-6">
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-pine-900/60">
                      {t.booking.daysLabel(quote.dayCount)} ×{' '}
                      {formatMoney(quote.averageDailyCents, quote.currencySymbol, locale)}
                    </span>
                    <span className="tabular-nums text-pine-900">
                      {formatMoney(quote.totalCents, quote.currencySymbol, locale)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-paper-200 pt-4">
                    <span className="plus-sans text-xs font-semibold uppercase tracking-[0.14em] text-pine-900/60">
                      {t.booking.total}
                    </span>
                    {/*
                     * Ukupna cijena se PRETAČE sa stare na novu, umjesto da
                     * skoči. Gost dodirne još jednu noć i vidi kako iznos ide
                     * gore — veza između poteza i broja je time očigledna, a
                     * ne nešto što treba primijetiti.
                     *
                     * Pretače se samo velik iznos na dnu. Da se pretaču svi
                     * brojevi u pregledu, tri stvari bi se mrdale odjednom i
                     * nijedna ne bi ništa značila.
                     */}
                    <span
                      className="text-3xl tabular-nums text-pine-800"
                      style={{ fontFamily: 'var(--font-plus-display)' }}
                    >
                      <CountTo
                        value={quote.totalCents}
                        format={(cents) => formatMoney(cents, quote.currencySymbol, locale)}
                      />
                    </span>
                  </div>

                  {/* Ako svi dani nisu iste cijene, gost zaslužuje objašnjenje —
                      i to ono pravo: vikend i sezona nisu isti razlog. */}
                  {new Set(quote.days.map((d) => d.cents)).size > 1 && (
                    <p className="mt-2 text-xs text-pine-900/50">
                      {quote.days.some((d) => d.periodName === WEEKEND_PERIOD)
                        ? t.booking.weekendNote
                        : t.booking.seasonalNote}
                    </p>
                  )}
                </div>
              )}

              {/* ── Podaci gosta ── */}
              <div className="mt-6 space-y-4 border-t border-paper-200 pt-6">
                <div>
                  <label htmlFor="plus-guests" className="plus-label">
                    {t.booking.guests}
                  </label>
                  <select
                    id="plus-guests"
                    value={guests}
                    onChange={(e) => form.setGuests(Number(e.target.value))}
                    className="plus-field"
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
                  id="plus-name"
                  label={t.booking.name}
                  value={name}
                  onChange={form.setName}
                  placeholder={t.booking.namePlaceholder}
                  autoComplete="name"
                  disabled={busy}
                />
                <Field
                  id="plus-email"
                  label={t.booking.email}
                  type="email"
                  value={email}
                  onChange={form.setEmail}
                  placeholder={t.booking.emailPlaceholder}
                  autoComplete="email"
                  disabled={busy}
                />
                <Field
                  id="plus-phone"
                  label={t.booking.phone}
                  type="tel"
                  value={phone}
                  onChange={form.setPhone}
                  placeholder={t.booking.phonePlaceholder}
                  autoComplete="tel"
                  disabled={busy}
                />

                <div>
                  <label htmlFor="plus-note" className="plus-label">
                    {t.booking.note}{' '}
                    <span className="font-normal normal-case tracking-normal text-pine-900/45">
                      ({t.booking.optional})
                    </span>
                  </label>
                  <textarea
                    id="plus-note"
                    value={note}
                    onChange={(e) => form.setNote(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder={t.booking.notePlaceholder}
                    className="plus-field resize-none"
                    disabled={busy}
                  />
                </div>
              </div>

              {/* ── Način plaćanja ── */}
              <fieldset className="mt-6 border-t border-paper-200 pt-6">
                <legend className="sr-only">{t.booking.payMethodTitle}</legend>
                <p className="plus-label">{t.booking.payMethodTitle}</p>

                <div className="space-y-2.5">
                  {paymentMethods.map((id) => {
                    const copy = methodCopy[id];
                    if (!copy) return null;
                    const selected = method === id;

                    return (
                      <label
                        key={id}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-[background-color,border-color,box-shadow] duration-300 ${
                          selected
                            ? 'border-pine-600 bg-sage-100/50 ring-4 ring-pine-600/10'
                            : 'border-paper-300 hover:border-pine-600/40'
                        } ${busy ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <input
                          type="radio"
                          name="plus_payment_method"
                          value={id}
                          checked={selected}
                          disabled={busy}
                          onChange={() => form.setMethod(id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-pine-700"
                        />
                        <span className="min-w-0">
                          <span
                            className={`block text-sm font-semibold ${
                              id === 'test' ? 'text-clay-600' : 'text-pine-900'
                            }`}
                          >
                            {copy.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-pine-900/60">
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
                  className="animate-fade-rise mt-5 rounded-xl border border-danger-600/25 bg-danger-600/5 px-4 py-3 text-sm text-danger-600"
                >
                  {error ?? stayError}
                </p>
              )}

              {/* Dok se šalje, preko dugmeta prelazi odsjaj. Kotur pored
                  teksta kaže da se nešto dešava, ali stoji u mjestu; odsjaj
                  preko cijele širine pokazuje da to još TRAJE. */}
              <button
                type="button"
                onClick={() => void form.submit()}
                disabled={busy || paymentMethods.length === 0}
                className={`plus-btn-accent mt-6 w-full py-4 ${
                  busy ? 'plus-btn-busy relative overflow-hidden' : ''
                }`}
              >
                {busy && <Spinner />}
                {busy ? t.booking.submitting : t.booking.reserve}
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Na mobitelu sažetak cijene prati gosta dok bira datume. */}
      {quote && !stayError && (
        <div className="animate-fade-rise fixed inset-x-0 bottom-0 z-30 border-t border-paper-200 bg-paper-50/95 px-5 py-3 shadow-raise backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-pine-900/60">
                {start && end ? count(locale, daysBetween(start, end), t.common.days) : ''}
              </p>
              <p
                className="text-xl tabular-nums text-pine-800"
                style={{ fontFamily: 'var(--font-plus-display)' }}
              >
                <CountTo
                  value={quote.totalCents}
                  format={(cents) => formatMoney(cents, quote.currencySymbol, locale)}
                />
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToSummary}
              className="plus-btn-primary shrink-0 px-5 py-2.5"
            >
              {t.nav.book}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, value, empty }: { label: string; value: string | null; empty: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-pine-900/60">{label}</dt>
      <dd className="text-end font-medium text-pine-900">
        {/*
         * `key` je sam datum, pa React pri promjeni ne prepiše tekst nego
         * napravi NOVI element — a time se CSS animacija upali iznova. Bez
         * njega bi se datum tiho zamijenio i gost ne bi bio siguran je li
         * dodir uopće primljen.
         */}
        <span key={value ?? 'prazno'} className="plus-value-swap">
          {value ?? <span className="font-normal text-pine-900/40">{empty}</span>}
        </span>
      </dd>
    </div>
  );
}

/**
 * Kotur koji se vrti dok se rezervacija šalje.
 *
 * Bez njega dugme samo promijeni tekst, pa gost na sporoj vezi ne zna je li
 * klik uopće primljen i klikne ponovo. `aria-hidden` jer promjenu stanja već
 * javlja sam tekst dugmeta.
 */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
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
      <label htmlFor={id} className="plus-label">
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
        className="plus-field"
      />
    </div>
  );
}
