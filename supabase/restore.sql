-- ============================================================================
-- RESTAURACIÓN COMPLETA — Boda Kevin & Daniela
-- ============================================================================
-- Reconstruye la base desde cero sobre un Postgres vacío (Seenode, local, …).
-- Es IDEMPOTENTE: puedes ejecutarlo varias veces sin romper nada.
--
-- Contiene, en orden:
--   1) Migraciones 0001, 0002, 0004, 0005, 0006
--   2) Datos reales exportados el 2026-08-04 (seed_data.sql)
--   3) Limpieza posterior (borra los invitados de demo, ajusta la plantilla)
--
-- ARCHIVO GENERADO — no lo edites a mano.
-- Se regenera con: npm run db:build-restore
--
-- Cómo ejecutarlo:
--   npm run db:restore          (usa NUXT_DATABASE_URL de .env)
--   npm run db:restore -- "postgres://usuario:clave@host:puerto/base?sslmode=require"
-- o pegando este archivo completo en pgAdmin / cualquier editor SQL.
-- ============================================================================

-- pgcrypto es opcional: desde Postgres 13 gen_random_uuid() ya es nativo.
-- Si el proveedor no permite crear extensiones, seguimos sin fallar.
do $ext$
begin
  create extension if not exists "pgcrypto";
exception when others then
  raise notice 'pgcrypto no disponible (se usará gen_random_uuid() nativo): %', sqlerrm;
end
$ext$;

-- ▼▼▼ supabase/migrations/0001_init.sql ▼▼▼

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


-- ▼▼▼ supabase/migrations/0002_invite_distribution.sql ▼▼▼

-- ============================================================================
-- Distribución de invitaciones por link (Kevin & Daniela)
--  - Códigos HÍBRIDOS automáticos: nombre + sufijo aleatorio (privacidad).
--  - Consulta lista para enviar: link personal + mensaje + enlace wa.me.
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de 0001_init.sql.
-- ============================================================================

-- Teléfono opcional por invitado (para enlaces wa.me directos). Sin él, el
-- enlace wa.me abre WhatsApp y deja elegir el contacto.
alter table public.guests add column if not exists phone text;

-- --- Slug sin acentos ------------------------------------------------------
create or replace function public.slugify(input text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(
      input,
      'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
      'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
    )),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

-- --- Código híbrido único: <slug>-<sufijo 3 chars> -------------------------
create or replace function public.gen_invite_code(name text)
returns text language plpgsql as $$
declare
  base   text := coalesce(nullif(public.slugify(name), ''), 'invitado');
  suffix text;
  candidate text;
begin
  loop
    suffix := substr(md5(random()::text), 1, 3);
    candidate := base || '-' || suffix;
    exit when not exists (select 1 from public.guests where code = candidate);
  end loop;
  return candidate;
end;
$$;

-- --- Autogenerar el código al insertar si viene vacío -----------------------
create or replace function public.guests_set_code()
returns trigger language plpgsql as $$
begin
  if new.code is null or new.code = '' then
    new.code := public.gen_invite_code(new.display_name);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guests_set_code on public.guests;
create trigger trg_guests_set_code
  before insert on public.guests
  for each row execute function public.guests_set_code();

-- --- Config del sitio (una sola fila): dominio + plantilla del mensaje ------
create table if not exists public.wedding_settings (
  id           int primary key default 1 check (id = 1),
  site_url     text not null default 'https://REEMPLAZA-CON-TU-DOMINIO',
  invite_message text not null default
    'Hola {name}, Kevin y Daniela se casan 💍 Queremos que seas parte de este día tan especial. Abre tu invitación personal aquí: {link}'
);
insert into public.wedding_settings (id) values (1) on conflict (id) do nothing;

-- --- URL-encode robusto (RFC-3986): codifica byte a byte cualquier carácter
--     no reservado (acentos, ñ, ¿¡, emoji, espacios, saltos de línea, …).
create or replace function public.url_encode(input text)
returns text language sql immutable as $$
  select coalesce(string_agg(enc, '' order by ord), '')
  from regexp_split_to_table(input, '') with ordinality as t(ch, ord),
  lateral (
    select case
      when ch ~ '^[A-Za-z0-9_.~-]$' then ch
      else (
        select string_agg('%' || upper(lpad(to_hex(get_byte(bytes, i)), 2, '0')), '')
        from (select convert_to(ch, 'UTF8') as bytes) b,
             generate_series(0, octet_length(convert_to(ch, 'UTF8')) - 1) as i
      )
    end as enc
  ) e;
