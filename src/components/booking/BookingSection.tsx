'use client';

import { useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHead } from '@/components/site/SectionHead';
import { daysBetween, formatLong } from '@/lib/dates';
import { count, type Dictionary } from '@/lib/i18n';
import { WEEKEND_PERIOD, formatMoney } from '@/lib/pricing';
import type { BookingContext } from '@/lib/types';

import { StayCalendar } from './StayCalendar';
import { guestDetailsError, scrollToCard, useStayForm, type StayForm } from './useStayForm';

/** Redoslijed koraka. Indeks je ujedno i broj koji gost vidi u traci. */
const STEPS = ['dates', 'details', 'review'] as const;
type Step = 0 | 1 | 2;

/**
 * Rezervacija u tri koraka: datumi → podaci → pregled.
 *
 * Prije je sve stajalo na jednom ekranu: kalendar lijevo, a desno sažetak,
 * osam polja i tri načina plaćanja jedno ispod drugog. Gost bi odabrao datum i
 * odmah vidio zid koji mora popuniti — a polovina toga (ime, mail, plaćanje)
 * uopće nema smisla dok se ne zna da je termin slobodan.
 *
 * Ovako se u svakom trenutku traži jedna stvar. Cijena se pojavi čim su datumi
 * odabrani i ostaje vidljiva do kraja, jer je ona jedini razlog zbog kojeg bi
 * se gost predomislio.
 *
 * Naprijed se ne može preskočiti: iz datuma se izlazi tek kad je termin
 * stvarno slobodan, a iz podataka tek kad su popunjeni. Nazad se može uvijek,
 * i to i klikom na već pređeni korak u traci — gost se vraća da ispravi mail
 * češće nego što se čini.
 *
 * Stanje i provjere i dalje žive u `useStayForm`; ovdje je samo redoslijed.
 */
