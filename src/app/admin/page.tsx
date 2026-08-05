import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { AdminGate } from '@/components/admin/AdminGate';
import { Dashboard } from '@/components/admin/Dashboard';
import { ADMIN_COOKIE, isValidSession } from '@/lib/admin-auth';
import { listBookings } from '@/lib/booking-service';
import { getRatePeriods, getSettings } from '@/lib/data';
import { env, isDatabaseConfigured } from '@/lib/env';
import { t } from '@/lib/strings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: t.admin.title,
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authorized = await isValidSession(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!authorized) {
    return <AdminGate configured={Boolean(env.admin.accessCode && env.admin.sessionSecret)} />;
  }

  if (!isDatabaseConfigured) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24">
        <h1 className="font-display text-3xl text-forest-900">{t.admin.title}</h1>
        <p className="mt-4 rounded-xl border border-warn-600/25 bg-warn-600/5 px-5 py-4 text-sm leading-relaxed text-warn-600">
          Baza nije podešena, pa nema šta prikazati. Dodaj Supabase ključeve u{' '}
          <code className="rounded bg-sand-200 px-1.5 py-0.5 text-ink-900">.env.local</code> i
          pokreni migraciju iz{' '}
          <code className="rounded bg-sand-200 px-1.5 py-0.5 text-ink-900">
            supabase/migrations
          </code>
          .
        </p>
      </main>
    );
  }

  const [bookings, periods, settings] = await Promise.all([
    listBookings(),
    getRatePeriods(),
    getSettings(),
  ]);

  return <Dashboard bookings={bookings} periods={periods} settings={settings} />;
}
