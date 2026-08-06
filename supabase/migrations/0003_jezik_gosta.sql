-- ═══════════════════════════════════════════════════════════════════════════
--  0003 — jezik gosta
--
--  Pokreni u Supabase → SQL Editor, isto kao i prethodne migracije.
--  Bezbjedno je pokrenuti više puta.
--
--  Zašto: sajt govori bosanski, engleski i arapski. Jezik u kojem je gost
--  rezervisao mora ostati zapisan uz rezervaciju, jer se mailovi ne šalju
--  samo u tom trenutku — potvrda ili odbijanje zahtjeva za gotovinu stižu
--  danima kasnije, iz administracije, gdje od gosta nije ostalo ništa osim
--  onoga što piše u ovom redu.
--
--  Bez ovoga bi gost koji je sve popunio na arapskom dobio potvrdu na
--  bosanskom.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.bookings
  add column if not exists locale text not null default 'bs';

-- Blokade koje vlasnik pravi ručno nemaju gosta, pa ni jezik — 'bs' iz
-- podrazumijevane vrijednosti im ništa ne smeta.
alter table public.bookings drop constraint if exists bookings_locale_check;
alter table public.bookings
  add constraint bookings_locale_check check (locale in ('bs', 'en', 'ar'));

comment on column public.bookings.locale is
  'Jezik na kojem je gost rezervisao — određuje jezik svih mailova o ovoj rezervaciji.';
