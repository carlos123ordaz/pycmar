-- ============================================================
-- PYCMAR — Schema inicial
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- ── Extensiones ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Categorías ───────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  name_es     text not null,
  name_en     text not null default '',
  description_es text default '',
  description_en text default '',
  image_url   text,
  order_index int  not null default 0,
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;
create policy "categories_public_read" on public.categories for select using (true);

-- ── Productos ────────────────────────────────────────────────
create table if not exists public.products (
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
create policy "products_public_read" on public.products for select using (active = true);

-- ── Imágenes de producto ──────────────────────────────────────
create table if not exists public.product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid references public.products(id) on delete cascade,
  url         text not null,
  order_index int  not null default 0,
  is_main     boolean not null default false,
  created_at  timestamptz default now()
);

alter table public.product_images enable row level security;
create policy "product_images_public_read" on public.product_images for select using (true);

-- ── Perfiles de usuario ───────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  empresa     text,
  pais        text,
  tipo        text default 'retail', -- retail | importador | industria
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_own_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Solicitudes de cotización ────────────────────────────────
create table if not exists public.quotes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete set null,
  status      text not null default 'pending', -- pending | reviewed | accepted | rejected
  notes       text,
  created_at  timestamptz default now()
);

create table if not exists public.quote_items (
  id          uuid primary key default uuid_generate_v4(),
  quote_id    uuid references public.quotes(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  quantity_kg numeric(10,2) not null default 0,
  unit_price  numeric(10,2) not null default 0
);

alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
create policy "quotes_own_read"   on public.quotes for select using (auth.uid() = user_id);
create policy "quotes_own_insert" on public.quotes for insert with check (auth.uid() = user_id);
create policy "quote_items_read"  on public.quote_items for select using (
  exists (select 1 from public.quotes q where q.id = quote_id and q.user_id = auth.uid())
);

-- ── Solicitudes de contacto ───────────────────────────────────
create table if not exists public.contact_requests (
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
-- Solo inserción pública, lectura solo para admin (via service_role)
create policy "contact_requests_insert" on public.contact_requests for insert with check (true);

-- ── Storage buckets ───────────────────────────────────────────
-- Ejecutar en Supabase > Storage > New Bucket
-- Bucket: product-images (public: true)
-- Bucket: category-images (public: true)

insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "category_images_public_read" on storage.objects
  for select using (bucket_id = 'category-images');
