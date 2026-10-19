-- =============================================================================
-- Phuket Tatili — Supabase şeması
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.
--
-- Bu dosya IDEMPOTENT'tir: her satır "IF NOT EXISTS" ile korunur, yani
-- tablo zaten varsa veya bazı kolonlar mevcutsa hiçbir şeyi bozmadan
-- eksikleri tamamlar. Tekrar tekrar çalıştırmak güvenlidir.
--
-- ⚠️ DEPLOY SIRASI — ÖNEMLİ ⚠️
-- Bu SQL'i ÖNCE çalıştırın, kodu SONRA deploy edin.
-- `bookingToRow()` artık passengers / assigned_vehicle / assigned_driver /
-- hotel_zone / pickup_status / picked_up_at kolonlarını gönderiyor.
-- Bu kolonlar tabloda YOKSA Supabase "column does not exist" hatası verir ve
-- TÜM rezervasyon yazma/güncelleme işlemleri patlar (çalışan CRM bozulur).
-- Sıra: 1) SQL'i çalıştır  2) kodu deploy et  3) ADMIN_PASSCODE env'ini ayarla
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

-- Yolcu pasaport bilgileri (deniz polisi / sigorta manifestosu).
-- ⚠️ Bu kolon KİŞİSEL VERİ tutar: pasaport no, ad, doğum tarihi, uyruk.
-- RLS anon'a tamamen kapalıdır; veri yalnızca /api/* üzerinden oturumlu
-- isteklerle, sunucuda servis rolü anahtarıyla erişilebilir.
alter table public.bookings add column if not exists passengers jsonb not null default '[]'::jsonb;

-- Bilet portalı kodu (/bilet/[code]).
-- Kayıt id'leri (BK-1001) tahmin edilebilir olduğu için misafir portalına
-- rastgele, tahmin edilemez ayrı kod atanır. Eski BK- id'leri geriye dönük
-- olarak çalışmaya devam eder; yeni kayıtlar PT-XXXXXXX kodu alır.
-- 31^7 ≈ 27,5 milyar kombinasyon — bot taraması pratik değil.
alter table public.bookings add column if not exists ticket_code text;
create unique index if not exists idx_bookings_ticket_code on public.bookings (ticket_code) where ticket_code is not null;

-- Mevcut kayıtlara rastgele kod backfill (idempotent: yalnız kodu olmayanlar).
-- md5(tabanlı 7 karakter — 16^7 ≈ 268 milyon kombinasyon, backfill için yeterli;
-- yeni kayıtlar uygulama tarafından 31^7'lik alfabeden üretilir).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'bookings' and column_name = 'ticket_code'
  ) then
    update public.bookings
    set ticket_code = 'PT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 7))
    where ticket_code is null;
  end if;
end $$;

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
-- 8. ERİŞİM POLİTİKALARI — SIKILAŞTIRILMIŞ
--
-- MİMARİ DEĞİŞİKLİK: tablo erişimi tamamen sunucu tarafına taşındı.
-- Paneller veriyi /api/bookings üzerinden alır; API route'ları servis
-- rolü anahtarıyla (RLS bypass) yazar. Client'taki anon/publishable
-- anahtar yalnızca veri taşımayan Broadcast sinyal kanalına bağlanır.
--
-- SONUÇ: anon role'üne TABLO erişimi gerekmediği için aşağıdaki
-- politikalar anon'u tamamen kapatır. Eski "%s_anon_all" politikaları
-- düşürülür — bu satır eski açık kurulumu düzeltir.
--
-- Not: servis rolü anahtarı RLS'e tabi değildir; authenticated role'ü
-- kullanılmadığı için ona da politika açılmaz (default deny).
-- -----------------------------------------------------------------------------
alter table public.bookings    enable row level security;
alter table public.vehicles    enable row level security;
alter table public.drivers     enable row level security;
alter table public.crew_shifts enable row level security;
alter table public.cash_entries enable row level security;

-- Eski açık politikaları kaldır (idempotent).
do $$
declare
  t text;
begin
  foreach t in array array['bookings','vehicles','drivers','crew_shifts','cash_entries']
  loop
    execute format('drop policy if exists "%s_anon_all" on public.%I', t, t);
  end loop;
end $$;

