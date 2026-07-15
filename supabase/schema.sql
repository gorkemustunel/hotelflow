-- =============================================================================
-- HotelFlow — Supabase şeması (Faz G: gerçek backend)
-- =============================================================================
-- Supabase Dashboard → SQL Editor'a yapıştırıp çalıştır. Sıfırdan bir proje
-- için tek seferde eksiksiz kurulum yapar: tüm tablolar, RLS politikaları,
-- realtime yayınları ve mevcut demo verisiyle aynı seed data.
--
-- Güvenlik modeli (bilinçli demo tercihi — gerçek bir otel için yeterli
-- değildir): "anon" (misafir, QR ile giren, giriş yapmamış) rolü sadece
-- misafire açık olması gereken verileri okuyabilir/oluşturabilir. "authenticated"
-- (Supabase Auth ile giriş yapmış personel/admin) rolü yönetimsel
-- okuma/yazma yapabilir. Rol bazlı ince yetkilendirme (housekeeping sadece
-- kendi departmanını görsün gibi) hâlâ istemci tarafında `permissions.ts`
-- üzerinden uygulanıyor — DB seviyesinde tüm authenticated kullanıcılar eşit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. guest_requests — misafir talepleri
-- -----------------------------------------------------------------------------
create table if not exists guest_requests (
  id text primary key,
  room_number text not null,
  category_id text not null,
  category_slug text not null,
  category_name text not null,
  icon text not null,
  title text not null,
  description text not null,
  priority text not null,
  status text not null,
  department text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  assigned_staff_id text,
  assigned_staff_name text,
  estimated_minutes int,
  guest_note text,
  staff_note text,
  call_before_arrival boolean,
  guest_present boolean,
  items jsonb,
  total_price numeric,
  history jsonb not null default '[]'::jsonb,
  cancel_reason text
);

alter table guest_requests enable row level security;
create policy "guest_requests_select_all" on guest_requests for select using (true);
create policy "guest_requests_insert_anon" on guest_requests for insert with check (true);
create policy "guest_requests_update_all" on guest_requests for update using (true);

-- -----------------------------------------------------------------------------
-- 2. rooms
-- -----------------------------------------------------------------------------
create table if not exists rooms (
  id text primary key,
  number text not null unique,
  floor int not null,
  type text not null,
  status text not null,
  guest_name text,
  guest_count int,
  check_in date,
  check_out date,
  last_cleaned_at timestamptz,
  notes text,
  occupancy text,
  cleaning_status text,
  technical_status text
);

alter table rooms enable row level security;
create policy "rooms_select_all" on rooms for select using (true);
create policy "rooms_write_authenticated" on rooms for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 3. staff
-- -----------------------------------------------------------------------------
create table if not exists staff (
  id text primary key,
  role_id text not null,
  active boolean not null default true,
  last_action_at timestamptz,
  name text not null,
  department text not null,
  role text not null,
  initials text not null,
  color text not null,
  phone text not null,
  rating numeric not null default 5,
  completed_today int not null default 0,
  active_tasks int not null default 0,
  avg_resolution_minutes int not null default 0,
  on_duty boolean not null default true,
  is_demo_switch_user boolean not null default false
);

alter table staff enable row level security;
create policy "staff_select_all" on staff for select using (true);
create policy "staff_write_authenticated" on staff for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 4. roles — rol başına izin listesi (Rol & Yetki Yönetimi ekranı)
-- -----------------------------------------------------------------------------
create table if not exists roles (
  id text primary key,
  name text not null,
  description text not null,
  permissions jsonb not null default '[]'::jsonb
);

alter table roles enable row level security;
create policy "roles_select_all" on roles for select using (true);
create policy "roles_write_authenticated" on roles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 5. reservations
-- -----------------------------------------------------------------------------
create table if not exists reservations (
  id text primary key,
  room_number text not null,
  guest_name text not null,
  guest_count int not null,
  check_in date not null,
  check_out date not null,
  notes text,
  cancelled boolean not null default false,
  created_by_name text not null,
  created_at timestamptz not null default now()
);

