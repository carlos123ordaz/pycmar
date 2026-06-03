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

-- NOTA: borrar los buckets manualmente en Supabase > Storage antes de continuar
-- (product-images, category-images, vouchers) — no se pueden eliminar con SQL directo.


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

-- Pedidos
create table public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  payment_intent_id   text unique,               -- solo Stripe; nullable para Yape/Transfer
  payment_method      text not null default 'stripe', -- stripe | yape | transfer
  amount              integer not null,           -- centimos PEN
  currency            text not null default 'pen',
  status              text not null default 'paid', -- paid | pending_payment | processing | shipped | delivered | cancelled
  customer_email      text,
  items               jsonb not null default '[]',
  voucher_url         text,
  billing_name        text,
  billing_last_name   text,
  billing_country     text,
  billing_email       text,
  billing_address     text,
  billing_phone       text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
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

-- Storage buckets (skip if already exist)
insert into storage.buckets (id, name, public) values
  ('product-images',  'product-images',  true),
  ('category-images', 'category-images', true),
  ('vouchers',        'vouchers',        true)
on conflict (id) do nothing;

-- Storage policies (drop first to avoid duplicate errors)
do $$ begin
  drop policy if exists "product_images_public_read"  on storage.objects;
  drop policy if exists "product_images_admin_write"  on storage.objects;
  drop policy if exists "category_images_public_read" on storage.objects;
  drop policy if exists "category_images_admin_write" on storage.objects;
  drop policy if exists "vouchers_anon_upload"        on storage.objects;
  drop policy if exists "vouchers_public_read"        on storage.objects;
end $$;

create policy "product_images_public_read"   on storage.objects for select  using (bucket_id = 'product-images');
create policy "product_images_admin_write"   on storage.objects for all     to authenticated using (bucket_id = 'product-images')  with check (bucket_id = 'product-images');
create policy "category_images_public_read"  on storage.objects for select  using (bucket_id = 'category-images');
create policy "category_images_admin_write"  on storage.objects for all     to authenticated using (bucket_id = 'category-images') with check (bucket_id = 'category-images');
create policy "vouchers_anon_upload"         on storage.objects for insert  with check (bucket_id = 'vouchers');
create policy "vouchers_public_read"         on storage.objects for select  using (bucket_id = 'vouchers');


-- ── 3. SEED ──────────────────────────────────────────────────
-- Los inserts de categorías y productos están en supabase/seed.sql
-- Ejecutar después de este script: psql ... -f seed.sql
