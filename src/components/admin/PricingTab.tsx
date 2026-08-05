'use client';

import { useState } from 'react';

import { formatNumeric, todayStr } from '@/lib/dates';
import { formatMoney } from '@/lib/pricing';
import { t } from '@/lib/strings';
import type { RatePeriod, Settings } from '@/lib/types';

/**
 * Cijene se u bazi drže u centima (12000 = 120,00 €) da se izbjegne
 * zaokruživanje decimalnih brojeva. Vlasniku prikazujemo normalne iznose i
 * pretvaramo ih tek pri slanju.
 */
const toMajor = (cents: number) => String(cents / 100);
const toCents = (major: string) => Math.round(Number(major.replace(',', '.')) * 100);

export function PricingTab({
  settings,
  periods,
  onCall,
}: {
  settings: Settings;
  periods: RatePeriod[];
  onCall: (url: string, init: RequestInit) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    default_nightly: toMajor(settings.default_nightly_cents),
    cleaning_fee: toMajor(settings.cleaning_fee_cents),
    min_nights: String(settings.min_nights),
    max_nights: String(settings.max_nights),
    max_guests: String(settings.max_guests),
    hold_minutes: String(settings.hold_minutes),
    currency: settings.currency,
    currency_symbol: settings.currency_symbol,
    checkin_time: settings.checkin_time,
    checkout_time: settings.checkout_time,
    bank_account_name: settings.bank_account_name,
    bank_name: settings.bank_name,
    bank_iban: settings.bank_iban,
    transfer_days: String(settings.transfer_days),
  });
  const [saved, setSaved] = useState(false);

  const [season, setSeason] = useState({
    name: '',
    start_date: '',
    end_date: '',
    price: '',
    min_nights: '',
    priority: '10',
  });

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);

    const ok = await onCall('/api/admin/pricing', {
      method: 'PUT',
      body: JSON.stringify({
        default_nightly_cents: toCents(form.default_nightly),
        cleaning_fee_cents: toCents(form.cleaning_fee),
        min_nights: Number(form.min_nights),
        max_nights: Number(form.max_nights),
        max_guests: Number(form.max_guests),
        hold_minutes: Number(form.hold_minutes),
        currency: form.currency.toUpperCase(),
        currency_symbol: form.currency_symbol,
        checkin_time: form.checkin_time,
        checkout_time: form.checkout_time,
        bank_account_name: form.bank_account_name.trim(),
        bank_name: form.bank_name.trim(),
        // Razmaci u IBAN-u su uobičajeni pri prepisivanju, ali u bazu ide čist.
        bank_iban: form.bank_iban.replace(/\s/g, '').toUpperCase(),
        transfer_days: Number(form.transfer_days),
      }),
    });

    if (ok) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    }
  }

  async function addSeason(e: React.FormEvent) {
    e.preventDefault();

    const ok = await onCall('/api/admin/pricing', {
      method: 'POST',
      body: JSON.stringify({
        name: season.name,
        start_date: season.start_date,
        end_date: season.end_date,
        nightly_price_cents: toCents(season.price),
        min_nights: season.min_nights ? Number(season.min_nights) : null,
        priority: Number(season.priority),
      }),
    });

    if (ok) {
      setSeason({ name: '', start_date: '', end_date: '', price: '', min_nights: '', priority: '10' });
    }
  }

  async function removeSeason(id: string) {
    if (!window.confirm(t.admin.seasonDeleteConfirm)) return;
    await onCall(`/api/admin/pricing?id=${id}`, { method: 'DELETE' });
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-14">
      {/* ── Osnovne cijene ── */}
      <section>
        <h2 className="font-display text-2xl text-forest-900">{t.admin.pricingHeading}</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">{t.admin.pricingLead}</p>

        <form onSubmit={saveSettings} className="card mt-6 grid gap-5 p-6 sm:grid-cols-2">
          <Num
            id="default_nightly"
            label={`${t.admin.defaultNightly} (${settings.currency_symbol})`}
            value={form.default_nightly}
            onChange={set('default_nightly')}
            step="0.01"
          />
          <Num
            id="cleaning_fee"
            label={`${t.admin.cleaningFee} (${settings.currency_symbol})`}
            value={form.cleaning_fee}
            onChange={set('cleaning_fee')}
            step="0.01"
          />
          <Num id="min_nights" label={t.admin.minNights} value={form.min_nights} onChange={set('min_nights')} />
          <Num id="max_nights" label={t.admin.maxNights} value={form.max_nights} onChange={set('max_nights')} />
          <Num id="max_guests" label={t.admin.maxGuests} value={form.max_guests} onChange={set('max_guests')} />
          <Num
            id="hold_minutes"
            label={t.admin.holdMinutes}
            value={form.hold_minutes}
            onChange={set('hold_minutes')}
          />

          <div>
            <label htmlFor="checkin_time" className="field-label">
              Prijava od
            </label>
            <input
              id="checkin_time"
              type="time"
              value={form.checkin_time}
              onChange={set('checkin_time')}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="checkout_time" className="field-label">
              Odjava do
            </label>
            <input
              id="checkout_time"
              type="time"
              value={form.checkout_time}
              onChange={set('checkout_time')}
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="currency" className="field-label">
              Valuta (EUR, BAM…)
            </label>
            <input
              id="currency"
              type="text"
              maxLength={3}
              value={form.currency}
              onChange={set('currency')}
              className="field-input uppercase"
            />
          </div>
          <div>
            <label htmlFor="currency_symbol" className="field-label">
              Oznaka (€, KM…)
            </label>
            <input
              id="currency_symbol"
              type="text"
              maxLength={5}
              value={form.currency_symbol}
              onChange={set('currency_symbol')}
              className="field-input"
            />
          </div>

          {/* ── Bankovni podaci ── */}
          <div className="sm:col-span-2">
            <div className="mt-2 border-t border-sand-200 pt-6">
              <h3 className="font-display text-lg text-forest-900">{t.admin.bankHeading}</h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500">
                {t.admin.bankLead}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="bank_account_name" className="field-label">
              {t.admin.bankAccountName}
            </label>
            <input
              id="bank_account_name"
              type="text"
              value={form.bank_account_name}
              onChange={set('bank_account_name')}
              placeholder="Ime i prezime ili naziv firme"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="bank_name" className="field-label">
              {t.admin.bankName}
            </label>
            <input
              id="bank_name"
              type="text"
              value={form.bank_name}
              onChange={set('bank_name')}
              placeholder="npr. Raiffeisen Bank d.d. BiH"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="bank_iban" className="field-label">
              {t.admin.bankIban}
            </label>
            <input
              id="bank_iban"
              type="text"
              value={form.bank_iban}
              onChange={set('bank_iban')}
              placeholder="BA39 1234 5678 9012 3456"
              className="field-input font-mono"
            />
            <p className="mt-1.5 text-xs text-ink-400">
              Ostavi prazno da se plaćanje na račun uopšte ne nudi gostima.
            </p>
          </div>
          <Num
            id="transfer_days"
            label={t.admin.transferDays}
            value={form.transfer_days}
            onChange={set('transfer_days')}
          />

          <div className="flex items-center gap-4 sm:col-span-2">
            <button type="submit" className="btn-primary px-6 py-2.5 text-xs">
              {t.admin.save}
            </button>
            {saved && <span className="text-sm text-success-600">{t.admin.saved}</span>}
          </div>
        </form>
      </section>

      {/* ── Sezone ── */}
      <section>
        <h2 className="font-display text-2xl text-forest-900">{t.admin.seasonsHeading}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          {t.admin.seasonsLead}
        </p>

        {periods.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-sand-300 px-6 py-10 text-center text-sm text-ink-400">
            {t.admin.seasonsEmpty}
          </p>
        ) : (
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-sand-200 text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">{t.admin.seasonName}</th>
                  <th className="px-5 py-3 font-medium">Period</th>
                  <th className="px-5 py-3 text-right font-medium">{t.admin.seasonPrice}</th>
                  <th className="px-5 py-3 text-right font-medium">Min.</th>
                  <th className="px-5 py-3 text-right font-medium">{t.admin.seasonPriority}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td className="px-5 py-3.5 font-medium text-ink-900">{period.name}</td>
                    <td className="px-5 py-3.5 text-ink-500">
                      {formatNumeric(period.start_date)} – {formatNumeric(period.end_date)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink-900">
                      {formatMoney(period.nightly_price_cents, settings.currency_symbol)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-ink-500">
                      {period.min_nights ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-ink-500">{period.priority}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => void removeSeason(period.id)}
                        className="text-xs font-medium text-danger-600 underline underline-offset-4"
                      >
                        {t.admin.seasonDelete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={addSeason} className="card mt-6 grid gap-4 p-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <label htmlFor="season-name" className="field-label">
              {t.admin.seasonName}
            </label>
            <input
              id="season-name"
              type="text"
              required
              value={season.name}
              onChange={(e) => setSeason((s) => ({ ...s, name: e.target.value }))}
              placeholder="npr. Ljetna sezona 2027"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="season-start" className="field-label">
              {t.admin.seasonFrom}
            </label>
            <input
              id="season-start"
              type="date"
              required
              value={season.start_date}
              onChange={(e) => setSeason((s) => ({ ...s, start_date: e.target.value }))}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="season-end" className="field-label">
              {t.admin.seasonTo} <span className="font-normal text-ink-400">(ne uključuje se)</span>
            </label>
            <input
              id="season-end"
              type="date"
              required
              min={season.start_date || todayStr()}
              value={season.end_date}
              onChange={(e) => setSeason((s) => ({ ...s, end_date: e.target.value }))}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="season-price" className="field-label">
              {t.admin.seasonPrice} ({settings.currency_symbol})
            </label>
            <input
              id="season-price"
              type="number"
              required
              min="0"
              step="0.01"
              value={season.price}
              onChange={(e) => setSeason((s) => ({ ...s, price: e.target.value }))}
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="season-min" className="field-label">
              {t.admin.seasonMinNights} <span className="font-normal text-ink-400">(opcionalno)</span>
            </label>
            <input
              id="season-min"
              type="number"
              min="1"
              value={season.min_nights}
              onChange={(e) => setSeason((s) => ({ ...s, min_nights: e.target.value }))}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="season-priority" className="field-label">
              {t.admin.seasonPriority}
            </label>
            <input
              id="season-priority"
              type="number"
              required
              min="0"
              value={season.priority}
              onChange={(e) => setSeason((s) => ({ ...s, priority: e.target.value }))}
              className="field-input"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full py-2.5 text-xs">
              {t.admin.seasonAdd}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Num({
  id,
  label,
  value,
  onChange,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type="number"
        required
        min="0"
        step={step ?? '1'}
        value={value}
        onChange={onChange}
        className="field-input"
      />
    </div>
  );
}
