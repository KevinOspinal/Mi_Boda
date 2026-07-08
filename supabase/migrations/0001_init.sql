-- ============================================================================
-- Invitación de boda Kevin & Daniela — esquema inicial (single-event)
-- Ejecutar en el SQL Editor de Supabase, o vía `supabase db push`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Invitados ------------------------------------------------------------------
create table if not exists public.guests (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  display_name text not null,
  max_passes   int  not null default 1 check (max_passes >= 0),
  group_label  text,
  opened_at    timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists guests_code_idx on public.guests (code);

-- Confirmaciones (RSVP) — una por invitado (upsert por guest_id) -------------
create table if not exists public.rsvps (
  id             uuid primary key default gen_random_uuid(),
  guest_id       uuid not null references public.guests (id) on delete cascade,
  attending      boolean not null,
  guests_count   int not null default 0 check (guests_count >= 0),
  attendee_names text,
  phone          text,
  dietary        text,
  message        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (guest_id)
);

create index if not exists rsvps_guest_id_idx on public.rsvps (guest_id);

-- Seguridad ------------------------------------------------------------------
-- RLS activo y SIN policies para rol anónimo/authenticated: el acceso ocurre
-- exclusivamente desde el servidor de Nuxt con la service-role key, que
-- omite RLS. Así la lista de invitados nunca es accesible desde el cliente.
alter table public.guests enable row level security;
alter table public.rsvps  enable row level security;

-- Seed demo (Fase 0) ---------------------------------------------------------
insert into public.guests (code, display_name, max_passes, group_label)
values
  ('kevin',   'Kevin',                    2, 'Novios'),
  ('daniela', 'Daniela',                  2, 'Novios'),
  ('jk82ha',  'Fam. Martínez Ramírez',    4, 'Familia')
on conflict (code) do nothing;
