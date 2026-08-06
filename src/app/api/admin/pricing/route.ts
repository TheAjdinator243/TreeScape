import { NextResponse } from 'next/server';

import {
  describeIssues,
  invalidInput,
  readJson,
  requireDatabase,
  serverError,
} from '@/lib/api-helpers';
import { getStrings, localeFromRequest } from '@/lib/i18n';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ratePeriodSchema, settingsSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Izmjena osnovnih postavki i cijena. */
export async function PUT(request: Request) {
  const locale = localeFromRequest(request);

  const notReady = requireDatabase(locale);
  if (notReady) return notReady;

  const parsed = settingsSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput(locale, describeIssues(parsed.error));

  if (parsed.data.max_nights < parsed.data.min_nights) {
    return NextResponse.json({ error: getStrings(locale).errors.MAX_BELOW_MIN }, { status: 400 });
  }

  const { error } = await supabaseAdmin().from('settings').update(parsed.data).eq('id', 1);

  if (error) {
    console.error('[treescape] izmjena postavki nije uspjela:', error.message);
    return serverError(locale, error.message);
  }

  return NextResponse.json({ ok: true });
}

/** Dodavanje sezone. */
export async function POST(request: Request) {
  const locale = localeFromRequest(request);

  const notReady = requireDatabase(locale);
  if (notReady) return notReady;

  const parsed = ratePeriodSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput(locale, describeIssues(parsed.error));

  if (parsed.data.end_date <= parsed.data.start_date) {
    return NextResponse.json({ error: getStrings(locale).errors.INVALID_RANGE }, { status: 400 });
  }

  const { error } = await supabaseAdmin().from('rate_periods').insert(parsed.data);

  if (error) {
    console.error('[treescape] dodavanje sezone nije uspjelo:', error.message);
    return serverError(locale, error.message);
  }

  return NextResponse.json({ ok: true });
}

/** Brisanje sezone. */
export async function DELETE(request: Request) {
  const locale = localeFromRequest(request);

  const notReady = requireDatabase(locale);
  if (notReady) return notReady;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return invalidInput(locale);

  const { error } = await supabaseAdmin().from('rate_periods').delete().eq('id', id);

  if (error) {
    console.error('[treescape] brisanje sezone nije uspjelo:', error.message);
    return serverError(locale, error.message);
  }

  return NextResponse.json({ ok: true });
}
