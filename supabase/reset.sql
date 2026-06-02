-- ============================================================
-- PYCMAR — Reset completo (drop → create → seed)
-- Ejecutar en: Supabase > SQL Editor
-- ADVERTENCIA: elimina TODOS los datos existentes
-- ============================================================


-- ── 1. DROP ──────────────────────────────────────────────────

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.shipment_documents cascade;
drop table if exists public.shipment_events    cascade;
drop table if exists public.shipments          cascade;
drop table if exists public.orders             cascade;
drop table if exists public.quote_items        cascade;
drop table if exists public.quotes             cascade;
drop table if exists public.product_images     cascade;
drop table if exists public.products           cascade;
drop table if exists public.categories         cascade;
drop table if exists public.profiles           cascade;
drop table if exists public.contact_requests   cascade;

delete from storage.objects  where bucket_id in ('product-images', 'category-images');
delete from storage.buckets  where id        in ('product-images', 'category-images');


-- ── 2. SCHEMA ────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- Categorías
create table public.categories (
  id             uuid primary key default uuid_generate_v4(),
  slug           text not null unique,
  name_es        text not null,
  name_en        text not null default '',
  description_es text default '',
  description_en text default '',
  image_url      text,
  order_index    int  not null default 0,
  created_at     timestamptz default now()
);

alter table public.categories enable row level security;
create policy "categories_public_read"  on public.categories for select               using (true);
create policy "categories_admin_write"  on public.categories for all    to authenticated using (true) with check (true);

-- Productos
create table public.products (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null unique,
  category_id     uuid references public.categories(id) on delete set null,
  name_es         text not null,
  name_en         text not null default '',
  scientific_name text,
  description_es  text not null default '',
  description_en  text not null default '',
  blurb_es        text,
  blurb_en        text,
  price           numeric(10,2) not null default 0,
  tags            text[] not null default '{}',
  origin          text,
  fao_zone        text,
  presentation    text,
  packaging       text,
  sizing          text,
  measures        text,
  featured        boolean not null default false,
  retail          boolean not null default true,
  active          boolean not null default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.products enable row level security;
create policy "products_public_read"   on public.products for select               using (active = true);
create policy "products_admin_write"   on public.products for all    to authenticated using (true) with check (true);

-- Imágenes de producto
create table public.product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid references public.products(id) on delete cascade,
  url         text not null,
  order_index int  not null default 0,
  is_main     boolean not null default false,
  created_at  timestamptz default now()
);

alter table public.product_images enable row level security;
create policy "product_images_public_read"  on public.product_images for select               using (true);
create policy "product_images_admin_write"  on public.product_images for all    to authenticated using (true) with check (true);

-- Perfiles de usuario
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  empresa    text,
  pais       text,
  tipo       text default 'retail',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_own_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cotizaciones
create table public.quotes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete set null,
  status     text not null default 'pending',
  notes      text,
  created_at timestamptz default now()
);

