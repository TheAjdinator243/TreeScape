import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_COOKIE, isValidSession } from '@/lib/admin-session';
import { getStrings, localeFromRequest } from '@/lib/i18n';

/**
 * Čuvar administracije.
 *
 * (U Next.js-u 16 se ovo zove `proxy`; ranije se isti mehanizam zvao
 * `middleware`.)
 *
 * Provjera stoji ispred svake admin stranice i svake admin API rute, pa nijedna
 * nova ruta ne može slučajno ostati nezaštićena — dovoljno je da putanja počinje
 * sa /admin ili /api/admin.
 *
 * `/api/admin/login` je jedini izuzetak: to su vrata na koja se kuca.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/admin/login') return NextResponse.next();

  const authorized = await isValidSession(request.cookies.get(ADMIN_COOKIE)?.value);
  if (authorized) return NextResponse.next();

  // API rute dobijaju 401; stranice se vraćaju na /admin, koja bez sesije
  // prikaže polje za unos koda.
  if (pathname.startsWith('/api/admin')) {
    const t = getStrings(localeFromRequest(request));
    return NextResponse.json({ error: t.errors.NOT_ALLOWED }, { status: 401 });
  }

  if (pathname !== '/admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
