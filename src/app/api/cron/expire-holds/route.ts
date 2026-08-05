import { NextResponse } from 'next/server';

import { env, isDatabaseConfigured } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Oslobađa termine kojima je istekao rok — nezavršene uplate i bankovne
 * transfere koji nikad nisu legli na račun.
 *
 * Ovo je REZERVNA mreža, ne glavna odbrana: iste termine oslobađa i svako
 * čitanje dostupnosti (vidi `releaseExpiredHolds`). Zato zastoj crona ne može
 * zaključati termin — najgore što se desi je da baza malo duže nosi redove
 * koje niko ne gleda.
 *
 * Raspored stoji u `vercel.json`.
 */
export async function GET(request: Request) {
  // Vercel Cron šalje `Authorization: Bearer <CRON_SECRET>`. Bez provjere bi
  // ovu adresu mogao pozivati bilo ko.
  if (env.cronSecret) {
    const header = request.headers.get('authorization');
    if (header !== `Bearer ${env.cronSecret}`) {
      return NextResponse.json({ error: 'Nije dozvoljeno' }, { status: 401 });
    }
  }

  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: 'Baza nije podešena' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin().rpc('release_expired_holds');

  if (error) {
    console.error('[treescape] cron oslobađanje nije uspjelo:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ released: data ?? 0 });
}