alter table reservations enable row level security;
create policy "reservations_select_all" on reservations for select using (true);
create policy "reservations_write_authenticated" on reservations for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 6. breakfast_items
-- -----------------------------------------------------------------------------
create table if not exists breakfast_items (
  id text primary key,
  name text not null,
  description text not null,
  allergens jsonb not null default '[]'::jsonb,
  category text not null,
  stock text not null default 'in_stock',
  available boolean not null default true,
  prep_status text not null default 'preparing',
  price numeric,
  added_by text not null,
  updated_at timestamptz not null default now()
);

alter table breakfast_items enable row level security;
create policy "breakfast_items_select_all" on breakfast_items for select using (true);
create policy "breakfast_items_write_authenticated" on breakfast_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 7. qr_tokens — oda başına geçerli tek QR token'ı
-- -----------------------------------------------------------------------------
create table if not exists qr_tokens (
  room_number text primary key,
  token text not null,
  generated_at timestamptz not null default now()
);

alter table qr_tokens enable row level security;
create policy "qr_tokens_select_all" on qr_tokens for select using (true);
create policy "qr_tokens_write_authenticated" on qr_tokens for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 8. notifications — misafir + admin bildirim merkezi
-- -----------------------------------------------------------------------------
create table if not exists notifications (
  id text primary key,
  audience text not null,
  room_number text,
  title text not null,
  body text not null,
  icon text not null,
  timestamp timestamptz not null default now(),
  read boolean not null default false,
  request_id text
);

alter table notifications enable row level security;
create policy "notifications_select_all" on notifications for select using (true);
create policy "notifications_insert_all" on notifications for insert with check (true);
create policy "notifications_update_all" on notifications for update using (true);

-- -----------------------------------------------------------------------------
-- 9. room_status_logs
-- -----------------------------------------------------------------------------
create table if not exists room_status_logs (
  id text primary key,
  room_number text not null,
  actor_name text not null,
  actor_role text not null,
  field text not null,
  from_label text not null,
  to_label text not null,
  timestamp timestamptz not null default now()
);

alter table room_status_logs enable row level security;
create policy "room_status_logs_select_all" on room_status_logs for select using (true);
create policy "room_status_logs_insert_authenticated" on room_status_logs for insert with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 10. price_change_logs
-- -----------------------------------------------------------------------------
create table if not exists price_change_logs (
  id text primary key,
  item_id text not null,
  item_name text not null,
  actor_name text not null,
  actor_role text not null,
  old_price numeric not null,
  new_price numeric not null,
  timestamp timestamptz not null default now()
);

alter table price_change_logs enable row level security;
create policy "price_change_logs_select_all" on price_change_logs for select using (true);
create policy "price_change_logs_insert_authenticated" on price_change_logs for insert with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 11. approval_requests
-- -----------------------------------------------------------------------------
create table if not exists approval_requests (
  id text primary key,
  type text not null,
  requested_by_name text not null,
  requested_by_role text not null,
  item_id text not null,
  item_name text not null,
  old_value text not null,
  new_value text not null,
  description text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by_name text
);

alter table approval_requests enable row level security;
create policy "approval_requests_select_all" on approval_requests for select using (true);
create policy "approval_requests_write_authenticated" on approval_requests for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 12. activity_log — birleşik işlem geçmişi
-- -----------------------------------------------------------------------------
create table if not exists activity_log (
  id text primary key,
  actor_name text not null,
  actor_role text not null,
  description text not null,
  timestamp timestamptz not null default now()
);

alter table activity_log enable row level security;
create policy "activity_log_select_all" on activity_log for select using (true);
create policy "activity_log_insert_authenticated" on activity_log for insert with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 13. service_items — hizmet & menü kataloğu
-- -----------------------------------------------------------------------------
create table if not exists service_items (
  id text primary key,
  category_id text not null,
  group_name text not null default '',
  name text not null,
  description text not null,
  price numeric not null,
  currency text not null default 'TRY',
  image text not null,
  available boolean not null default true,
  stock text not null default 'in_stock',
  prep_time_minutes int not null default 0,
  department text not null,
  tags jsonb,
  updated_by text,
  updated_at timestamptz
);

-- Safe to re-run: adds the column if an earlier version of this script
-- already created the table without it.
alter table service_items add column if not exists group_name text not null default '';

