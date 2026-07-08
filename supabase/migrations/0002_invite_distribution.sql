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
