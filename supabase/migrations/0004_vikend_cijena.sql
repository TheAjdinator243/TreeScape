-- ═══════════════════════════════════════════════════════════════════════════
--  0004 — vikend cijena
--
--  Pokreni u Supabase → SQL Editor, isto kao i prethodne migracije.
--  Bezbjedno je pokrenuti više puta.
--
--  Zašto zasebna kolona, a ne još jedna sezona: sezone su rasponi datuma
--  ("od 15.06 do 16.09"), a vikend se ponavlja svake sedmice do kraja
--  vremena. Da se rješavalo sezonama, za svaki vikend u godini trebao bi
--  poseban red — pedeset i dva reda godišnje, koje bi neko morao dopisivati
--  svakog decembra.
--
--  Vrijedi za subotu i nedjelju, i to na mjestu OSNOVNE cijene: dan koji
--  pripada nekoj sezoni i dalje se naplaćuje po toj sezoni. Sezonu je vlasnik
--  upisao namjerno, za tačno te datume, pa ne bi imalo smisla da je vikend
--  tiho nadglasa — pogotovo kad bi je snizio.
--
--  0 znači "isključeno" — tada i vikend ide po osnovnoj cijeni.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.settings
  add column if not exists weekend_price_cents integer not null default 30000;

alter table public.settings drop constraint if exists settings_weekend_price_check;
alter table public.settings
  add constraint settings_weekend_price_check
  check (weekend_price_cents >= 0);

comment on column public.settings.weekend_price_cents is
  'Cijena po danu za subotu i nedjelju, u centima. 0 = vikend nema posebnu cijenu.';
