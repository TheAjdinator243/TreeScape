import { NextResponse } from 'next/server';

import { env, isDatabaseConfigured } from '@/lib/env';
import { getStrings } from '@/lib/i18n';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Oslobađa termine kojima je istekao rok — nezavršene uplate i bankovne
 * transfere koji nikad nisu legli na račun.
 *
 * Ovo je REZERVNA mreža, ne glavna odbrana: iste termine oslobađa i svako
 * čitanje dostupnosti (vidi `releaseExpiredHolds`), pa i svaki upis nove
 * rezervacije. Zato zastoj crona ne može zaključati termin — najgore što se
 * desi je da baza nakratko nosi redove koje niko ne gleda.
 *
 * Zbog toga je i raspored u `vercel.json` samo jednom dnevno: češće nije
 * potrebno, a Vercel na besplatnom planu ionako dozvoljava samo dnevni cron.
 */
export async function GET(request: Request) {
  // Ovu rutu zove Vercel Cron, ne gost — poruke idu na jeziku kuće.
  const t = getStrings();

  // Vercel Cron šalje `Authorization: Bearer <CRON_SECRET>`. Bez provjere bi
  // ovu adresu mogao pozivati bilo ko.
  if (env.cronSecret) {
    const header = request.headers.get('authorization');
    if (header !== `Bearer ${env.cronSecret}`) {
      return NextResponse.json({ error: t.errors.NOT_ALLOWED }, { status: 401 });
    }
  }

  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: t.errors.DATABASE_MISSING }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin().rpc('release_expired_holds');

  if (error) {
    console.error('[treescape] cron oslobađanje nije uspjelo:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ released: data ?? 0 });
}
