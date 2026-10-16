-- ============================================================================
-- Yeron Barbershop — esquema de Supabase (panel administrativo + reservas)
-- Proyecto SEPARADO de webdom-citas y de los demás clientes.
--
-- Cómo usarlo: Supabase → SQL Editor → pegar todo este archivo → Run.
-- Es seguro volver a ejecutarlo: no borra datos existentes.
--
-- Qué puede hacer cada quien:
--   Público (sin iniciar sesión): LEER horario, días cerrados y configuración;
--     CREAR una cita con crear_cita(); ver solo las horas ocupadas (sin datos
--     personales) con horas_ocupadas(). NO puede leer ninguna cita.
--   Administrador (Yeron, con sesión y registrado en la tabla admins): todo.
-- Las citas guardan nombre y WhatsApp del cliente: por eso nadie sin sesión
-- de administrador puede leerlas (RLS activado en todas las tablas).
-- ============================================================================

-- ---------- Tablas ----------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- Horario semanal. dow: 0 = domingo … 6 = sábado. Horas en formato 24 h.
create table if not exists public.horario (
  dow    smallint primary key check (dow between 0 and 6),
  modo   text not null check (modo in ('barberia', 'domicilio', 'cerrado', 'por_confirmar')),
  abre   smallint check (abre between 0 and 23),
  cierra smallint check (cierra between 1 and 24),
  constraint horario_horas check (
    modo in ('cerrado', 'por_confirmar') or (abre is not null and cierra is not null and abre < cierra)
  ),
  -- El servicio a domicilio es solo los miércoles (dow = 3), como dice la web.
  constraint horario_domicilio_miercoles check (modo <> 'domicilio' or dow = 3)
);

insert into public.horario (dow, modo, abre, cierra) values
  (0, 'por_confirmar', null, null),
  (1, 'barberia', 8, 21),
  (2, 'barberia', 8, 21),
  (3, 'domicilio', 8, 21),
  (4, 'barberia', 8, 21),
  (5, 'barberia', 8, 21),
  (6, 'por_confirmar', null, null)
on conflict (dow) do nothing;

-- Días cerrados (feriados, descansos, viajes…). Un día cerrado no admite citas.
create table if not exists public.cierres (
  fecha  date primary key,
  tipo   text not null default 'feriado' check (tipo in ('feriado', 'cerrado')),
  motivo text not null default '' check (char_length(motivo) <= 120),
  creado timestamptz not null default now()
);

-- Configuración general (una sola fila).
create table if not exists public.config (
  id              smallint primary key default 1 check (id = 1),
  domicilio_desde integer not null default 1000 check (domicilio_desde >= 0),
  aviso           text not null default '' check (char_length(aviso) <= 200),
  aviso_activo    boolean not null default false
);
insert into public.config (id) values (1) on conflict (id) do nothing;

-- Citas hechas desde la web.
create table if not exists public.citas (
  id        uuid primary key default gen_random_uuid(),
  creado    timestamptz not null default now(),
  servicio  text not null check (servicio in ('fade', 'perfilado', 'barba', 'corte-barba', 'rayas', 'domicilio')),
  fecha     date not null,
  hora      smallint not null check (hora between 0 and 23),
  lugar     text not null check (lugar in ('barberia', 'domicilio')),
  nombre    text not null check (char_length(nombre) between 2 and 80),
  telefono  text not null check (char_length(telefono) between 7 and 30),
  sector    text not null default '' check (char_length(sector) <= 120),
  personas  smallint not null default 1 check (personas between 1 and 10),
  nota      text not null default '' check (char_length(nota) <= 300),
  estado    text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')),
  nota_interna text not null default '' check (char_length(nota_interna) <= 300)
);

-- Una sola cita activa por día y hora (Yeron atiende a una persona a la vez).
create unique index if not exists citas_hora_unica
  on public.citas (fecha, hora) where estado in ('pendiente', 'confirmada');
create index if not exists citas_fecha_idx on public.citas (fecha, hora);

-- ---------- Administrador ---------------------------------------------------

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Seguridad a nivel de fila (RLS) ---------------------------------

alter table public.admins  enable row level security;
alter table public.horario enable row level security;
alter table public.cierres enable row level security;
alter table public.config  enable row level security;
alter table public.citas   enable row level security;

drop policy if exists "admins: ver la propia fila" on public.admins;
create policy "admins: ver la propia fila" on public.admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "horario: lectura pública" on public.horario;
create policy "horario: lectura pública" on public.horario
  for select to anon, authenticated using (true);
drop policy if exists "horario: solo admin escribe" on public.horario;
create policy "horario: solo admin escribe" on public.horario
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists "cierres: lectura pública" on public.cierres;
create policy "cierres: lectura pública" on public.cierres
  for select to anon, authenticated using (true);
drop policy if exists "cierres: solo admin escribe" on public.cierres;
create policy "cierres: solo admin escribe" on public.cierres
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists "config: lectura pública" on public.config;
create policy "config: lectura pública" on public.config
  for select to anon, authenticated using (true);