alter table service_items enable row level security;
create policy "service_items_select_all" on service_items for select using (true);
create policy "service_items_write_authenticated" on service_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 14. hotel_info — tek satırlık otel ayarları
-- -----------------------------------------------------------------------------
create table if not exists hotel_info (
  id int primary key default 1,
  hotel_name text not null,
  tagline text not null,
  wifi_name text not null,
  wifi_password text not null,
  breakfast_hours text not null,
  pool_hours text not null,
  spa_hours text not null,
  restaurant_hours text not null,
  check_in_time text not null,
  check_out_time text not null,
  parking_info text not null,
  emergency_numbers jsonb not null default '[]'::jsonb,
  hotel_rules jsonb not null default '[]'::jsonb,
  floor_plan_note text not null,
  address text not null,
  heritage_title text not null,
  heritage_paragraphs jsonb not null default '[]'::jsonb,
  constraint hotel_info_singleton check (id = 1)
);

alter table hotel_info enable row level security;
create policy "hotel_info_select_all" on hotel_info for select using (true);
create policy "hotel_info_write_authenticated" on hotel_info for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- Realtime — çok cihazlı canlı güncelleme hissi için değişiklik yayınları.
-- Supabase projelerinde bazı tablolar (örn. guest_requests, daha önceki bir
-- denemeden) yayına zaten eklenmiş olabilir; her tabloyu eklemeden önce
-- kontrol ederek "already member of publication" hatasını (ve script'in o
-- noktada tamamen geri alınmasını) önlüyoruz.
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['guest_requests', 'rooms', 'reservations', 'breakfast_items', 'notifications', 'qr_tokens']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

-- =============================================================================
-- SEED DATA — mevcut demo verisiyle birebir aynı, uygulamayı ilk açılışta
-- doldurulmuş görmek için
-- =============================================================================

insert into rooms (id, number, floor, type, status, guest_name, guest_count, check_in, check_out, last_cleaned_at, occupancy, cleaning_status, technical_status) values
('r101','101',1,'standard','occupied','Kerem Öztürk',2,'2026-06-30','2026-07-04','2026-07-02T09:10:00','occupied','clean','ok'),
('r102','102',1,'standard','occupied','Naz Aksoy',1,'2026-06-29','2026-07-03','2026-07-02T08:40:00','occupied','clean','ok'),
('r103','103',1,'standard','occupied','Orkun Bilgin',2,'2026-07-01','2026-07-05','2026-07-01T10:00:00','occupied','dirty','ok'),
('r104','104',1,'standard','vacant',null,null,null,null,'2026-07-02T07:30:00','vacant','clean','ok'),
('r201','201',2,'deluxe','occupied','Sibel Korkmaz',2,'2026-06-28','2026-07-03','2026-07-02T09:00:00','occupied','clean','ok'),
('r202','202',2,'deluxe','occupied','Tarık Ersoy',3,'2026-07-01','2026-07-06','2026-07-02T08:15:00','occupied','clean','issue'),
('r203','203',2,'deluxe','cleaning',null,null,null,null,'2026-07-02T11:20:00','vacant','preparing','ok'),
('r305','305',3,'deluxe','occupied','Görkem Ünal',2,'2026-06-30','2026-07-05','2026-07-02T09:45:00','occupied','clean','ok'),
('r306','306',3,'standard','vacant',null,null,null,null,'2026-07-01T16:00:00','reserved','clean','ok'),
('r401','401',4,'suite','occupied','Pelin Yıldız',2,'2026-06-27','2026-07-04','2026-07-02T08:55:00','occupied','clean','ok'),
('r402','402',4,'suite','maintenance',null,null,null,null,'2026-06-30T12:00:00','vacant','inspection_pending','maintenance'),
('r502','502',5,'family','occupied','Aylin & Burak Çetin',4,'2026-06-29','2026-07-06','2026-07-02T09:30:00','occupied','clean','ok'),
('r503','503',5,'deluxe','vacant',null,null,null,null,'2026-07-02T07:50:00','vacant','clean','ok'),
('r601','601',6,'suite','occupied','Emre Karaca',1,'2026-07-01','2026-07-08','2026-07-02T08:20:00','occupied','clean','ok'),
('r712','712',7,'suite','occupied','Léa Fontaine',2,'2026-06-30','2026-07-03','2026-07-02T09:05:00','occupied','dirty','ok')
on conflict (id) do nothing;

update rooms set notes = 'Banyo armatürü değişimi bekleniyor' where id = 'r402';