create table public.quote_items (
  id          uuid primary key default uuid_generate_v4(),
  quote_id    uuid references public.quotes(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  quantity_kg numeric(10,2) not null default 0,
  unit_price  numeric(10,2) not null default 0
);

alter table public.quotes      enable row level security;
alter table public.quote_items enable row level security;
create policy "quotes_own_read"   on public.quotes for select using (auth.uid() = user_id);
create policy "quotes_own_insert" on public.quotes for insert with check (auth.uid() = user_id);
create policy "quote_items_read"  on public.quote_items for select using (
  exists (select 1 from public.quotes q where q.id = quote_id and q.user_id = auth.uid())
);

-- Solicitudes de contacto
create table public.contact_requests (
  id           uuid primary key default uuid_generate_v4(),
  nombre       text not null,
  email        text not null,
  empresa      text,
  pais         text,
  tipo_cliente text,
  productos    text,
  volumen      text,
  mensaje      text not null,
  leido        boolean default false,
  created_at   timestamptz default now()
);

alter table public.contact_requests enable row level security;
create policy "contact_requests_public_insert" on public.contact_requests for insert              with check (true);
create policy "contact_requests_admin_all"     on public.contact_requests for all    to authenticated using (true) with check (true);

-- Pedidos (creados por el webhook de Stripe)
create table public.orders (
  id                uuid primary key default uuid_generate_v4(),
  payment_intent_id text unique not null,
  amount            integer not null,           -- centimos PEN
  currency          text not null default 'pen',
  status            text not null default 'paid', -- paid | processing | shipped | delivered | cancelled
  customer_email    text,
  items             jsonb not null default '[]',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.orders enable row level security;
create policy "orders_anon_insert"  on public.orders for insert              with check (true);
create policy "orders_admin_select" on public.orders for select to authenticated using (true);
create policy "orders_admin_update" on public.orders for update to authenticated using (true);
create policy "orders_admin_delete" on public.orders for delete to authenticated using (true);

-- Embarques / logística
create table public.shipments (
  id                  uuid primary key default uuid_generate_v4(),
  order_id            uuid references public.orders(id) on delete set null,
  status              text not null default 'pending', -- pending | preparing | in_transit | delivered | cancelled
  destination_country text,
  destination_city    text,
  carrier             text,
  tracking_number     text,
  temp_min            numeric(4,1),   -- °C
  temp_max            numeric(4,1),   -- °C
  dispatch_date       date,
  estimated_arrival   date,
  actual_arrival      date,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.shipments enable row level security;
create policy "shipments_admin_all" on public.shipments for all to authenticated using (true) with check (true);

-- Eventos de embarque (timeline)
create table public.shipment_events (
  id          uuid primary key default uuid_generate_v4(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  event_type  text not null, -- created | status_change | temperature_log | document_added | location_update | note
  description text not null,
  location    text,
  temperature numeric(4,1),
  created_at  timestamptz default now()
);

alter table public.shipment_events enable row level security;
create policy "shipment_events_admin_all" on public.shipment_events for all to authenticated using (true) with check (true);

-- Documentos de exportación por embarque
create table public.shipment_documents (
  id          uuid primary key default uuid_generate_v4(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  doc_type    text not null, -- guia_remision | packing_list | cert_origen | factura | sanitario | otro
  name        text not null,
  file_url    text,
  notes       text,
  issued_at   date,
  created_at  timestamptz default now()
);

alter table public.shipment_documents enable row level security;
create policy "shipment_documents_admin_all" on public.shipment_documents for all to authenticated using (true) with check (true);

-- Storage
insert into storage.buckets (id, name, public) values
  ('product-images',  'product-images',  true),
  ('category-images', 'category-images', true);

create policy "product_images_public_read"   on storage.objects for select  using (bucket_id = 'product-images');
create policy "product_images_admin_write"   on storage.objects for all     to authenticated using (bucket_id = 'product-images')  with check (bucket_id = 'product-images');
create policy "category_images_public_read"  on storage.objects for select  using (bucket_id = 'category-images');
create policy "category_images_admin_write"  on storage.objects for all     to authenticated using (bucket_id = 'category-images') with check (bucket_id = 'category-images');


-- ── 3. SEED ──────────────────────────────────────────────────

insert into public.categories (slug, name_es, name_en, description_es, description_en, order_index) values
  ('pota',       'Pota',            'Giant Squid',        'Dosidicus gigas — el corazón de nuestra exportación.',         'Dosidicus gigas — the core of our export line.',            1),
  ('calamar',    'Calamar y Sepia', 'Squid & Cuttlefish', 'Loligo entero y sepia, congelado en bloque o IQF.',            'Whole loligo and cuttlefish, block-frozen or IQF.',          2),
  ('pescado',    'Pescados',        'Fish',               'Pelágicos y de fondo, enteros, HGT y en filete.',             'Pelagic and demersal — whole, HGT and filleted.',            3),
  ('marisco',    'Mariscos',        'Shellfish',          'Pulpo, langosta y concha de abanico de primera.',             'Octopus, lobster and premium scallops.',                     4),
  ('ovas',       'Ovas',            'Roe',                'Ovas de pez volador en bloque, sin ovas negras.',             'Flying fish roe in block, no black roe.',                    5),
  ('preparados', 'Preparados',      'Value-Added',        'Prefritos y mixtos listos para servicio.',                    'Pre-fried and ready-to-serve seafood mixes.',                6);

-- POTA (14)
insert into public.products
  (slug, category_id, name_es, name_en, scientific_name,
   description_es, description_en, blurb_es, blurb_en,
   price, tags, origin, fao_zone, presentation, packaging, sizing, measures, featured, retail, active)
values
('botones',      (select id from public.categories where slug='pota'),
 'Botones de Pota','Giant Squid Buttons','Dosidicus gigas',
 'Anillos cerrados de manto, parejos y firmes. El formato más versátil para anticuchos y salteados.',
 'Closed mantle rings, even and firm. The most versatile cut for grilling and stir-fry.',
 'Anillos cerrados de manto, parejos y firmes. El formato más versátil para anticuchos y salteados.',
 'Closed mantle rings, even and firm. The most versatile cut for grilling and stir-fry.',
 16.50, ARRAY['IQF','Bloque'],'Perú','87','Con o sin membrana',
 'IQF a granel en cajas de 15 kg (3 bolsas de 5 kg) · Bloques en saco de 20 kg (2×10 kg)',
 null,'Grosor 0,7–1,5 cm · Diámetro 2,2 cm', true, true, true),

('recortes',     (select id from public.categories where slug='pota'),
 'Recortes de Pota','Giant Squid Bits & Pieces','Dosidicus gigas',
 'Trozos de manto ideales para mezclas, conservas y harinas proteicas.',
 'Mantle pieces ideal for blends, canning and protein meal.',
 'Trozos de manto ideales para mezclas, conservas y harinas proteicas.',
 'Mantle pieces ideal for blends, canning and protein meal.',
 11.00, ARRAY['Bloque'],'Perú','87','Con o sin membrana',
 'Saco de 20 kg: 2 bloques de 10 kg',
 null, null, false, true, true),

('filete',       (select id from public.categories where slug='pota'),
 'Filete de Pota','Giant Squid Fillet','Dosidicus gigas',
 'Manto abierto en lámina entera. Base para anillas, tiras y porciones a medida.',
 'Open whole mantle sheet. The base for rings, strips and custom portions.',
 'Manto abierto en lámina entera. Base para anillas, tiras y porciones a medida.',
 'Open whole mantle sheet. The base for rings, strips and custom portions.',
 14.00, ARRAY['Bloque'],'Perú','87','Con membrana y telilla o sin',
 'Saco de 20 kg: 2 bloques de 10 kg',
 'De 1 a 2 kg · de 2 a 4 kg','Grosor 1,8–2,3 cm', true, true, true),

('daruma',       (select id from public.categories where slug='pota'),
 'Daruma (Boin Boiled Fillet)','Daruma — Boiled Fillet','Dosidicus gigas',
 'Filete precocido estilo japonés, listo para mercados premium de Asia.',
 'Japanese-style pre-cooked fillet, ready for premium Asian markets.',
 'Filete precocido estilo japonés, listo para mercados premium de Asia.',
 'Japanese-style pre-cooked fillet, ready for premium Asian markets.',
 19.00, ARRAY['Bloque','Cocido'],'Perú','87','Cocido · sin membrana ni telilla',
 'Saco de 21 kg: 3 bloques de 7 kg',
 null,'Grosor 0,8–1,2 cm', false, true, true),

('steak-oval',   (select id from public.categories where slug='pota'),
 'Steak Oval de Pota IQF','Oval Squid Steak IQF','Dosidicus gigas',
 'Steak ovalado de corte limpio, presentación de retail.',
 'Clean-cut oval steak, retail-ready presentation.',
 'Steak ovalado de corte limpio, presentación de retail.',
 'Clean-cut oval steak, retail-ready presentation.',
 17.50, ARRAY['IQF'],'Perú','87','Sin membrana ni telilla',
 'Caja de 30 lb: 6 cajas de 5 lb',
 null,'Grosor 0,85–1,2 cm', false, true, true),

('valencia',     (select id from public.categories where slug='pota'),
 'Filete Corte Valencia','Valencia Fillet Cut','Dosidicus gigas',
 'Corte rectangular calibrado para el mercado español.',
 'Calibrated rectangular cut for the Spanish market.',
 'Corte rectangular calibrado para el mercado español.',
 'Calibrated rectangular cut for the Spanish market.',
 15.50, ARRAY['Bloque'],'Perú','87','Sin membrana ni telilla',
 'Saco/caja de 20 kg (2×10 kg) · 22,5 kg (3×7,5 kg)',
 null,'Largo 15–25 cm · ancho 8–12 cm · grosor 0,8–1,2 cm', false, true, true),

('anillas',      (select id from public.categories where slug='pota'),
 'Anillas de Pota','Giant Squid Rings','Dosidicus gigas',
 'Anillas calibradas, blancas o amarillas, para empanizado y conserva.',
 'Calibrated rings, white or yellow, for breading and canning.',
 'Anillas calibradas, blancas o amarillas, para empanizado y conserva.',
 'Calibrated rings, white or yellow, for breading and canning.',
 18.00, ARRAY['IQF','Bloque'],'Perú','87','Anillas blancas o amarillas, con o sin membrana',
 'Bloque 26 kg (4×6,5 kg) · IQF a granel 10 kg (4×2,5 kg)',
 null,'Diám. ext. 4,5–7 cm · int. 2,2–4,5 cm', true, true, true),

('alas',         (select id from public.categories where slug='pota'),
 'Alas de Pota','Giant Squid Wings','Dosidicus gigas',
 'Aleta lateral del manto, textura firme y rendidora.',
 'Lateral mantle fin, firm and high-yield.',
 'Aleta lateral del manto, textura firme y rendidora.',
 'Lateral mantle fin, firm and high-yield.',
 12.50, ARRAY['Bloque'],'Perú','87','Enteras, corte por la mitad o en cruz',
 'Saco de 20 kg: 2 bloques de 10 kg',
 '300 gr a más', null, false, true, true),

('nucas',        (select id from public.categories where slug='pota'),
 'Nucas de Pota','Giant Squid Necks','Dosidicus gigas',
 'Unión cabeza-manto, carnosa, para guisos y mixturas.',
 'Head-mantle joint, meaty, for stews and blends.',
 'Unión cabeza-manto, carnosa, para guisos y mixturas.',
 'Head-mantle joint, meaty, for stews and blends.',
 13.00, ARRAY['Bloque'],'Perú','87', null,
 'Saco de 20 kg: 2 bloques de 10 kg',
 '100–300 · 300–500 · 500–700 gr · 700 gr a más', null, false, true, true),

('tentaculos',   (select id from public.categories where slug='pota'),
 'Tentáculos de Pota','Giant Squid Tentacles','Dosidicus gigas',
 'Corte bailarina limpio, sin uñas ni ventosas.',
 'Clean ballerina cut, no nails or suckers.',
 'Corte bailarina limpio, sin uñas ni ventosas.',
 'Clean ballerina cut, no nails or suckers.',
 13.50, ARRAY['Bloque'],'Perú','87','Corte bailarina, sin uñas ni ventosas',
 'Saco de 20 kg: 2 bloques de 10 kg',
 null, null, false, true, true),

('rodaja-rejo',  (select id from public.categories where slug='pota'),
 'Rodajas de Rejo','Giant Squid Tentacle Slices','Dosidicus gigas',
 'Rodaja cocida de rejo, lista para tapas y ensaladas.',
 'Cooked tentacle slice, ready for tapas and salads.',
 'Rodaja cocida de rejo, lista para tapas y ensaladas.',
 'Cooked tentacle slice, ready for tapas and salads.',
 21.00, ARRAY['IQF','Cocido'],'Perú','87','Cocido · glaseo a la carta',
 'IQF bolsas 500 gr–1 kg o cajas a granel 7 kg',
 null,'Alto 0,2–0,8 cm · diámetro 1,5–3,5 cm', false, true, true),

('dados',        (select id from public.categories where slug='pota'),
 'Dados de Pota IQF','Giant Squid Cubes IQF','Dosidicus gigas',
 'Cubo regular de 2 cm, ideal para brochetas y mixtos.',
 'Even 2 cm cube, ideal for skewers and mixes.',
 'Cubo regular de 2 cm, ideal para brochetas y mixtos.',
 'Even 2 cm cube, ideal for skewers and mixes.',
 15.00, ARRAY['IQF'],'Perú','87','Con o sin membrana',
 'A granel cajas 7 kg o bolsas 500 gr–1 kg',
 null,'Alto 2 cm · ancho 2 cm · grosor natural', false, true, true),

('rabas',        (select id from public.categories where slug='pota'),
 'Rabas de Pota IQF','Giant Squid Sticks IQF','Dosidicus gigas',
 'Bastón fino para freír — la raba clásica de barra.',
 'Fine stick for frying — the classic bar-style raba.',
 'Bastón fino para freír — la raba clásica de barra.',
 'Fine stick for frying — the classic bar-style raba.',
 15.50, ARRAY['IQF'],'Perú','87','Con o sin membrana y telilla',
 'A granel cajas 7 kg o bolsas 500 gr–1 kg',
 null,'Largo 6–8 cm · ancho 1 cm · grosor natural', true, true, true),

('tiras',        (select id from public.categories where slug='pota'),
 'Tiras de Pota IQF','Giant Squid Strips IQF','Dosidicus gigas',
 'Tira ancha para salteados y woks de alto volumen.',
 'Wide strip for stir-fry and high-volume woks.',
 'Tira ancha para salteados y woks de alto volumen.',
 'Wide strip for stir-fry and high-volume woks.',
 15.00, ARRAY['IQF'],'Perú','87','Con o sin membrana y telilla',
 'A granel cajas 7 kg o bolsas 500 gr–1 kg',
 null,'Largo 8–12 cm · ancho 2 cm · grosor natural', false, true, true);

-- CALAMAR (2)
insert into public.products
  (slug, category_id, name_es, name_en, scientific_name,
   description_es, description_en, blurb_es, blurb_en,
   price, tags, origin, fao_zone, presentation, packaging, sizing, measures, featured, retail, active)
values
('loligo',       (select id from public.categories where slug='calamar'),
 'Calamar Loligo','Loligo Squid','Doryteuthis gahi',
 'Calamar pota chica entero, dulce y tierno, talla de mercado.',
 'Whole small squid, sweet and tender, market grade.',
 'Calamar pota chica entero, dulce y tierno, talla de mercado.',
 'Whole small squid, sweet and tender, market grade.',
 22.00, ARRAY['Bloque'],'Perú','87','Entero',
 'Sacos de 20 kg: 2 bloques de 10 kg',
 null, null, true, true, true),

('sepia',        (select id from public.categories where slug='calamar'),
 'Sepia','Cuttlefish','Sepia officinalis',
 'Sepia entera IQF, carne blanca y compacta.',
 'Whole IQF cuttlefish, white compact meat.',
 'Sepia entera IQF, carne blanca y compacta.',
 'Whole IQF cuttlefish, white compact meat.',
 24.00, ARRAY['IQF'],'África','34','Entero',
 'A granel en cajas, bloque o bolsas de 80 gr a 1 kg',
 null, null, false, true, true);

-- PESCADOS (10)
insert into public.products
  (slug, category_id, name_es, name_en, scientific_name,
   description_es, description_en, blurb_es, blurb_en,
   price, tags, origin, fao_zone, presentation, packaging, sizing, measures, featured, retail, active)
values
('mahimahi',     (select id from public.categories where slug='pescado'),
 'Mahi Mahi (Dorado)','Mahi Mahi (Dorado)','Coryphaena hippurus',
 'Dorado de altura, filete firme y bajo en grasa. Estrella de exportación a EE.UU.',
 'Open-water dorado, firm low-fat fillet. An export star to the USA.',
 'Dorado de altura, filete firme y bajo en grasa. Estrella de exportación a EE.UU.',
 'Open-water dorado, firm low-fat fillet. An export star to the USA.',
 34.00, ARRAY['IQF'],'Perú · Ecuador','87',
 'Filetes con piel, flechas sin piel y porciones',
 'IVP en cajas de 25 o 50 lb',
 'Filete con piel 3–5 / 5–7 / 7–9 lb · porciones', null, true, true, true),

('anchoveta',    (select id from public.categories where slug='pescado'),
 'Anchoveta Peruana','Peruvian Sardine','Engraulis ringens',
 'Pelágico azul peruano, alto omega-3, para conserva y curado.',
 'Peruvian blue pelagic, high omega-3, for canning and curing.',
 'Pelágico azul peruano, alto omega-3, para conserva y curado.',
 'Peruvian blue pelagic, high omega-3, for canning and curing.',
 6.50, ARRAY['Bloque'],'Perú','87','Entera con branquias y vísceras',
 'Sacos de 20 kg: 2 bloques de 10 kg',
 'Entera 12 cm/pz a más', null, false, true, true),

('sardina-vz',   (select id from public.categories where slug='pescado'),
 'Sardina Venezolana','Venezuelan Sardine','Sardinella aurita',
 'Sardina del Caribe, entera o eviscerada, lista para conserva.',
 'Caribbean sardine, whole or gutted, canning-ready.',
 'Sardina del Caribe, entera o eviscerada, lista para conserva.',
 'Caribbean sardine, whole or gutted, canning-ready.',
 7.00, ARRAY['Bloque'],'Venezuela','31','Entera y eviscerada',
 'Sacos de 20 kg: 2 bloques de 10 kg',
 null, null, false, true, true),

('rape',         (select id from public.categories where slug='pescado'),
 'Rape (Monkfish)','Monkfish','Lophius americanus',
 'Cola de rape de carne magra y firme, gourmet europeo.',
 'Lean firm monkfish tail, a European gourmet cut.',
 'Cola de rape de carne magra y firme, gourmet europeo.',
 'Lean firm monkfish tail, a European gourmet cut.',
 38.00, ARRAY['IQF'],'África','34','Entero IWP eviscerado · cola sin piel HGT',
 'Cajas de 20 kg',
 'Cola 250 gr a 2 kg a más', null, true, true, true),

('cachua',       (select id from public.categories where slug='pescado'),
 'Cachua (Leatherjacket)','Leatherjacket Filefish','Aluterus monoceros',
 'Pez ballesta de carne blanca, excelente rendimiento en HGT.',
 'White-meat filefish, great HGT yield.',
 'Pez ballesta de carne blanca, excelente rendimiento en HGT.',
 'White-meat filefish, great HGT yield.',
 12.00, ARRAY['IQF','Bloque'],'Venezuela','31','HGT o WR',
 'Cajas de 10 kg',
 'Entero 0,5–6 kg a más', null, false, true, true),

('tahali',       (select id from public.categories where slug='pescado'),
 'Tahalí (Pez Sable)','Ribbonfish','Trichiurus lepturus',
 'Pez cinta plateado, muy demandado en mercados asiáticos.',
 'Silver ribbonfish, in high demand across Asian markets.',
 'Pez cinta plateado, muy demandado en mercados asiáticos.',
 'Silver ribbonfish, in high demand across Asian markets.',
 9.50, ARRAY['Bloque'],'Atlántico','31','Entero o HGT en IWP',
 'A granel en cajas de 10 u 8 kg',
 null, null, false, true, true),

('pargo',        (select id from public.categories where slug='pescado'),
 'Pargo Rojo del Caribe','Caribbean Red Snapper','Lutjanus purpureus',
 'Pargo rojo de piel intensa, estrella de mesa premium.',
 'Deep-red snapper, a premium table star.',
 'Pargo rojo de piel intensa, estrella de mesa premium.',
 'Deep-red snapper, a premium table star.',
 29.00, ARRAY['Bloque'],'Caribe','31','Entero WGGS en IWP',
 'Entero en cajas de 10 o 20 lb',
 'S 300–500 · M 500–700 · L 700 gr–1 kg a más', null, false, true, true),

('pejerrey',     (select id from public.categories where slug='pescado'),
 'Pejerrey (Silverside)','Silversmelt','Odontesthes regia',
 'Pejerrey IQF talla pareja, frito o a la plancha.',
 'Even-size IQF silverside, fried or grilled.',
 'Pejerrey IQF talla pareja, frito o a la plancha.',
 'Even-size IQF silverside, fried or grilled.',
 11.00, ARRAY['IQF'],'Perú','87','Entera con branquias · HG y HGT',
 'IQF cajas de 20 lb: 20 bolsas de 1 lb',
 'Entera 12 cm/pz a más', null, false, true, true),

('corvina',      (select id from public.categories where slug='pescado'),
 'Corvina Amarilla','Yellow Corvina','Cynoscion analis',
 'Corvina de carne magra, filete IVP sin espinas.',
 'Lean corvina, boneless IVP fillet.',
 'Corvina de carne magra, filete IVP sin espinas.',
 'Lean corvina, boneless IVP fillet.',
 26.00, ARRAY['IQF'],'Atlántico','31','Entero o filete sin espinas',
 'IVP filetes en cajas de 10, 20 o 60 lb',
 'Filete 4–6 / 6–8 / 8–10 / 10–12 oz', null, false, true, true),

('pez-sierra',   (select id from public.categories where slug='pescado'),
 'Pez Sierra (Kingfish)','Kingfish','Scomberomorus sierra',
 'Sierra firme en ruedas, ideal para grill y ceviche.',
 'Firm kingfish steaks, ideal for grill and ceviche.',
 'Sierra firme en ruedas, ideal para grill y ceviche.',
 'Firm kingfish steaks, ideal for grill and ceviche.',
 15.00, ARRAY['IQF'],'Pacífico','31','Entero o en ruedas',
 'IWP en cajas de 60 lb',
 'T1 3–5 · T2 5–10 · T3 10–15 lb a más', null, false, true, true);

-- MARISCOS (5)
insert into public.products
  (slug, category_id, name_es, name_en, scientific_name,
   description_es, description_en, blurb_es, blurb_en,
   price, tags, origin, fao_zone, presentation, packaging, sizing, measures, featured, retail, active)
values
('concha',       (select id from public.categories where slug='marisco'),
 'Concha de Abanico','Scallops','Argopecten purpuratus',
 'Concha de abanico de Sechura, dulce y carnosa. Acuicultura certificada.',
 'Sechura bay scallop, sweet and meaty. Certified aquaculture.',
 'Concha de abanico de Sechura, dulce y carnosa. Acuicultura certificada.',
 'Sechura bay scallop, sweet and meaty. Certified aquaculture.',
 42.00, ARRAY['IQF'],'Perú (Sechura)','87',
 'Tallo solo, tallo con coral o media concha',
 'Sin concha 20/30 lb (10×2 lb) · media concha caja máster 10 kg',
 'Media concha 10–20 a 80–100 lb/pz', null, true, true, true),

('langosta',     (select id from public.categories where slug='marisco'),
 'Langosta','Lobster','Panulirus',
 'Langosta cruda entera o cola, calibrada por tallas. Lujo de exportación.',
 'Raw whole lobster or tail, size-graded. Export luxury.',
 'Langosta cruda entera o cola, calibrada por tallas. Lujo de exportación.',
 'Raw whole lobster or tail, size-graded. Export luxury.',
 95.00, ARRAY['IQF'],'Caribe','31','Entera cruda y cola cruda',
 'IWP en cajas',
 'Entera T1 12–14 oz a T10 · cola T1 6 oz a más', null, true, true, true),

('pulpo',        (select id from public.categories where slug='marisco'),
 'Pulpo','Octopus','Octopus mimus',
 'Pulpo entero por tallas, carne tierna. Corte flor a pedido.',
 'Whole octopus graded by size, tender meat. Flower cut on request.',
 'Pulpo entero por tallas, carne tierna. Corte flor a pedido.',
 'Whole octopus graded by size, tender meat. Flower cut on request.',
 33.00, ARRAY['IQF','Bloque'],'Perú · África','34','Entero',
 'Entero en sacos de 20 kg: 2 bloques de 10 kg',
 'Entero T8 0,3 kg a T1 +4 kg · flor', null, true, true, true),

('pulpo-bandeja', (select id from public.categories where slug='marisco'),
 'Pulpo en Bandeja','Octopus on Tray','Octopus mimus',
 'Pulpo entero presentado en bandeja, retail premium.',
 'Whole octopus tray-packed, premium retail.',
 'Pulpo entero presentado en bandeja, retail premium.',
 'Whole octopus tray-packed, premium retail.',
 36.00, ARRAY['IQF'],'Perú','34','Entero en bandeja',
 '3 a 6 bandejas por caja según talla',
 '1–2 · 2–4 · 4–6 · 6–8 lb a más', null, false, true, true),

('pata-pulpo',   (select id from public.categories where slug='marisco'),
 'Pata de Pulpo Cocida','Cooked Octopus Tentacle','Octopus vulgaris',
 'Pata de pulpo cocida estilo gallego, lista para emplatar.',
 'Galician-style cooked octopus leg, plate-ready.',
 'Pata de pulpo cocida estilo gallego, lista para emplatar.',
 'Galician-style cooked octopus leg, plate-ready.',
 58.00, ARRAY['IQF','Cocido'],'España','34','Cocida',
 'Caja máster: 10 bolsas de 1 lb',
 'T2 3–4 · T3 2–3 · T4 1,5–2 · T5 2 kg a más', null, false, true, true);

-- OVAS (1)
insert into public.products
  (slug, category_id, name_es, name_en, scientific_name,
   description_es, description_en, blurb_es, blurb_en,
   price, tags, origin, fao_zone, presentation, packaging, sizing, measures, featured, retail, active)
values
('ovas',         (select id from public.categories where slug='ovas'),
 'Ovas de Pez Volador','Flying Fish Roe','Cheilopogon',
 'Tobiko natural en bloque, base para sushi y gourmet japonés.',
 'Natural tobiko in block, a base for sushi and Japanese gourmet.',
 'Tobiko natural en bloque, base para sushi y gourmet japonés.',
 'Natural tobiko in block, a base for sushi and Japanese gourmet.',
 48.00, ARRAY['Bloque'],'Perú','87',
 'Ovas individuales en bloque con 10% de sal, sin ovas negras',
 'Sacos de 20 kg: 2 bloques de 10 kg',
 null, null, false, true, true);

-- PREPARADOS (2)
insert into public.products
  (slug, category_id, name_es, name_en, scientific_name,
   description_es, description_en, blurb_es, blurb_en,
   price, tags, origin, fao_zone, presentation, packaging, sizing, measures, featured, retail, active)
values
('romana',       (select id from public.categories where slug='preparados'),
 'Calamar a la Romana','Battered Rings','Dosidicus gigas',
 'Anilla rebozada lista para freír, valor agregado europeo.',
 'Battered ring ready to fry, European value-added.',
 'Anilla rebozada lista para freír, valor agregado europeo.',
 'Battered ring ready to fry, European value-added.',
 19.50, ARRAY['IQF','Prefrito'],'España','87','Prefritas y ultracongeladas',
 'Bolsas de 0,5–1 kg o caja máster de 5 kg',
 null,'Diám. ext. 5–6 cm · int. 2,5–3 cm', true, true, true),

('mix',          (select id from public.categories where slug='preparados'),
 'Preparado de Marisco','Seafood Mix','Mix',
 'Mezcla de mariscos lista para paella, arroces y pastas.',
 'Ready seafood blend for paella, rice and pasta.',
 'Mezcla de mariscos lista para paella, arroces y pastas.',
 'Ready seafood blend for paella, rice and pasta.',
 23.00, ARRAY['IQF'],'España','87',
 'Mejillón, dados mahi mahi, botones de pota, langostino, anilla y rodaja de pota',
 'Caja máster: 10 bolsas de 1 lb',
 null, null, false, true, true);


-- ── 4. VERIFICACIÓN ───────────────────────────────────────────
select 'Categorías'          as tabla, count(*)::text as total from public.categories
union all
select 'Productos',                     count(*)::text from public.products
union all
select 'Destacados',                    count(*)::text from public.products where featured = true
union all
select 'Pedidos (orders)',              count(*)::text from public.orders
union all
select 'Embarques (shipments)',         count(*)::text from public.shipments
union all
select 'Documentos embarque',          count(*)::text from public.shipment_documents;