export function BookingSection({ context }: { context: BookingContext }) {
  const { locale, t } = useI18n();
  const { paymentMethods } = context;

  const form = useStayForm(context);
  const [step, setStep] = useState<Step>(0);
  // Smjer zadnjeg kretanja — po njemu CSS zna s koje strane uvodi novi korak.
  const [back, setBack] = useState(false);
  /*
   * Je li gost već pokušao ići dalje.
   *
   * Pamti se SAMO to, a ne i sama poruka. Da se pamtila poruka, ostala bi na
   * ekranu i nakon što gost ispravi ono na šta se odnosi — pisalo bi "prvo
   * odaberite datum" ispod već odabranog datuma. Ovako se prigovor računa
   * iznova pri svakom iscrtavanju, pa nestane u istom trenutku u kojem razlog
   * za njega prestane postojati.
   */
  const [tried, setTried] = useState(false);

  const datesProblem = !form.complete ? t.booking.selectDatesFirst : form.stayError;
  const detailsProblem = guestDetailsError(form, t);
  const problemOf = (from: Step) => (from === 0 ? datesProblem : from === 1 ? detailsProblem : null);

  const goTo = (next: Step) => {
    setBack(next < step);
    setTried(false);
    setStep(next);
  };

  const goNext = () => {
    if (problemOf(step)) {
      setTried(true);
      return;
    }
    goTo(Math.min(step + 1, 2) as Step);
  };

  const blocked = tried ? problemOf(step) : null;

  return (
    <section id="rezervacija" className="bg-cream-100">
      <div className="section">
        <SectionHead index={4} label={t.nav.book} title={t.booking.heading} lead={t.booking.lead} />

        <Reveal delay={80} className="mt-14">
          <div className="card mx-auto max-w-3xl p-5 sm:p-8">
            <Rail step={step} onGo={goTo} blockedBy={problemOf} t={t} />

            {/* `key` je ovdje cijeli posao: kad se korak promijeni, React pravi
                NOVI element umjesto da mijenja sadržaj starog, pa animacija
                ulaska krene ispočetka. */}
            <div
              key={step}
              data-dir={back ? 'back' : 'fwd'}
              className="animate-step-in mt-8"
              aria-live="polite"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                {t.booking.steps.counter(step + 1, STEPS.length)}
              </p>
              <h3 className="mt-2 font-display text-2xl text-coal-900 md:text-3xl">
                {t.booking.steps[STEPS[step] ?? 'dates']}
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-500">
                {step === 0
                  ? t.booking.steps.datesLead
                  : step === 1
                    ? t.booking.steps.detailsLead
                    : t.booking.steps.reviewLead}
              </p>

              <div className="mt-7">
                {step === 0 && <DatesStep form={form} context={context} />}
                {step === 1 && <DetailsStep form={form} context={context} />}
                {step === 2 && <ReviewStep form={form} context={context} onEdit={goTo} />}
              </div>
            </div>

            {/* Cijena stoji na dnu kartice kroz sva tri koraka, a ne samo u
                pregledu: gost koji u drugom koraku vidi iznos ne mora se vraćati
                da provjeri šta je ono odabrao. */}
            {form.quote && !form.stayError && (
              <div className="mt-8 flex items-baseline justify-between gap-4 border-t border-cream-200 pt-5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  {t.booking.total}
                </span>
                <span
                  key={form.quote.totalCents}
                  className="animate-value-swap font-display text-3xl leading-none text-olive-700"
                >
                  {formatMoney(form.quote.totalCents, form.quote.currencySymbol, locale)}
                </span>
              </div>
            )}

            {(blocked ?? form.error) && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-danger-600/25 bg-danger-600/5 px-4 py-3 text-sm text-danger-600"
              >
                {blocked ?? form.error}
              </p>
            )}

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-cream-200 pt-6">
              <button
                type="button"
                onClick={() => goTo(Math.max(step - 1, 0) as Step)}
                disabled={step === 0 || form.busy}
                className="btn-ghost px-6 py-3 disabled:invisible"
              >
                <Arrow back />
                {t.booking.steps.back}
              </button>

              {step < 2 ? (
                <button type="button" onClick={goNext} className="btn-accent">
                  {t.booking.steps.next}
                  <Arrow />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void form.submit()}
                  disabled={form.busy || paymentMethods.length === 0}
                  className="btn-accent"
                >
                  {form.busy ? t.booking.submitting : t.booking.reserve}
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Na telefonu cijena prati gosta dok bira datume — kartica je duga, a
          iznos je pri njenom dnu. */}
      {form.quote && !form.stayError && step === 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-200 bg-white/95 px-5 py-3 shadow-lift backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[0.7rem] uppercase tracking-[0.14em] text-ink-400">
                {form.start && form.end
                  ? count(locale, daysBetween(form.start, form.end), t.common.days)
                  : ''}
              </p>
              <p
                key={form.quote.totalCents}
                className="animate-value-swap font-display text-xl text-olive-700"
              >
                {formatMoney(form.quote.totalCents, form.quote.currencySymbol, locale)}
              </p>
            </div>
            {/* Vodi na sljedeći korak i vraća pogled na karticu — kalendar je
                na telefonu dug, pa je dugme obično daleko ispod nje. */}
            <button
              type="button"
              onClick={() => {
                goNext();
                scrollToCard();
              }}
              className="btn-primary shrink-0 px-6 py-2.5"
            >
              {t.booking.steps.next}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Traka koraka ─────────────────────────────────────────────────────────── */

function Rail({
  step,
  onGo,
  blockedBy,
  t,
}: {
  step: Step;
  onGo: (next: Step) => void;
  /** Šta sprečava izlazak iz datog koraka — po tome se zna smije li se skočiti. */
  blockedBy: (from: Step) => string | null;
  t: Dictionary;
}) {
  return (
    <div className="rail" role="list">
      {STEPS.map((key, i) => {
        const index = i as Step;
        const state = index === step ? 'active' : index < step ? 'done' : 'todo';

        // Naprijed se skače samo preko koraka koji su ISPRAVNO popunjeni — ista
        // provjera kao i za dugme "Dalje", pa traka ne može zaobići pravilo.
        const reachable =
          index <= step ||
          Array.from({ length: index }, (_, k) => blockedBy(k as Step)).every((p) => p === null);

        return (
          <div key={key} role="listitem" className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              data-state={state}
              onClick={() => reachable && onGo(index)}
              disabled={!reachable || index === step}
              aria-current={index === step ? 'step' : undefined}
              className={`rail-step ${reachable && index !== step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="rail-dot" aria-hidden="true">
                {state === 'done' ? <Tick /> : String(i + 1).padStart(2, '0')}
              </span>
              <span className="rail-name hidden sm:inline">{t.booking.steps[key]}</span>
            </button>

            {i < STEPS.length - 1 && (
              <span
                className="rail-line"
                style={{ '--done': index < step ? 1 : 0 } as React.CSSProperties}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Korak 1: datumi ──────────────────────────────────────────────────────── */

function DatesStep({ form, context }: { form: StayForm; context: BookingContext }) {
  const { locale, t } = useI18n();
  const { settings } = context;

  return (
    <>
      <StayCalendar
        slots={form.slots}
        range={form.range}
        onRangeChange={form.setRange}
        maxNights={settings.max_nights}
      />

      <div className="mt-7 border-t border-cream-200 pt-5">
        <dl className="space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-500">{t.booking.checkIn}</dt>
            <dd className="text-end font-medium text-ink-900">
              {form.start ? (
                formatLong(form.start, locale)
              ) : (
                <span className="text-ink-400">{t.booking.notSelected}</span>
              )}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-500">{t.booking.checkOut}</dt>
            <dd className="text-end font-medium text-ink-900">
              {form.end ? (
                formatLong(form.end, locale)
              ) : (
                <span className="text-ink-400">{t.booking.notSelected}</span>
              )}
            </dd>
          </div>
        </dl>

        {/* Vremena prijave i odjave dolaze iz postavki — ista ona koja vlasnik
            mijenja u administraciji. Ovdje stoje da gost odmah vidi zašto dan
            odlaska jednog i dan dolaska drugog gosta mogu biti isti dan. */}
        <p className="mt-3 text-xs text-ink-400">
          {t.booking.timesNote(settings.checkin_time, settings.checkout_time)}
        </p>

        {form.singleDay && (
          <p className="mt-3 rounded-md bg-olive-200 px-3 py-2 text-xs text-olive-700">
            {t.booking.singleDayNote}
          </p>
        )}

        {!form.range?.from && <p className="mt-3 text-xs text-ink-400">{t.booking.singleDayHint}</p>}

        {form.range?.from && (
          <button
            type="button"
            onClick={form.clearRange}
            className="mt-3 text-xs font-medium text-olive-600 underline underline-offset-4 hover:text-coal-900"
          >
            {t.booking.clearDates}
          </button>
        )}

        {/* Ako svi dani nisu iste cijene, gost zaslužuje objašnjenje — i to ono
            pravo: vikend i sezona nisu isti razlog. */}
        {form.quote && new Set(form.quote.days.map((d) => d.cents)).size > 1 && (
          <p className="mt-3 text-xs text-ink-400">
            {form.quote.days.some((d) => d.periodName === WEEKEND_PERIOD)
              ? t.booking.weekendNote
              : t.booking.seasonalNote}
          </p>
        )}
      </div>
    </>
  );
}

/* ── Korak 2: podaci gosta ────────────────────────────────────────────────── */

function DetailsStep({ form, context }: { form: StayForm; context: BookingContext }) {
  const { locale, t } = useI18n();
  const { settings, paymentMethods } = context;

  const methodCopy: Record<string, { label: string; hint: string }> = {
    bank_transfer: { label: t.booking.payTransfer, hint: t.booking.payTransferHint },
    cash: { label: t.booking.payCash, hint: t.booking.payCashHint },
    test: { label: t.booking.payTest, hint: t.booking.payTestHint },
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="guests" className="field-label">
            {t.booking.guests}
          </label>
          <select
            id="guests"
            value={form.guests}
            onChange={(e) => form.setGuests(Number(e.target.value))}
            className="field-input"
            disabled={form.busy}
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
          value={form.name}
          onChange={form.setName}
          placeholder={t.booking.namePlaceholder}
          autoComplete="name"
          disabled={form.busy}
        />
        <Field
          id="email"
          label={t.booking.email}
          type="email"
          value={form.email}
          onChange={form.setEmail}
          placeholder={t.booking.emailPlaceholder}
          autoComplete="email"
          disabled={form.busy}
        />
        <Field
          id="phone"
          label={t.booking.phone}
          type="tel"
          value={form.phone}
          onChange={form.setPhone}
          placeholder={t.booking.phonePlaceholder}
          autoComplete="tel"
          disabled={form.busy}
        />
      </div>

      <div>
        <label htmlFor="note" className="field-label">
          {t.booking.note} <span className="font-normal text-ink-400">({t.booking.optional})</span>
        </label>
        <textarea
          id="note"
          value={form.note}
          onChange={(e) => form.setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={t.booking.notePlaceholder}
          className="field-input resize-none"
          disabled={form.busy}
        />
      </div>

      <fieldset className="border-t border-cream-200 pt-5">
        <legend className="sr-only">{t.booking.payMethodTitle}</legend>
        <p className="field-label">{t.booking.payMethodTitle}</p>

        <div className="space-y-2.5">
          {paymentMethods.map((id) => {
            const copy = methodCopy[id];
            if (!copy) return null;
            const selected = form.method === id;

            return (
              <label
                key={id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-[border-color,background-color,box-shadow] duration-300 ${
                  selected
                    ? 'border-olive-600 bg-olive-600/5 shadow-[0_0_0_4px_rgb(110_127_82/0.12)]'
                    : 'border-cream-300 hover:border-olive-600/45'
                } ${form.busy ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={id}
                  checked={selected}
                  disabled={form.busy}
                  onChange={() => form.setMethod(id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-olive-600"
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
    </div>
  );
}

/* ── Korak 3: pregled ─────────────────────────────────────────────────────── */

function ReviewStep({
  form,
  context,
  onEdit,
}: {
  form: StayForm;
  context: BookingContext;
  onEdit: (step: Step) => void;
}) {
  const { locale, t } = useI18n();
  const { settings } = context;

  // Namjerno `Record<string, string>`, a ne po tipu `PaymentMethod`: taj tip
  // poznaje i načine koje sajt nikad ne nudi gostu (`card`, `none`), pa bi
  // potpuna mapa tražila natpise za nešto što se ne može ni odabrati.
  const methodLabel: Record<string, string> = {
    bank_transfer: t.booking.payTransfer,
    cash: t.booking.payCash,
    test: t.booking.payTest,
  };

  return (
    <div className="space-y-8">
      <ReviewGroup title={t.booking.steps.dates} onEdit={() => onEdit(0)} label={t.booking.steps.edit}>
        <Row label={t.booking.checkIn} value={form.start ? formatLong(form.start, locale) : '—'} />
        <Row label={t.booking.checkOut} value={form.end ? formatLong(form.end, locale) : '—'} />
        {form.quote && (
          <Row
            label={`${t.booking.daysLabel(form.quote.dayCount)} × ${formatMoney(
              form.quote.averageDailyCents,
              form.quote.currencySymbol,
              locale
            )}`}
            value={formatMoney(form.quote.totalCents, form.quote.currencySymbol, locale)}
          />
        )}
        <Row
          label={t.booking.checkIn + ' / ' + t.booking.checkOut}
          value={`${settings.checkin_time} / ${settings.checkout_time}`}
        />
      </ReviewGroup>

      <ReviewGroup
        title={t.booking.steps.details}
        onEdit={() => onEdit(1)}
        label={t.booking.steps.edit}
      >
        <Row label={t.booking.guests} value={count(locale, form.guests, t.common.guests)} />
        <Row label={t.booking.name} value={form.name.trim() || '—'} />
        <Row label={t.booking.email} value={form.email.trim() || '—'} />
        <Row label={t.booking.phone} value={form.phone.trim() || '—'} />
        {form.note.trim() && <Row label={t.booking.note} value={form.note.trim()} />}
        <Row
          label={t.booking.payMethodTitle}
          value={(form.method && methodLabel[form.method]) || '—'}
        />
      </ReviewGroup>
    </div>
  );
}

function ReviewGroup({
  title,
  onEdit,
  label,
  children,
}: {
  title: string;
  onEdit: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{title}</h4>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-olive-600 underline underline-offset-4 hover:text-coal-900"
        >
          {label}
        </button>
      </div>
      <dl className="mt-3 border-t border-cream-200">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-row">
      <dt className="shrink-0 text-sm text-ink-500">{label}</dt>
      <dd className="min-w-0 break-words text-end text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}

/* ── Sitnice ──────────────────────────────────────────────────────────────── */

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

/** Strelica se okreće uz smjer pisanja — `rtl:rotate-180` radi oba jezika. */
function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="rtl:rotate-180"
    >
      <path
        d={back ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tick() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
