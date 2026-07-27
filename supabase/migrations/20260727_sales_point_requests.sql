create table if not exists public.sales_point_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  email text not null,
  city text not null,
  province text not null,
  group_reference text,
  support_mode text not null,
  can_coordinate_delivery text not null,
  can_coordinate_orders_payments text not null,
  notes text,
  status text not null default 'novo' check (status in ('novo', 'em_contato', 'encerrado')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sales_point_requests enable row level security;

create policy "admin all sales point requests"
on public.sales_point_requests for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
