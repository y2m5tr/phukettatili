-- =============================================================================
-- Phuket Tatili — Supabase şeması
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.
--
-- Bu dosya IDEMPOTENT'tir: her satır "IF NOT EXISTS" ile korunur, yani
-- tablo zaten varsa veya bazı kolonlar mevcutsa hiçbir şeyi bozmadan
-- eksikleri tamamlar. Tekrar tekrar çalıştırmak güvenlidir.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. REZERVASYONLAR (ana CRM tablosu — mevcut veriler korunur)
-- -----------------------------------------------------------------------------
create table if not exists public.bookings (
  id text primary key,
  customer_name text not null,
  phone text not null,
  email text,
  hotel text,
  room_number text,
  tour_id text,
  tour_title text,
  tour_date text,
  pickup_time text,
  tours jsonb not null default '[]'::jsonb,
  adult_count integer not null default 1,
  child_count integer not null default 0,
  total_price_thb numeric not null default 0,
  cost_thb numeric not null default 0,
  supplier text,
  paid_amount_thb numeric not null default 0,
  remaining_amount_thb numeric not null default 0,
  national_park_fee_included boolean not null default false,
  status text not null default 'inquiry',
  payment_status text not null default 'unpaid',
  special_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Operasyon alanları (araç/şoför ataması + saha pickup takibi).
-- Bunlar olmadan ofisteki hat planlaması buluta YAZILMIYOR ve
-- rehberin telefonundaki saha uygulaması atamayı göremiyor.
alter table public.bookings add column if not exists pickup_status text;
alter table public.bookings add column if not exists picked_up_at timestamptz;
alter table public.bookings add column if not exists assigned_vehicle text;
alter table public.bookings add column if not exists assigned_driver text;
alter table public.bookings add column if not exists hotel_zone text;

-- Manifesto ve günlük rapor sorguları tarih + duruma göre filtreliyor.
create index if not exists idx_bookings_tour_date on public.bookings (tour_date);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_created_at on public.bookings (created_at desc);

-- -----------------------------------------------------------------------------
-- 2. ARAÇ FİLOSU
-- Minibüs hatları artık kodda sabit yazılı değil, panelden yönetiliyor.
-- -----------------------------------------------------------------------------
create table if not exists public.vehicles (
  id text primary key,
  label text not null,
  zone text,
  plate_no text,
  capacity integer not null default 10,
  kind text not null default 'minibus',   -- minibus | vip | speedboat | other
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. ŞOFÖR / REHBER KADROSU
-- Saha uygulamasındaki "Rehber / Şoför Adı" bu kayıtlarla eşleşir.
-- -----------------------------------------------------------------------------
create table if not exists public.drivers (
  id text primary key,
  full_name text not null,
  phone text,
  role text not null default 'driver',     -- driver | guide | both
  license_no text,
  vehicle_id text references public.vehicles(id) on delete set null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_drivers_vehicle on public.drivers (vehicle_id);

-- -----------------------------------------------------------------------------
-- 4. VARDİYALAR — "bugün sahada kim var?"
-- Saha uygulaması vardiya açtığında buraya yazar; ofis canlı görür.
-- -----------------------------------------------------------------------------
create table if not exists public.crew_shifts (
  id text primary key,
  driver_id text references public.drivers(id) on delete cascade,
  crew_name text not null,
  shift_date date not null,
  vehicle_id text references public.vehicles(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  note text
);

create index if not exists idx_crew_shifts_date on public.crew_shifts (shift_date desc);

-- -----------------------------------------------------------------------------
-- 5. KASA HAREKETLERİ — saha tahsilatları
-- -----------------------------------------------------------------------------
create table if not exists public.cash_entries (
  id text primary key,
  booking_id text references public.bookings(id) on delete set null,
  crew_name text not null,
  amount_thb numeric not null default 0,
  kind text not null default 'collection',  -- collection | refund | expense
  entry_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_cash_entries_date on public.cash_entries (entry_date desc);

-- -----------------------------------------------------------------------------
-- 6. REALTIME — ofis <-> saha canlı senkronizasyon
-- Kod bu kanalları dinliyor: realtime_bookings_crm, field_crew_realtime
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'crew_shifts'
  ) then
    alter publication supabase_realtime add table public.crew_shifts;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication yok — realtime elle etkinleştirilmeli';
end $$;

-- -----------------------------------------------------------------------------
-- 7. VARSAYILAN FİLO (kodda sabit yazılı olan liste buraya taşındı)
-- -----------------------------------------------------------------------------
insert into public.vehicles (id, label, zone, capacity, kind) values
  ('veh-minibus-1', 'Minibüs 1 (Patong & Kalim)',    'Patong & Kalim',    10, 'minibus'),
  ('veh-minibus-2', 'Minibüs 2 (Kata & Karon)',      'Kata & Karon',      10, 'minibus'),
  ('veh-minibus-3', 'Minibüs 3 (Bang Tao & Kamala)', 'Bang Tao & Kamala', 10, 'minibus'),
  ('veh-vip',       'VIP Özel Araç',                 'Genel Phuket',       4, 'vip')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 8. ERİŞİM POLİTİKALARI
-- Site yalnızca ANON anahtarını kullanıyor (client tarafı), yani bu politikalar
-- olmadan hiçbir okuma/yazma çalışmaz.
--
-- ⚠️ NOT: anon anahtarı tarayıcıya iner, dolayısıyla bu politikalarla
-- bookings tablosunu okuyan HERKES tüm müşteri verisini görebilir.
-- Paneller middleware ile korunuyor ama Supabase kendi başına korunmuyor.
-- Üretimde önerilen: RLS'i yalnızca authenticated role'e açmak ve
-- anon'a sadece kısıtlı görünüm vermek. Aşağıdaki sürüm mevcut kodla
-- çalışması için açık bırakılmıştır.
-- -----------------------------------------------------------------------------
alter table public.bookings    enable row level security;
alter table public.vehicles    enable row level security;
alter table public.drivers     enable row level security;
alter table public.crew_shifts enable row level security;
alter table public.cash_entries enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['bookings','vehicles','drivers','crew_shifts','cash_entries']
  loop
    execute format('drop policy if exists "%s_anon_all" on public.%I', t, t);
    execute format(
      'create policy "%s_anon_all" on public.%I for all to anon using (true) with check (true)',
      t, t
    );
  end loop;
end $$;
