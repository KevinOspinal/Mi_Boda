#!/usr/bin/env bash
# Regenera supabase/restore.sql concatenando las migraciones + los datos + la
# limpieza posterior. Ejecútalo cada vez que añadas una migración nueva.
#   npm run db:build-restore
set -euo pipefail
cd "$(dirname "$0")/.."

# Orden importa: migraciones, luego datos, luego limpieza.
MIGRATIONS=(
  supabase/migrations/0001_init.sql
  supabase/migrations/0002_invite_distribution.sql
  supabase/migrations/0004_rsvp_summary.sql
  supabase/migrations/0005_mesas_asientos.sql
  supabase/migrations/0006_reconfirmacion.sql
  supabase/seed_data.sql
)

{
cat <<'HEADER'
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
HEADER

for f in "${MIGRATIONS[@]}"; do
  printf '\n-- ▼▼▼ %s ▼▼▼\n\n' "$f"
  cat "$f"
  echo
done

cat <<'CLEANUP'

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
CLEANUP
} > supabase/restore.sql

echo "✓ supabase/restore.sql regenerado ($(wc -l < supabase/restore.sql) líneas)"