insert into staff (id, role_id, active, last_action_at, name, department, role, initials, color, phone, rating, completed_today, active_tasks, avg_resolution_minutes, on_duty, is_demo_switch_user) values
('s0','super_admin',true,'2026-07-06T08:10:00','Ahmet Demir','management','Super Admin / Otel Sahibi','AD','#0a1628','0532 111 22 00',5.0,0,0,0,true,true),
('s9','hotel_manager',true,'2026-07-06T09:05:00','Zeynep Yıldız','management','Otel Yöneticisi','ZY','#17805a','0532 111 22 09',4.9,0,0,0,true,true),
('s1','housekeeping',true,'2026-07-06T08:40:00','Ayşe Yılmaz','housekeeping','Kat Hizmetleri Sorumlusu','AY','#c39a4e','0532 111 22 01',4.9,8,2,18,true,true),
('s2','housekeeping',true,'2026-07-05T17:20:00','Zeynep Arı','housekeeping','Kat Görevlisi','ZA','#a67f3a','0532 111 22 02',4.7,6,1,21,true,false),
('s3','technical',true,'2026-07-06T07:55:00','Mehmet Kaya','technical','Teknik Servis Uzmanı','MK','#26456f','0532 111 22 03',4.8,5,1,34,true,true),
('s4','technical',true,'2026-07-04T14:10:00','Burak Şahin','technical','Teknik Servis','BŞ','#335686','0532 111 22 04',4.6,3,0,29,false,false),
('s5','reception',true,'2026-07-06T09:30:00','Elif Demir','reception','Ön Büro Sorumlusu','ED','#0f1f38','0532 111 22 05',4.9,12,3,9,true,true),
('s6','room_service',true,'2026-07-06T08:50:00','Can Arslan','room_service','Oda Servisi / Restoran','CA','#17805a','0532 111 22 06',4.8,10,2,24,true,true),
('s7','spa',true,'2026-07-06T08:15:00','Selin Koç','spa','Spa & Wellness Uzmanı','SK','#d4af6a','0532 111 22 07',5.0,4,1,15,true,true),
('s10','chef',true,'2026-07-06T06:45:00','Murat Usta','kitchen','Aşçı / Mutfak Şefi','MU','#a8823f','0532 111 22 10',4.9,6,1,12,true,true)
on conflict (id) do nothing;

insert into reservations (id, room_number, guest_name, guest_count, check_in, check_out, notes, cancelled, created_by_name, created_at) values
('res-101a','101','Kerem Öztürk',2,'2026-06-30','2026-07-04',null,false,'Elif Demir','2026-06-25T10:00:00'),
('res-102a','102','Naz Aksoy',1,'2026-06-29','2026-07-03',null,false,'Elif Demir','2026-06-20T11:30:00'),
('res-103a','103','Orkun Bilgin',2,'2026-07-01','2026-07-05',null,false,'Elif Demir','2026-06-22T09:15:00'),
('res-201a','201','Sibel Korkmaz',2,'2026-06-28','2026-07-03',null,false,'Elif Demir','2026-06-18T14:00:00'),
('res-202a','202','Tarık Ersoy',3,'2026-07-01','2026-07-06',null,false,'Elif Demir','2026-06-24T16:45:00'),
('res-305a','305','Görkem Ünal',2,'2026-06-30','2026-07-05',null,false,'Elif Demir','2026-06-21T08:30:00'),
('res-401a','401','Pelin Yıldız',2,'2026-06-27','2026-07-04',null,false,'Elif Demir','2026-06-15T12:00:00'),
('res-502a','502','Aylin & Burak Çetin',4,'2026-06-29','2026-07-06',null,false,'Elif Demir','2026-06-19T10:20:00'),
('res-601a','601','Emre Karaca',1,'2026-07-01','2026-07-08',null,false,'Elif Demir','2026-06-23T13:10:00'),
('res-712a','712','Léa Fontaine',2,'2026-06-30','2026-07-03',null,false,'Elif Demir','2026-06-20T15:40:00'),
('res-104u','104','Deniz Aydın',2,'2026-07-10','2026-07-13',null,false,'Elif Demir','2026-07-01T09:00:00'),
('res-203u','203','Hakan Öz',1,'2026-07-09','2026-07-11',null,false,'Elif Demir','2026-07-02T11:20:00'),
('res-306u','306','Ceren Bulut',2,'2026-07-09','2026-07-12',null,false,'Elif Demir','2026-07-03T14:00:00'),
('res-503u','503','James Whitfield',2,'2026-07-11','2026-07-15',null,false,'Elif Demir','2026-07-04T10:10:00'),
('res-101b','101','Selim Kurt',1,'2026-07-05','2026-07-09',null,false,'Elif Demir','2026-06-27T09:40:00'),
('res-201b','201','Ege Yavuz',2,'2026-07-04','2026-07-08',null,false,'Elif Demir','2026-06-26T17:00:00'),
('res-712b','712','Marco Rossi',2,'2026-07-04','2026-07-09',null,false,'Elif Demir','2026-06-28T08:20:00'),
('res-402p','402','Yusuf Aktaş',2,'2026-06-20','2026-06-25',null,false,'Elif Demir','2026-06-10T09:00:00'),
('res-503c','503','Nihal Ergin',1,'2026-07-07','2026-07-09','Misafir talebiyle iptal edildi.',true,'Elif Demir','2026-06-29T12:00:00')
on conflict (id) do nothing;

