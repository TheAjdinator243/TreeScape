'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { t } from '@/lib/strings';

/**
 * Ulaz u administraciju.
 *
 * Namjerno gola stranica — bez logotipa, bez linka sa javnog sajta, bez
 * ijedne naznake šta se iza nje krije. Kod se provjerava na serveru; ovdje
 * se nigdje ne čuva.
 */
export function AdminGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        setCode('');
        router.refresh();
        return;
      }

      const data = (await res.json()) as { error?: string };
      setError(data.error ?? t.admin.gateWrong);
    } catch {
      setError(t.errors.SERVER_ERROR);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-forest-900 px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl text-sand-50">{t.admin.gateTitle}</h1>
        <p className="mt-2 text-sm text-moss-300/80">{t.admin.gateLead}</p>

        {!configured ? (
          <p className="mt-6 rounded-xl border border-warn-600/30 bg-warn-600/10 px-4 py-3 text-sm leading-relaxed text-warn-600">
            Administracija nije podešena. Postavi <code>ADMIN_ACCESS_CODE</code> i{' '}
            <code>ADMIN_SESSION_SECRET</code> u <code>.env.local</code>.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6">
            <label htmlFor="code" className="sr-only">
              {t.admin.gateCode}
            </label>
            <input
              id="code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoFocus
              disabled={busy}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-forest-700 bg-forest-800 px-4 py-3 text-center font-mono tracking-widest text-sand-50 placeholder:text-forest-600 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-400/30"
            />

            {error && (
              <p role="alert" className="mt-3 text-center text-sm text-ember-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || code.length === 0}
              className="btn mt-4 w-full bg-moss-400 text-forest-900 hover:bg-moss-300"
            >
              {busy ? t.common.loading : t.admin.gateSubmit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
