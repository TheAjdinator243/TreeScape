'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { supabaseBrowser } from '@/lib/supabase/browser';

/**
 * Administracija koja se sama osvježava kad stigne novi zahtjev.
 *
 * Vlasnik obično ostavi /admin otvoren u kartici. Bez ovoga bi tu stajala
 * slika stanja od trenutka kad je stranica učitana, pa bi novi zahtjev vidio
 * tek kad se sjeti pritisnuti F5.
 *
 * Sluša se `availability_slots`, a NE `bookings` — i to namjerno. Ta tabela je
 * već javna i već je u Realtime objavi (zbog kalendara na sajtu), a sadrži samo
 * gole datume. Da bi se slušala tabela `bookings`, morala bi se otvoriti prema
 * `anon` ključu, a u njoj su imena, mailovi i telefoni gostiju — to se ne radi
 * zbog jednog osvježavanja. Svaki zahtjev za gotovinu ionako odmah upiše red i
 * ovdje (okidač `bookings_sync_availability`), pa je znak isti.
 *
 * Podaci se ne čitaju iz poruke — ona je samo zvono. Prave redove i dalje
 * dovlači server, gdje RLS ne važi i gdje se vidi cijela rezervacija.
 */
export function useLiveRequests(): void {
  const router = useRouter();

  useEffect(() => {
    // Povratak na karticu je pojas i tregeri: pokrije slučaj da je WebSocket
    // pao dok je laptop spavao.
    const onFocus = () => router.refresh();
    window.addEventListener('focus', onFocus);

    const supabase = supabaseBrowser();

    if (!supabase) {
      return () => window.removeEventListener('focus', onFocus);
    }

    const channel = supabase
      .channel('admin-zahtjevi-uzivo')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'availability_slots' },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', onFocus);
      void supabase.removeChannel(channel);
    };
  }, [router]);
}