insert into breakfast_items (id, name, description, allergens, category, stock, available, prep_status, price, added_by, updated_at) values
('bf1','Menemen','Domates, biber ve yumurta ile geleneksel usul.','["Yumurta"]','hot','in_stock',true,'ready',null,'Murat Usta','2026-07-06T06:30:00'),
('bf2','Sucuklu Yumurta','Tavada pişirilmiş sucuk ve yumurta.','["Yumurta"]','hot','in_stock',true,'ready',null,'Murat Usta','2026-07-06T06:32:00'),
('bf3','Sigara Böreği','Peynirli, el açması yufka ile.','["Gluten","Süt"]','bakery','in_stock',true,'preparing',null,'Murat Usta','2026-07-06T06:20:00'),
('bf4','Simit','Susamlı, günlük taze fırından.','["Gluten","Susam"]','bakery','in_stock',true,'ready',null,'Murat Usta','2026-07-06T06:00:00'),
('bf5','Peynir Tabağı','Beyaz peynir, kaşar, tulum ve örgü peyniri.','["Süt"]','cold','in_stock',true,'ready',null,'Murat Usta','2026-07-06T06:10:00'),
('bf6','Zeytin Çeşitleri','Yeşil ve siyah zeytin, isteğe bağlı otlu.','[]','cold','in_stock',true,'ready',null,'Murat Usta','2026-07-06T06:05:00'),
('bf7','Mevsim Meyve Tabağı','Günlük taze kesilmiş mevsim meyveleri.','[]','fruit','in_stock',true,'ready',null,'Murat Usta','2026-07-06T06:15:00'),
('bf8','Türk Kahvesi','Geleneksel usul, lokum eşliğinde.','[]','drink','in_stock',true,'ready',90,'Zeynep Yıldız','2026-07-05T09:00:00'),
('bf9','Taze Sıkma Portakal Suyu','100% doğal, günlük taze sıkım.','[]','drink','in_stock',true,'ready',130,'Zeynep Yıldız','2026-07-05T09:00:00'),
('bf10','Bal & Kaymak','Ev yapımı kaymak ve çiçek balı.','["Süt"]','extra','out_of_stock',false,'finished',null,'Murat Usta','2026-07-06T07:40:00')
on conflict (id) do nothing;