$$;

-- --- Vista lista para enviar ------------------------------------------------
-- Uso:  update public.wedding_settings set site_url = 'https://tuboda.com';
--       select * from public.guest_links order by display_name;
create or replace view public.guest_links as
select
  g.display_name,
  g.code,
  g.max_passes,
  g.phone,
  s.site_url || '/invite/' || g.code as invite_url,
  replace(replace(s.invite_message, '{name}', g.display_name),
          '{link}', s.site_url || '/invite/' || g.code) as suggested_message,
  'https://wa.me/' || coalesce(g.phone, '') || '?text=' ||
    public.url_encode(
      replace(replace(s.invite_message, '{name}', g.display_name),
              '{link}', s.site_url || '/invite/' || g.code)
    ) as whatsapp_url
from public.guests g
cross join public.wedding_settings s;

-- La vista se consulta desde el SQL Editor / servidor (service-role).
alter table public.wedding_settings enable row level security;


-- ▼▼▼ supabase/migrations/0004_rsvp_summary.sql ▼▼▼

-- ============================================================================
-- Vista de resumen de confirmaciones (RSVP) para monitorear fácilmente.
-- Ejecutar en el SQL Editor de Supabase. Luego: select * from rsvp_summary;
-- ============================================================================

create or replace view public.rsvp_summary as
select
  g.display_name                               as invitacion,
  g.group_label                                as grupo,
  case
    when r.id is null      then 'Pendiente'
    when r.attending       then 'Confirmado'
    else                        'No asiste'
  end                                          as estado,
  g.max_passes                                 as pases,
  coalesce(r.guests_count, 0)                  as asistentes,
  r.message                                    as mensaje,
  (g.opened_at is not null)                    as vio_invitacion,
  r.updated_at                                 as respondio_en
from public.guests g
left join public.rsvps r on r.guest_id = g.id;

-- Estadísticas rápidas:
--   select
--     count(*) filter (where estado = 'Confirmado')            as confirmados,
--     count(*) filter (where estado = 'No asiste')             as no_asisten,
--     count(*) filter (where estado = 'Pendiente')             as pendientes,
--     count(*) filter (where vio_invitacion)                   as vieron,
--     coalesce(sum(asistentes), 0)                             as personas_confirmadas
--   from public.rsvp_summary;


-- ▼▼▼ supabase/migrations/0005_mesas_asientos.sql ▼▼▼

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


-- ▼▼▼ supabase/migrations/0006_reconfirmacion.sql ▼▼▼

-- ============================================================================
-- Reconfirmación de asistencia — Boda Kevin & Daniela
-- Semanas antes del evento, los invitados que YA confirmaron reconfirman su
-- asistencia. Así se liberan puestos de quien finalmente no podrá ir.
-- Ejecutar en el SQL Editor de Supabase / Postgres destino.
-- ============================================================================

-- Estado de reconfirmación por confirmación (rsvp):
--   null  = aún no reconfirma
--   true  = reconfirmó: sigue asistiendo
--   false = canceló en la reconfirmación (libera el puesto)
alter table public.rsvps add column if not exists reconfirmed    boolean;
alter table public.rsvps add column if not exists reconfirmed_at timestamptz;

-- Control de la ventana de reconfirmación (una sola fila en wedding_settings).
--   reconfirm_override: 'auto'   → abierta si now() >= reconfirm_from
--                       'abrir'  → forzada abierta
--                       'cerrar' → forzada cerrada
alter table public.wedding_settings
  add column if not exists reconfirm_override text not null default 'auto'
    check (reconfirm_override in ('auto', 'abrir', 'cerrar'));

-- Fecha en que se abre automáticamente (por defecto: 15 días antes de la boda).
alter table public.wedding_settings
  add column if not exists reconfirm_from timestamptz not null
    default '2026-09-26 00:00:00-05';

