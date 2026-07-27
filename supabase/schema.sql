create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_es text,
  slug text not null unique,
  description text not null,
  description_es text,
  category text not null,
  category_es text,
  price_ars integer not null default 0,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  status text not null default 'disponivel' check (status in ('disponivel', 'poucas_unidades', 'esgotado')),
  featured boolean not null default false,
  main_image_url text not null,
  gallery_urls text[] not null default '{}',
  variations text[] not null default '{}',
  size_guide_enabled boolean not null default false,
  size_guide jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  variation text,
  quantity integer not null default 1,
  first_name text not null,
  last_name text not null,
  whatsapp text not null,
  email text not null,
  city text not null,
  delivery_preference text not null,
  notes text,
  status text not null default 'pendente' check (status in ('pendente', 'realizada', 'cancelada')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_rate_limits (
  fingerprint text primary key,
  attempts integer not null default 1,
  window_started timestamptz not null default now()
);

create table if not exists public.pack_requests (
  id uuid primary key default gen_random_uuid(),
  responsible_name text not null,
  whatsapp text not null,
  email text not null,
  city text not null,
  amount_reference text not null,
  support_type text not null,
  notes text,
  status text not null default 'novo' check (status in ('novo', 'em_contato', 'encerrado')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.form_rate_limits enable row level security;
alter table public.pack_requests enable row level security;

create policy "public read products" on public.products for select using (true);
create policy "admin all products" on public.products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin all orders" on public.orders for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin own profile" on public.profiles for select to authenticated using (id = auth.uid());

revoke all on table public.form_rate_limits from anon, authenticated;

create policy "admin all pack requests"
on public.pack_requests for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = excluded.public;

create policy "public read site assets" on storage.objects
for select using (bucket_id = 'site-assets');

create policy "admin insert site assets" on storage.objects
for insert to authenticated
with check (bucket_id = 'site-assets' and (select public.is_admin()));

create policy "admin update site assets" on storage.objects
for update to authenticated
using (bucket_id = 'site-assets' and (select public.is_admin()))
with check (bucket_id = 'site-assets' and (select public.is_admin()));

create policy "admin delete site assets" on storage.objects
for delete to authenticated
using (bucket_id = 'site-assets' and (select public.is_admin()));