-- Yeni politikalar: anon'a HİÇBİR erişim yok. Anon'dan gelen tablo
-- isteği (select/insert/update/delete) "row-level security" varsayılan
-- reddiyle döner. Sinyal kanalı (broadcast) RLS'e tabi değildir ve
-- çalışmaya devam eder.

-- -----------------------------------------------------------------------------
-- 9. CMS CONTENT STORE — yönetim panelinin canlı içerik kayıtları
--
-- Tur/blog/SSS/yorum/hizmet/medya/site ayarı düzenlemeleri artık buluta
-- yazılır: ptt_cms_<koleksiyon> localStorage anahtarlarının karşılığı.
-- Tek key-value tablo: her koleksiyon JSONB doküman olarak saklanır,
-- /api/content üzerinden oturumlu (admin) isteklerle okunur/yazılır.
-- RLS default deny — yalnızca servis rolü (sunucu) erişir.
-- -----------------------------------------------------------------------------
create table if not exists public.content_store (
  key text primary key,           -- 'tours' | 'blogs' | 'faqs' | 'services' | 'testimonials' | 'media' | 'site-settings' | ...
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.content_store enable row level security;
drop policy if exists "content_store_anon_all" on public.content_store;

-- -----------------------------------------------------------------------------
-- 10. RATE LIMIT SAYAÇLARI — serverless'ta kalıcı brute-force koruması
--
-- In-memory sayaçlar her lambda instance'ında ayrı yaşar; dağıtık trafiği
-- sayamaz. Bu tablo /ops-login ve /bilet/[code] sayaçlarını kalıcı tutar.
-- Yazma yalnızca servis rolü üzerinden /api uçlarında yapılır; RLS default
-- deny. Satırlar kısa ömürlüdür, pencere dolunca yeniden kullanılır.
-- -----------------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket_key text primary key,      -- '<amac>:<ip>'
  count integer not null default 0,
  reset_at timestamptz not null
);

alter table public.rate_limits enable row level security;
drop policy if exists "rate_limits_anon_all" on public.rate_limits;

-- -----------------------------------------------------------------------------
-- 11. ÜYELİK SİSTEMİ — kullanıcı hesapları ve roller
--
-- Rol hiyerarşisi: owner > manager > guide > driver.
--   owner  : her şey (kullanıcı yönetimi dahil)
--   manager: admin paneli + CMS yazma; kullanıcı yönetimi ve kalıcı silme yok
--   guide  : saha paneli (tam)
--   driver : saha paneli (yalnızca kendi rotası görür)
--
-- Şifre hash'i scrypt ile sunucuda doğrulanır (bcrypt bağımlılığı gerekmez).
-- RLS default deny — kimlik doğrulama yalnızca /api/auth/* uçlarında,
-- servis rolü üzerinden yapılır. Hiçbir parça client'a açılmaz.
--
-- İlk yönetici (owner) hesabı scripts/create-admin.mjs ile oluşturulur:
--   node scripts/create-admin.mjs <kullaniciadi> <sifre> [adSoyad]
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  full_name text not null,
  password_hash text not null,          -- 'scrypt$<saltHex>$<hashHex>'
  role text not null check (role in ('owner', 'manager', 'guide', 'driver')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index if not exists idx_users_username on public.users (username);

alter table public.users enable row level security;
drop policy if exists "users_anon_all" on public.users;

-- ==========================================================================
-- STORAGE: Medya kütüphanesi bucket'ı (panel fotoğraf yüklemeleri)
-- ==========================================================================
-- Bucket public okumalı: site <img> etiketlerinden doğrudan yüklenebilsin.
-- Yazma yalnızca servis rolü anahtarıyla /api/upload üzerinden — panel
-- anon anahtarla storage'a YAZAMAZ (RLS policy yazmaya izin vermez).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public okuma: herkes bucket'taki dosyaları GET ile okuyabilir.
create policy "media public read" on storage.objects
  for select to public
  using (bucket_id = 'media');

-- Yazma: sadece service role (anon/authenticated'a KAPALI).
-- Storage RLS'de "service_role" bypass olduğu için ayrıca policy gerekmez;
-- ancak yanlışlıkla authenticated'a açık bırakmamak için açıkça reddediyoruz.
create policy "media no client write" on storage.objects
  for insert to authenticated
  with check (false);

create policy "media no client update" on storage.objects
  for update to authenticated
  using (false);

create policy "media no client delete" on storage.objects
  for delete to authenticated
  using (false);