drop policy if exists "config: solo admin escribe" on public.config;
create policy "config: solo admin escribe" on public.config
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Las citas contienen datos personales: SOLO el administrador.
drop policy if exists "citas: solo admin" on public.citas;
create policy "citas: solo admin" on public.citas
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Permisos mínimos (RLS decide además qué filas se ven).
revoke all on public.admins, public.horario, public.cierres, public.config, public.citas from anon, authenticated;
grant select on public.horario, public.cierres, public.config to anon;
grant select on public.admins to authenticated;
grant select, insert, update, delete on public.horario, public.cierres, public.citas to authenticated;
grant select, update on public.config to authenticated;

-- ---------- Funciones públicas ----------------------------------------------

-- Crear una cita desde la web. Valida todo en el servidor: el navegador no es de fiar.
-- Errores (mensaje del error): servicio_invalido, nombre_invalido, telefono_invalido,
-- fecha_invalida, dia_no_disponible, dia_cerrado, hora_invalida, hora_pasada,
-- servicio_no_disponible, sector_requerido, demasiadas_citas, hora_ocupada.
create or replace function public.crear_cita(
  p_servicio text,
  p_fecha    date,
  p_hora     integer,
  p_nombre   text,
  p_telefono text,
  p_sector   text default '',
  p_personas integer default 1,
  p_nota     text default ''
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_local  timestamp := now() at time zone 'America/Santo_Domingo';
  v_hoy    date := v_local::date;
  v_h      public.horario%rowtype;
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_tel    text := btrim(coalesce(p_telefono, ''));
  v_digitos text := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  v_sector text := btrim(coalesce(p_sector, ''));
  v_id     uuid;
begin
  if p_servicio is null or p_servicio not in ('fade', 'perfilado', 'barba', 'corte-barba', 'rayas', 'domicilio') then
    raise exception 'servicio_invalido';
  end if;
  if char_length(v_nombre) < 2 or char_length(v_nombre) > 80 then raise exception 'nombre_invalido'; end if;
  if char_length(v_digitos) < 10 or char_length(v_digitos) > 15 then raise exception 'telefono_invalido'; end if;
  if p_fecha is null or p_fecha < v_hoy or p_fecha > v_hoy + 30 then raise exception 'fecha_invalida'; end if;

  select * into v_h from public.horario where dow = extract(dow from p_fecha)::smallint;
  if not found or v_h.modo not in ('barberia', 'domicilio') then raise exception 'dia_no_disponible'; end if;
  if exists (select 1 from public.cierres where fecha = p_fecha) then raise exception 'dia_cerrado'; end if;
  if p_hora is null or p_hora < v_h.abre or p_hora >= v_h.cierra then raise exception 'hora_invalida'; end if;
  if p_fecha = v_hoy and p_hora < extract(hour from v_local)::int + 1 then raise exception 'hora_pasada'; end if;

  if p_servicio = 'domicilio' and v_h.modo <> 'domicilio' then raise exception 'servicio_no_disponible'; end if;
  if v_h.modo = 'domicilio' and char_length(v_sector) < 3 then raise exception 'sector_requerido'; end if;

  -- Freno a abusos: máximo 3 citas activas por número de WhatsApp.
  if (select count(*) from public.citas
        where regexp_replace(telefono, '\D', '', 'g') = v_digitos
          and estado in ('pendiente', 'confirmada') and fecha >= v_hoy) >= 3 then
    raise exception 'demasiadas_citas';
  end if;

  begin
    insert into public.citas (servicio, fecha, hora, lugar, nombre, telefono, sector, personas, nota)
    values (
      p_servicio, p_fecha, p_hora, v_h.modo, left(v_nombre, 80), left(v_tel, 30),
      case when v_h.modo = 'domicilio' then left(v_sector, 120) else '' end,
      least(greatest(coalesce(p_personas, 1), 1), 10),
      left(btrim(coalesce(p_nota, '')), 300)
    )
    returning id into v_id;
  exception when unique_violation then
    raise exception 'hora_ocupada';
  end;
  return v_id;
end;
$$;

-- Horas ya tomadas (solo fecha y hora, sin datos personales) para bloquearlas en la web.
create or replace function public.horas_ocupadas(p_desde date, p_hasta date)
returns table (fecha date, hora smallint)
language sql stable security definer set search_path = public
as $$
  select c.fecha, c.hora
  from public.citas c
  where c.estado in ('pendiente', 'confirmada')
    and c.fecha between p_desde and least(p_hasta, p_desde + 60)
$$;

revoke all on function public.crear_cita(text, date, integer, text, text, text, integer, text) from public;
revoke all on function public.horas_ocupadas(date, date) from public;
revoke all on function public.es_admin() from public;
grant execute on function public.crear_cita(text, date, integer, text, text, text, integer, text) to anon, authenticated;
grant execute on function public.horas_ocupadas(date, date) to anon, authenticated;
grant execute on function public.es_admin() to authenticated;

-- ---------- Dar acceso a Yeron (hacer UNA vez, después de crear su usuario) --
-- 1. Supabase → Authentication → Users → Add user (correo y contraseña de Yeron).
--    Desactiva "Allow new users to sign up" en Authentication → Providers → Email,
--    para que nadie más pueda registrarse.
-- 2. Ejecuta esto con el correo real de Yeron:
--
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'CORREO_DE_YERON@ejemplo.com'
--    on conflict do nothing;