-- Fecha límite sugerida que se muestra al invitado (por defecto: 7 días antes).
alter table public.wedding_settings
  add column if not exists reconfirm_deadline timestamptz
    default '2026-10-04 23:59:00-05';

-- Vista de resumen de reconfirmación para el panel.
create or replace view public.reconfirm_summary as
select
  count(*) filter (where r.attending)                                   as confirmados,
  count(*) filter (where r.attending and r.reconfirmed is true)         as reconfirmados,
  count(*) filter (where r.attending and r.reconfirmed is null)         as por_reconfirmar,
  count(*) filter (where r.attending and r.reconfirmed is false)        as cancelados,
  coalesce(sum(r.guests_count) filter (where r.attending and r.reconfirmed is true), 0)  as personas_seguras,
  coalesce(sum(r.guests_count) filter (where r.attending and coalesce(r.reconfirmed, true)), 0) as personas_vigentes
from public.rsvps r;


-- ▼▼▼ supabase/seed_data.sql ▼▼▼

-- ============================================================================
-- Datos exportados desde Supabase (Boda Kevin & Daniela) — 2026-08-04
-- Ejecutar DESPUÉS de aplicar las migraciones (0001, 0002, 0004, 0005).
-- Orden respeta las llaves foráneas: guests y mesas antes que rsvps/asientos.
-- Los IDs se preservan para no romper las referencias.
-- ============================================================================