insert into roles (id, name, description, permissions) values
('super_admin','Super Admin / Otel Sahibi','Sistemin tamamına erişebilir: odalar, fiyatlar, menüler, personel, roller ve otel ayarları.','["view_dashboard","manage_rooms","update_room_status","manage_room_cleaning_status","manage_requests","assign_requests","update_request_status","manage_menu","edit_prices","manage_breakfast_menu","add_breakfast_item","toggle_item_availability","manage_staff","manage_roles","view_reports","manage_qr_codes","manage_hotel_settings","manage_reservations"]'),
('hotel_manager','Otel Yöneticisi','Günlük operasyonu yönetir: oda doluluğu, fiyatlar, menüler, talep atama ve raporlar.','["view_dashboard","manage_rooms","update_room_status","manage_room_cleaning_status","manage_requests","assign_requests","update_request_status","manage_menu","edit_prices","manage_breakfast_menu","add_breakfast_item","toggle_item_availability","view_reports","manage_qr_codes","manage_reservations"]'),
('reception','Resepsiyon','Oda durumlarını görür, check-in/check-out yapar, talepleri ilgili departmana yönlendirir.','["manage_requests","assign_requests","update_room_status","manage_reservations"]'),
('housekeeping','Housekeeping / Temizlik','Kendisine atanan temizlik görevlerini görür ve oda temizlik durumunu günceller.','["manage_room_cleaning_status","update_request_status"]'),
('technical','Teknik Servis','Teknik destek taleplerini görür, üstlenir ve not ekler.','["update_request_status"]'),
('room_service','Room Service','Oda servisi siparişlerini görür ve hazırlanıyor/yolda/teslim edildi durumlarını günceller.','["update_request_status"]'),
('chef','Aşçı / Mutfak Personeli','Kahvaltı menüsünü ve stok durumunu yönetir; fiyat değişikliği için yönetici onayı gerekir.','["manage_breakfast_menu","add_breakfast_item","toggle_item_availability","update_request_status"]'),
('spa','Spa Personeli','Spa rezervasyonlarını ve hizmetlerin aktif/pasif durumunu yönetir.','["toggle_item_availability","update_request_status"]')
on conflict (id) do nothing;

insert into qr_tokens (room_number, token, generated_at)
select number, 'qr-' || substr(md5(number || now()::text), 1, 12), now() from rooms
on conflict (room_number) do nothing;

insert into hotel_info (id, hotel_name, tagline, wifi_name, wifi_password, breakfast_hours, pool_hours, spa_hours, restaurant_hours, check_in_time, check_out_time, parking_info, emergency_numbers, hotel_rules, floor_plan_note, address, heritage_title, heritage_paragraphs) values
(1,'HotelFlow Bosphorus Residence','Boğaz manzaralı premium konaklama deneyimi','HotelFlow-Guest','bosphorus2026','07:00 – 10:30','08:00 – 20:00','09:00 – 21:00','12:00 – 23:00','14:00','12:00','Vale hizmeti otel girişinde ücretsizdir. Açık otopark B1 katındadır, 7/24 güvenlik kamerası ile izlenir.',
 '[{"label":"Resepsiyon (7/24)","number":"0212 555 01 00"},{"label":"Otel Güvenliği","number":"0212 555 01 01"},{"label":"Doktor Çağrısı","number":"0212 555 01 02"},{"label":"İtfaiye","number":"110"},{"label":"Ambulans","number":"112"},{"label":"Polis","number":"155"}]',
 '["Check-in saati 14:00, check-out saati 12:00''dir.","Odalarda sigara içilmesi yasaktır; ihlal durumunda temizlik ücreti uygulanır.","Evcil hayvan kabulü sadece belirli odalarda ve ön onay ile mümkündür.","Sessiz saatler 23:00 – 07:00 arasıdır.","Havuz ve spa alanlarında havlu kullanımı zorunludur."]',
 'Asansörler lobiden 1-7. katlara hizmet verir. Yangın merdivenleri her katın koridor sonunda yeşil tabela ile işaretlidir. Spa ve havuz alanı zemin kata, restoran ise 1. kata konumlanmıştır.',
 'Sahil Cd. No:42, Beşiktaş, İstanbul','Boğaziçi’nde Bir Miras',
 '["HotelFlow Bosphorus Residence, yüzyıllık yalıların art arda sıralandığı bir sahil şeridinde, 1920’lerin zarafetini modern konaklama anlayışıyla buluşturur.","Kat hizmetlerinden concierge ekibine kadar her personel, misafirlerin taleplerini dakikalar içinde karşılamak üzere eğitildi."]'
)
on conflict (id) do nothing;

