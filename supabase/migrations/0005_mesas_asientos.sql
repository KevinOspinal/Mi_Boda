-- ============================================================================
-- Distribución de mesas — Boda Kevin & Daniela
-- Crea las tablas `mesas` y `asientos`. Los DATOS los carga un script aparte.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

-- Mesas del salón (6: Mesa de Honor + Mesa 2..6)
create table if not exists public.mesas (
  id         smallint primary key,
  nombre     text not null,
  capacidad  int not null default 10,
  es_honor   boolean not null default false,
  orden      smallint not null
);

-- Asientos: cada persona ubicada en una mesa.
--   guest_id = a qué invitación pertenece (null para novios/pastor).
--   siempre_visible = novios y pastor (se muestran a todos).
create table if not exists public.asientos (
  id              uuid primary key default gen_random_uuid(),
  mesa_id         smallint not null references public.mesas (id) on delete cascade,
  guest_id        uuid references public.guests (id) on delete cascade,
  nombre          text not null,
  siempre_visible boolean not null default false,
  orden           smallint not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists asientos_guest_idx on public.asientos (guest_id);
create index if not exists asientos_mesa_idx on public.asientos (mesa_id);

-- Acceso solo desde el servidor (service-role), como el resto.
alter table public.mesas enable row level security;
alter table public.asientos enable row level security;
