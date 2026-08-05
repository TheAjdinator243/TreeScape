import { NextResponse } from 'next/server';

import { invalidInput, readJson, requireDatabase } from '@/lib/api-helpers';
import { blockDates } from '@/lib/booking-service';
import { blockDatesSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Ručno zatvaranje termina (održavanje, lični boravak, dogovor van sajta). */
export async function POST(request: Request) {
  const notReady = requireDatabase();
  if (notReady) return notReady;

  const parsed = blockDatesSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const result = await blockDates(
    parsed.data.start_date,
    parsed.data.end_date,
    parsed.data.reason
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
