'use client';

import { DayPicker, type DateRange } from 'react-day-picker';
import { bs } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

import { fromDateStr, todayStr, type DateStr } from '@/lib/dates';
import { takenDayMap } from '@/lib/pricing';
import { t } from '@/lib/strings';
import type { AvailabilitySlot } from '@/lib/types';

export function StayCalendar({
  slots,
  range,
  onRangeChange,
  maxNights,
}: {
  slots: AvailabilitySlot[];
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  maxNights: number;
}) {
  const taken = takenDayMap(slots);

  const hardDays: Date[] = [];
  const pendingDays: Date[] = [];
  for (const [day, level] of taken) {
    (level === 'pending' ? pendingDays : hardDays).push(fromDateStr(day as DateStr));
  }

  const allTaken = [...hardDays, ...pendingDays];

  return (
    <div className="flex flex-col items-center">
      <DayPicker
        mode="range"
        locale={bs}
        selected={range}
        onSelect={onRangeChange}
        numberOfMonths={2}
        pagedNavigation
        showOutsideDays={false}
        startMonth={new Date()}
        max={maxNights}
        // Bez ovoga bi gost mogao povući raspon PREKO tuđe rezervacije.
        excludeDisabled
        disabled={[{ before: fromDateStr(todayStr()) }, ...allTaken]}
        modifiers={{ taken: hardDays, takenPending: pendingDays }}
        modifiersClassNames={{ taken: 'day-taken', takenPending: 'day-taken-pending' }}
        className="rdp-root"
        classNames={{ months: 'flex flex-col sm:flex-row gap-6 sm:gap-10' }}
      />

      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-500">
        <Legend className="border border-sand-300 bg-white" label={t.booking.legendFree} />
        <Legend className="bg-sand-200 line-through" label={t.booking.legendTaken} />
        <Legend className="bg-forest-700" label={t.booking.legendSelected} />
      </ul>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded-full ${className}`} aria-hidden="true" />
      {label}
    </li>
  );
}
