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

alter table public.pack_requests enable row level security;

create policy "admin all pack requests"
on public.pack_requests for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