insert into service_items (id, category_id, group_name, name, description, price, currency, image, available, stock, prep_time_minutes, department) values
('m1','cat-restaurant','Kahvaltı','Serpme Kahvaltı Tabağı','Peynir çeşitleri, zeytin, reçel, bal, kaymak, taze ekmek sepeti.',420,'TRY','🍳',true,'in_stock',25,'room_service'),
('m2','cat-restaurant','Kahvaltı','Omlet Tabağı','Peynirli, mantarlı veya sade omlet, yanında patates ve marul.',220,'TRY','🍽️',true,'in_stock',15,'room_service'),
('m3','cat-restaurant','Sıcak İçecekler','Türk Kahvesi','Geleneksel usul, lokum eşliğinde.',90,'TRY','☕',true,'in_stock',8,'room_service'),
('m4','cat-restaurant','Sıcak İçecekler','Filtre Kahve','Taze demlenmiş filtre kahve.',110,'TRY','☕',true,'in_stock',8,'room_service'),
('m5','cat-restaurant','Soğuk İçecekler','Taze Sıkma Portakal Suyu','100% doğal, günlük taze sıkım.',130,'TRY','🍊',true,'in_stock',6,'room_service'),
('m6','cat-restaurant','Soğuk İçecekler','Soğuk Limonata','Nane yapraklı ev yapımı limonata.',100,'TRY','🍋',true,'in_stock',6,'room_service'),
('m7','cat-restaurant','Ana Yemekler','Izgara Somon','Sebzeli pilav eşliğinde, limon soslu.',620,'TRY','🐟',true,'in_stock',30,'room_service'),
('m8','cat-restaurant','Ana Yemekler','Dana Bonfile','Közlenmiş sebze ve patates püresi ile.',780,'TRY','🥩',true,'in_stock',35,'room_service'),
('m9','cat-restaurant','Ana Yemekler','Truf Mantarlı Risotto','Parmesan ve beyaz truf yağı ile.',480,'TRY','🍚',false,'out_of_stock',28,'room_service'),
('m10','cat-restaurant','Tatlılar','Fıstıklı Cheesecake','Ev yapımı, Antep fıstıklı sos ile.',260,'TRY','🍰',true,'in_stock',10,'room_service'),
('m11','cat-restaurant','Tatlılar','Sıcak Çikolatalı Sufle','Vanilyalı dondurma eşliğinde.',240,'TRY','🍫',true,'in_stock',18,'room_service'),
('mb1','cat-minibar','Atıştırmalık','Karışık Kuruyemiş','50g, tuzsuz karışık kuruyemiş.',140,'TRY','🥜',true,'in_stock',10,'room_service'),
('mb2','cat-minibar','Atıştırmalık','Çikolata Çeşitleri','Bitter / sütlü çikolata seçenekleri.',120,'TRY','🍫',true,'in_stock',10,'room_service'),
('mb3','cat-minibar','İçecek','Su (Cam Şişe)','750ml doğal kaynak suyu.',60,'TRY','💧',true,'in_stock',10,'room_service'),
('mb4','cat-minibar','İçecek','Meşrubat Çeşitleri','Kola, gazoz, soda (33cl).',90,'TRY','🥤',true,'in_stock',10,'room_service'),
('mb5','cat-minibar','Alkollü İçecek','Yerli Bira (33cl)','Soğuk servis.',160,'TRY','🍺',true,'in_stock',10,'room_service'),
('mb6','cat-minibar','Alkollü İçecek','Mini Şarap Şişesi (187ml)','Kırmızı veya beyaz.',280,'TRY','🍷',false,'out_of_stock',10,'room_service'),
('sp1','cat-spa','Masaj','İsveç Masajı (50 dk)','Tüm vücut rahatlatıcı masaj.',1400,'TRY','💆',true,'in_stock',50,'spa'),
('sp2','cat-spa','Masaj','Derin Doku Masajı (50 dk)','Kas gerginliğine odaklı yoğun masaj.',1600,'TRY','💆‍♂️',true,'in_stock',50,'spa'),
('sp3','cat-spa','Bakım','Aydınlatıcı Yüz Bakımı','Cilt tipine özel bakım seti.',1200,'TRY','🧖',true,'in_stock',45,'spa'),
('sp4','cat-spa','Isıtma & Buhar','Sauna & Buhar Odası (60 dk)','Özel seans rezervasyonu.',700,'TRY','🧖‍♀️',true,'in_stock',60,'spa')
on conflict (id) do nothing;

-- guest_requests seed'i bilinçli olarak boş bırakıldı — uygulama ilk açıldığında
-- gerçek misafir talebi akışını sıfırdan göstermesi daha ikna edici bir demo olur.
