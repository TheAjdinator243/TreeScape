-- ═══════════════════════════════════════════════════════════════════════════
--  0002 — izlazak iz Stripe-a, ulazak u bankovni transfer
--
--  Pokreni u Supabase → SQL Editor, isto kao i prvu migraciju.
--  Bezbjedno je pokrenuti više puta.
--
--  Šta se mijenja:
--    · nazivi vezani za Stripe postaju neutralni (payment_*), da sutra
--      Monri ili WSPay ne traže novu migraciju
--    · dodaje se status 'pending_transfer' — gost je rezervisao i čeka se
--      da uplata legne na račun
--    · u postavke ulaze bankovni podaci koje gost vidi na potvrdi
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
--  1. Neutralni nazivi umjesto Stripe naziva
-- ───────────────────────────────────────────────────────────────────────────

-- Preimenovanje nije idempotentno samo po sebi — zato provjera prije svakog.
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_name = 'bookings' and column_name = 'stripe_session_id') then
    alter table public.bookings rename column stripe_session_id to payment_reference;
  end if;

  if exists (select 1 from information_schema.columns
              where table_name = 'bookings' and column_name = 'stripe_payment_intent_id') then
    alter table public.bookings rename column stripe_payment_intent_id to payment_id;
  end if;

  if exists (select 1 from information_schema.tables
              where table_schema = 'public' and table_name = 'stripe_events') then
    alter table public.stripe_events rename to payment_events;
  end if;

  if exists (select 1 from information_schema.columns
              where table_name = 'payment_events' and column_name = 'event_id') then
    alter table public.payment_events rename column event_id to external_id;
  end if;
end;
$$;

-- Ko je obradio uplatu (za sada 'bank_transfer' ili 'test').
alter table public.payment_events
  add column if not exists provider text not null default 'nepoznato';


-- ───────────────────────────────────────────────────────────────────────────
--  2. Novi načini plaćanja i novi status
--
--  'bank_transfer' — gost uplaćuje na račun vlasnika
--  'test'          — simulirana uplata, samo za isprobavanje
--  'card'          — ostaje za budući domaći procesor (Monri/WSPay)
-- ───────────────────────────────────────────────────────────────────────────

alter table public.bookings drop constraint if exists bookings_payment_method_check;
alter table public.bookings
  add constraint bookings_payment_method_check
  check (payment_method in ('card', 'cash', 'bank_transfer', 'test', 'none'));

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in (
    'pending_payment',   -- čeka online uplatu (kratko držanje)
    'pending_cash',      -- gotovina, čeka odobrenje vlasnika
    'pending_transfer',  -- čeka da uplata legne na račun (dugo držanje)
    'confirmed',
    'expired',
    'cancelled',
    'blocked'
  ));


-- ───────────────────────────────────────────────────────────────────────────
--  3. Termin se drži i dok se čeka uplata na račun
--
--  Bez ovoga bi rezervacija s bankovnim transferom bila nevidljiva u
--  kalendaru, pa bi neko drugi mogao uzeti isti termin dok novac putuje.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.bookings drop constraint if exists bookings_no_overlap;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (stay with &&)
  where (status in (
    'pending_payment', 'pending_cash', 'pending_transfer', 'confirmed', 'blocked'
  ));

create or replace function public.sync_availability_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.availability_slots where booking_id = old.id;
    return old;
  end if;

  if new.status in ('pending_payment', 'pending_cash', 'pending_transfer',
                    'confirmed', 'blocked') then
    insert into public.availability_slots (booking_id, start_date, end_date, kind)
    values (
      new.id,
      new.start_date,
      new.end_date,
      case new.status
        when 'confirmed' then 'booked'
        when 'blocked'   then 'blocked'
        else 'pending'
      end
    )
    on conflict (booking_id) do update
      set start_date = excluded.start_date,
          end_date   = excluded.end_date,
          kind       = excluded.kind;
  else
    delete from public.availability_slots where booking_id = new.id;
  end if;

  return new;
end;
$$;


-- ───────────────────────────────────────────────────────────────────────────
--  4. Isticanje termina — sada i za bankovni transfer
--
--  Online uplata se drži minutama, uplata na račun danima. Oba se oslobode
--  kad im istekne rok, jer se oba oslanjaju na `hold_expires_at`.
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.release_expired_holds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  released integer;
begin
  update public.bookings
     set status     = 'expired',
         updated_at = now()
   where status in ('pending_payment', 'pending_transfer')
     and hold_expires_at is not null
     and hold_expires_at < now();

  get diagnostics released = row_count;
  return released;
end;
$$;

drop index if exists bookings_holds_idx;
create index if not exists bookings_holds_idx
  on public.bookings (hold_expires_at)
  where status in ('pending_payment', 'pending_transfer');


-- ───────────────────────────────────────────────────────────────────────────
--  5. Bankovni podaci
--
--  Ovo gost vidi na stranici s potvrdom i u mailu. Popunjava se kroz
--  /admin → Cijene. Dok je IBAN prazan, plaćanje na račun se ne nudi.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.settings
  add column if not exists bank_account_name  text not null default '',
  add column if not exists bank_name          text not null default '',
  add column if not exists bank_iban          text not null default '',
  -- Koliko dana gost ima da uplati prije nego se termin oslobodi.
  add column if not exists transfer_days      integer not null default 3
    check (transfer_days > 0 and transfer_days <= 30);


-- ───────────────────────────────────────────────────────────────────────────
--  6. Provjera
-- ───────────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_no_overlap'
  ) then
    raise exception 'Ograničenje bookings_no_overlap nedostaje — dvostruki booking bi bio moguć!';
  end if;

  raise notice 'Migracija 0002 uspješno primijenjena.';
end;
$$;
