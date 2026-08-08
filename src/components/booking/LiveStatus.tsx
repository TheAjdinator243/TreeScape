'use client';

import { useSlotRefresh } from './useSlotRefresh';

/**
 * Stranica s potvrdom koja se sama osvježi kad domaćin odluči.
 *
 * Gost nakon slanja zahtjeva ostane na ovoj stranici i čeka. Do sada je tu
 * pisalo "čeka odobrenje" sve dok on sam ne pritisne osvježi — a on ne zna da
 * treba, pa zaključi da se ništa nije desilo, i zove telefonom.
 *
 * Komponenta ne crta ništa; samo sluša svoj termin i traži novi prikaz sa
 * servera čim se promijeni. Stranica je `force-dynamic`, pa novi prikaz uvijek
 * donese pravo stanje iz baze.
 */
export function LiveStatus({ bookingId }: { bookingId: string }) {
  useSlotRefresh(bookingId);
  return null;
}
