'use client';

import { useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { formatDateTime } from '@/lib/dates';
import { formatMoney } from '@/lib/pricing';
import type { TransferInstructions } from '@/lib/payments';

/**
 * Podaci za uplatu na račun.
 *
 * IBAN i poziv na broj se prepisuju u aplikaciju banke, pa svaki ima dugme
 * za kopiranje — prekucavanje IBAN-a s ekrana je najčešći izvor grešaka.
 */
export function TransferDetails({ data }: { data: TransferInstructions }) {
  const { locale, t } = useI18n();

  return (
    <div className="mt-8 rounded-2xl border border-forest-600/25 bg-forest-700/5 p-5 sm:p-6">
      <h2 className="font-display text-lg text-forest-900">{t.confirmation.transferHeading}</h2>

      <dl className="mt-4 space-y-1">
        <Row label={t.confirmation.transferRecipient} value={data.accountName} />
        {data.bankName && <Row label={t.confirmation.transferBank} value={data.bankName} />}
        <Row label={t.confirmation.transferIban} value={data.iban} mono copyable />
        <Row label={t.confirmation.transferReference} value={data.reference} mono copyable />
        <Row
          label={t.confirmation.transferAmount}
          value={formatMoney(data.amountCents, data.currencySymbol, locale)}
          strong
        />
        {data.deadline && (
          <Row
            label={t.confirmation.transferDeadline}
            value={formatDateTime(data.deadline, locale)}
          />
        )}
      </dl>

      <p className="mt-5 border-t border-forest-600/15 pt-4 text-xs leading-relaxed text-ink-500">
        {t.confirmation.transferNote}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  strong,
  copyable,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
  copyable?: boolean;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Neki preglednici brane pristup međuspremniku bez HTTPS-a —
      // vrijednost je ionako vidljiva i može se označiti mišem.
    }
  }

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="flex items-center gap-2">
        <span
          dir={mono ? 'ltr' : undefined}
          className={[
            'text-end',
            mono ? 'font-mono tracking-wide' : '',
            strong ? 'font-display text-xl text-forest-800' : 'text-sm font-medium text-ink-900',
          ].join(' ')}
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={() => void copy()}
            className="shrink-0 rounded-lg border border-sand-300 bg-white px-2 py-1 text-xs font-medium text-forest-700 transition-colors hover:border-forest-600 hover:text-forest-800"
          >
            {copied ? t.confirmation.copied : t.confirmation.copy}
          </button>
        )}
      </dd>
    </div>
  );
}