-- 1) Invitados ---------------------------------------------------------------
insert into public.guests (id, code, display_name, max_passes, group_label, opened_at, created_at, phone) values
  ('a797267f-a3fb-452a-aa65-43854b730793', 'guillermo-alonso-y-familia-1a5', 'Guillermo, Daniela y familia', 3, 'Familia Alonso', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('bafec6bd-6612-4f03-b2af-8d23e6b4b198', 'leidy-ospinal-y-familia-e7f', 'Jonnathan y Leidy', 3, 'Invitados de honor', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('452bb52a-9fc9-405b-9943-298a5dd2062c', 'alejandro-y-marcela-ospinal-c5d', 'Alejandro y Marcela Ospinal', 2, 'Familia Ospinal', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('979db4ef-b4fc-4d93-a63a-98664cd7c32b', 'luz-mari-ospinal-18f', 'Luz Mari Ospinal', 1, 'Familia Ospinal', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('21601bf7-4a24-4abd-8600-8d2f06c7e39f', 'miyer-escobar-y-carlos-ab2', 'Miyer, Carlos e hijo', 3, 'Familia Escobar', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('72954eb2-e0a6-455f-a2f0-4783da5cb6aa', 'daniel-y-laura-af5', 'Daniel y Laura', 2, 'Invitados', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('b41c8f12-072f-438d-8dfd-11a109398d93', 'rosa-escobar-ca4', 'Rosa Escobar', 1, 'Familia Escobar', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('c6bca0bc-362a-4525-8be2-b48861d91265', 'diana-mendez-y-acompanante-0c5', 'Diana Mendez y Pedro Luis', 2, 'Invitados', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('1d330dfc-4892-415b-90af-8773e92f05da', 'ximena-alonso-y-fredy-fe1', 'Ximena Alonso y Fredy', 2, 'Familia Alonso', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('c89d9db5-3e32-43cb-ac69-df76e0740970', 'miguel-y-nataly-granados-795', 'Miguel y Nataly Granados', 2, 'Familia Granados', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('fb6a33e1-f7df-4bd8-8171-ffa4f06de93f', 'dona-sandra-d87', 'Doña Sandra', 1, 'Invitados', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('784f4d4b-f6d4-455f-9e1c-71e98d9869ed', 'dona-nidia-af0', 'Doña Nidia', 1, 'Invitados', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('ca7730dd-73a9-474b-8c6a-eee34243fd1a', 'alexander-alonso-y-familia-38c', 'Alexander, Luisa y familia', 3, 'Familia Alonso', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('d538db80-f7b4-4569-9847-5ee0a0d3b05e', 'giovany-ospinal-y-familia-4e0', 'Giovany, Ximena y familia', 4, 'Familia Ospinal', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('0bfbfa82-9fcb-4fa6-8461-7161e94feb2f', 'jonny-y-maria-acevedo-85f', 'Jonny y Maria Acevedo', 2, 'Invitados de honor', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('a4901244-7c7e-4cde-b671-98c37259f943', 'cristian-ospinal-d17', 'Cristian Ospinal', 1, 'Familia Ospinal', null, '2026-07-08T23:17:18.374476+00:00', null),
  ('1e782309-ccec-4906-8b08-f7d6567fa152', 'rusbel-y-nancy-ospinal-715', 'Rusbel y Nancy Ospinal', 3, 'Familia Ospinal', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('1a3d332a-af67-47e4-b2a0-f96369ecbe93', 'gloria-munoz-d8c', 'Gloria Muñoz', 1, 'Invitados de honor', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('c34b4a0d-5f98-4a11-8f88-cab600b8c396', 'andres-alonso-y-familia-928', 'Andres, Claudia y familia', 3, 'Familia Alonso', '2026-07-11T02:12:20.751+00:00', '2026-07-08T18:20:10.343621+00:00', null),
  ('07ee9b00-fb9b-4472-8fa4-7f718175752f', 'yoni-y-yulieth-ospinal-y-familia-537', 'Yoni y Yulieth Ospinal y familia', 3, 'Familia Ospinal', null, '2026-07-08T23:17:18.374476+00:00', null),
  ('7760a4a5-d31a-40df-951d-3203ba1874f6', 'mocho-03f', 'Mocho', 1, 'Invitados', null, '2026-07-08T18:20:10.343621+00:00', null),
  ('47793a4a-419a-4613-88b7-33feac1c58cc', 'gilmer-alonso-y-familia-7c3', 'Gilmer, Lorena y familia', 5, 'Familia Alonso', null, '2026-07-08T18:20:10.343621+00:00', null)
on conflict do nothing;

-- 2) Confirmaciones ----------------------------------------------------------
insert into public.rsvps (id, guest_id, attending, guests_count, attendee_names, phone, dietary, message, created_at, updated_at) values
  ('21446fce-cbd9-416b-bdee-4df35ea789fd', 'c34b4a0d-5f98-4a11-8f88-cab600b8c396', true, 3, null, null, null, null, '2026-07-11T02:14:03.337835+00:00', '2026-07-11T02:14:03.185+00:00')
on conflict do nothing;

-- 3) Mesas -------------------------------------------------------------------
insert into public.mesas (id, nombre, capacidad, es_honor, orden) values
  (1, 'Mesa de Honor', 10, true, 1),
  (2, 'Mesa 2', 10, false, 2),
  (3, 'Mesa 3', 10, false, 3),
  (4, 'Mesa 4', 10, false, 4),
  (5, 'Mesa 5', 10, false, 5),
  (6, 'Mesa 6', 10, false, 6)
on conflict do nothing;

-- 4) Asientos ----------------------------------------------------------------
insert into public.asientos (id, mesa_id, guest_id, nombre, siempre_visible, orden, created_at) values
  ('b356769f-c05b-4bd4-aa04-41303b70736a', 2, 'c34b4a0d-5f98-4a11-8f88-cab600b8c396', 'Andres', false, 1, '2026-07-09T03:58:44.240958+00:00'),
  ('6d59d21c-3d04-4579-94a8-1205fe0f25bd', 2, 'c34b4a0d-5f98-4a11-8f88-cab600b8c396', 'Claudia', false, 2, '2026-07-09T03:58:44.240958+00:00'),
  ('2e57f685-e60b-47d5-addc-5b0f7766a639', 2, 'c34b4a0d-5f98-4a11-8f88-cab600b8c396', 'Brayan', false, 3, '2026-07-09T03:58:44.240958+00:00'),
  ('0820c21c-bad2-4e9e-b2ea-0b00750ac8ef', 2, 'ca7730dd-73a9-474b-8c6a-eee34243fd1a', 'Alexander', false, 4, '2026-07-09T03:58:44.240958+00:00'),
  ('37974084-553b-4c49-9bb2-f2fd28b2a19d', 2, 'ca7730dd-73a9-474b-8c6a-eee34243fd1a', 'Luisa', false, 5, '2026-07-09T03:58:44.240958+00:00'),
  ('5987fc10-f1be-45f1-8c30-b4d607085941', 2, 'ca7730dd-73a9-474b-8c6a-eee34243fd1a', 'Valery', false, 6, '2026-07-09T03:58:44.240958+00:00'),
  ('bca3cb68-2a1a-4f44-bc01-76041653e26b', 2, '1d330dfc-4892-415b-90af-8773e92f05da', 'Ximena', false, 7, '2026-07-09T03:58:44.240958+00:00'),
  ('db9ea7af-3f2f-4fff-80c7-c5b25557ae9d', 2, '1d330dfc-4892-415b-90af-8773e92f05da', 'Fredy', false, 8, '2026-07-09T03:58:44.240958+00:00'),
  ('5899d3ab-a761-4dd0-9c43-d94bf908ec42', 3, '1e782309-ccec-4906-8b08-f7d6567fa152', 'Belmes', false, 1, '2026-07-09T03:58:44.240958+00:00'),
  ('b5c5ab12-d927-4965-956d-fff46e28d51c', 3, 'd538db80-f7b4-4569-9847-5ee0a0d3b05e', 'Giovany', false, 2, '2026-07-09T03:58:44.240958+00:00'),
  ('0c7f7199-eb7c-4264-b8e7-948e3cf99a44', 3, 'd538db80-f7b4-4569-9847-5ee0a0d3b05e', 'Ximena', false, 3, '2026-07-09T03:58:44.240958+00:00'),
  ('e9c7cdd3-58e4-436e-9ba3-932a0552482f', 3, 'd538db80-f7b4-4569-9847-5ee0a0d3b05e', 'Stiven', false, 4, '2026-07-09T03:58:44.240958+00:00'),
  ('aaaa963d-4530-41c8-9949-943ba0ff9622', 3, 'd538db80-f7b4-4569-9847-5ee0a0d3b05e', 'Sebastian', false, 5, '2026-07-09T03:58:44.240958+00:00'),
  ('12a090b9-613d-4187-a06f-c0d9f7e919b8', 3, '452bb52a-9fc9-405b-9943-298a5dd2062c', 'Alejandro', false, 6, '2026-07-09T03:58:44.240958+00:00'),
  ('825cb87c-8733-41cd-b68d-990307ec9846', 3, '452bb52a-9fc9-405b-9943-298a5dd2062c', 'Marcela', false, 7, '2026-07-09T03:58:44.240958+00:00'),
  ('d36f2894-b554-4fce-8967-5fa6fc4f2581', 3, '979db4ef-b4fc-4d93-a63a-98664cd7c32b', 'Luz', false, 8, '2026-07-09T03:58:44.240958+00:00'),
  ('ace52dff-50a5-48c7-af69-450beabcf605', 4, '21601bf7-4a24-4abd-8600-8d2f06c7e39f', 'Miyer', false, 1, '2026-07-09T03:58:44.240958+00:00'),
  ('e3e25571-a5b9-4d68-b6e1-3eb4b565d464', 4, '21601bf7-4a24-4abd-8600-8d2f06c7e39f', 'Carlos', false, 2, '2026-07-09T03:58:44.240958+00:00'),
  ('05eb2cb0-580d-41ce-b9b0-1f4d196b0273', 4, '21601bf7-4a24-4abd-8600-8d2f06c7e39f', 'Yeicol', false, 3, '2026-07-09T03:58:44.240958+00:00'),
  ('ab06912d-20cc-4fbe-bd8b-fee3417836f2', 4, '1e782309-ccec-4906-8b08-f7d6567fa152', 'Rusbel', false, 4, '2026-07-09T03:58:44.240958+00:00'),
  ('8315c729-0086-4fc4-9cbe-349a9d223901', 4, '1e782309-ccec-4906-8b08-f7d6567fa152', 'Nancy', false, 5, '2026-07-09T03:58:44.240958+00:00'),
  ('9a378a1c-a5e1-4621-9055-df202908a5bc', 5, 'c89d9db5-3e32-43cb-ac69-df76e0740970', 'Miguel', false, 1, '2026-07-09T03:58:44.240958+00:00'),
  ('846219c3-2e77-4e33-999e-d4d993e55ccc', 5, 'c89d9db5-3e32-43cb-ac69-df76e0740970', 'Nataly', false, 2, '2026-07-09T03:58:44.240958+00:00'),
  ('7c65233f-0565-49a8-86c0-3354d1c9f9bb', 5, '72954eb2-e0a6-455f-a2f0-4783da5cb6aa', 'Daniel', false, 3, '2026-07-09T03:58:44.240958+00:00'),
  ('31a02a6a-18ef-4de7-84aa-a949ebce9031', 5, '72954eb2-e0a6-455f-a2f0-4783da5cb6aa', 'Laura', false, 4, '2026-07-09T03:58:44.240958+00:00'),
  ('b4b6f55d-21ca-4cb8-b74c-729d35064762', 5, 'c6bca0bc-362a-4525-8be2-b48861d91265', 'Diana', false, 5, '2026-07-09T03:58:44.240958+00:00'),
  ('fee126bc-b323-4500-ab94-2c2a65928f12', 5, 'c6bca0bc-362a-4525-8be2-b48861d91265', 'Pedro', false, 6, '2026-07-09T03:58:44.240958+00:00'),
  ('3d2dbec6-1a9e-4950-a74c-16445ac86419', 6, '47793a4a-419a-4613-88b7-33feac1c58cc', 'Gilmer', false, 2, '2026-07-09T03:58:44.240958+00:00'),
  ('b731871a-ab3b-4d35-b068-dc00bd91149e', 6, '47793a4a-419a-4613-88b7-33feac1c58cc', 'Lorena', false, 3, '2026-07-09T03:58:44.240958+00:00'),
  ('948bb432-15ce-4837-8096-60c306bec6ac', 6, 'a797267f-a3fb-452a-aa65-43854b730793', 'Emily', false, 9, '2026-07-09T03:58:44.240958+00:00'),
  ('dba96d48-fc62-4746-92a3-543d7e2e6fa8', 1, null, 'Kevin', true, 1, '2026-07-09T03:58:44.240958+00:00'),
  ('3bbfcfc8-789d-4756-99c4-1f701c08d4cf', 1, null, 'Daniela', true, 2, '2026-07-09T03:58:44.240958+00:00'),
  ('e223f519-9104-495e-873d-ead6e9c1f2a8', 1, '1a3d332a-af67-47e4-b2a0-f96369ecbe93', 'Gloria', false, 3, '2026-07-09T03:58:44.240958+00:00'),
  ('7618a174-ef54-44ad-9a26-78dfc01a3244', 1, null, 'Pastor', true, 4, '2026-07-09T03:58:44.240958+00:00'),
  ('56637aad-f3d1-4f81-a832-18eadb568859', 1, '0bfbfa82-9fcb-4fa6-8461-7161e94feb2f', 'Jonny', false, 5, '2026-07-09T03:58:44.240958+00:00'),
  ('c0bedfd3-300f-4da4-af18-1fdd75c3e3f8', 1, 'bafec6bd-6612-4f03-b2af-8d23e6b4b198', 'Emily Sofía', false, 7, '2026-07-09T03:58:44.240958+00:00'),
  ('07e123fe-0ea5-45f6-83e4-ff62920156cc', 1, 'bafec6bd-6612-4f03-b2af-8d23e6b4b198', 'Jonnathan', false, 8, '2026-07-09T03:58:44.240958+00:00'),
  ('97ff4b0f-7b5c-45df-92a2-ba8b1fbe4bd3', 1, 'bafec6bd-6612-4f03-b2af-8d23e6b4b198', 'Leidy', false, 9, '2026-07-09T03:58:44.240958+00:00'),
  ('c87531f3-c15c-4456-a3ae-d444b51f4276', 6, '7760a4a5-d31a-40df-951d-3203ba1874f6', 'Mocho', false, 6, '2026-07-09T03:58:44.240958+00:00'),
  ('337981a1-4ffe-4bf4-a7d3-5c2959005e00', 6, '47793a4a-419a-4613-88b7-33feac1c58cc', 'Laure', false, 1, '2026-07-09T03:58:44.240958+00:00'),
  ('faed960d-d8d8-4c3d-849e-753ecc3b17c1', 6, 'a797267f-a3fb-452a-aa65-43854b730793', 'Guillermo', false, 8, '2026-07-09T03:58:44.240958+00:00'),
  ('1520ec37-a61c-4572-88f5-34cfdd936383', 6, 'a797267f-a3fb-452a-aa65-43854b730793', 'Daniela', false, 7, '2026-07-09T03:58:44.240958+00:00'),
  ('4fda8ae9-4d52-4faf-9c14-b9902499f9e6', 6, '47793a4a-419a-4613-88b7-33feac1c58cc', 'Danna', false, 4, '2026-07-09T03:58:44.240958+00:00'),
  ('36410da4-1cf4-4c29-afde-8111ff0babac', 6, '47793a4a-419a-4613-88b7-33feac1c58cc', 'David', false, 5, '2026-07-09T03:58:44.240958+00:00'),
  ('dfa8aa96-fe79-48f3-b3f5-f2fb12126fff', 4, 'fb6a33e1-f7df-4bd8-8171-ffa4f06de93f', 'Sandra', false, 6, '2026-07-09T03:58:44.240958+00:00'),
  ('92d45683-168c-42f4-9c26-c6350703160b', 4, '784f4d4b-f6d4-455f-9e1c-71e98d9869ed', 'Nidia', false, 7, '2026-07-09T03:58:44.240958+00:00'),
  ('d9237191-acf6-4703-bdaf-88111556ed21', 4, 'b41c8f12-072f-438d-8dfd-11a109398d93', 'Rosa', false, 8, '2026-07-09T03:58:44.240958+00:00'),
  ('5d8b43ef-cbc6-4553-88f3-3f7da3f0446a', 1, '0bfbfa82-9fcb-4fa6-8461-7161e94feb2f', 'Maria', false, 6, '2026-07-09T03:58:44.240958+00:00')
on conflict do nothing;

-- 5) Config del sitio --------------------------------------------------------
insert into public.wedding_settings (id, site_url, invite_message) values
  (1, 'https://REEMPLAZA-CON-TU-DOMINIO', 'Hola {name}, Kevin y Daniela se casan 💍 Queremos que seas parte de este día tan especial. Abre tu invitación personal aquí: {link}')
on conflict do nothing;


-- ▼▼▼ Limpieza posterior a la restauración ▼▼▼

-- 1) Fuera los invitados de DEMO que crea la migración 0001 -------------------
-- Si no se borran, aparecen en el panel como invitaciones reales e inflan las
-- estadísticas en 8 pases. Ninguna invitación real usa estos códigos exactos.
delete from public.guests where code in ('kevin', 'daniela', 'jk82ha');

-- 2) Plantilla del mensaje de WhatsApp ---------------------------------------
-- La migración 0002 deja una plantilla de una sola línea. Esta es la versión
-- que usan los novios (misma que el fallback de server/api/admin/guests.get.ts).
update public.wedding_settings set invite_message =
'✨ *Kevin & Daniela se casan* ✨

Hola {name}, con el corazón lleno de alegría queremos invitarte a celebrar nuestra boda 💍

🗓️ Domingo 11 de Octubre de 2026
📍 Kamaura · El Cerrito, Valle

Toca tu invitación personal para ver todos los detalles y confirmar tu asistencia 👇
{link}

Con cariño,
Kevin & Daniela 🤍'
where id = 1;

-- 3) Dominio público ---------------------------------------------------------
-- Lo usa la vista `guest_links`. Se ajusta cuando ya exista el dominio real:
--   npm run db:set-url -- https://tudominio.com
-- (el panel /admin usa NUXT_PUBLIC_SITE_URL, que es una variable de entorno).

-- ============================================================================
-- Verificación final
-- ============================================================================
select
  (select count(*) from public.guests)                       as invitaciones,
  (select coalesce(sum(max_passes), 0) from public.guests)   as pases,
  (select count(*) from public.rsvps)                        as confirmaciones,
  (select count(*) from public.mesas)                        as mesas,
  (select count(*) from public.asientos)                     as asientos,
  (select site_url from public.wedding_settings where id = 1) as site_url;
