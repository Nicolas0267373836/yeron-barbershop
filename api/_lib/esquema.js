// Esquema de la base (se crea solo la primera vez, como en DentalSpace). Generado a partir de neon/schema.sql;
// si cambias uno, cambia el otro. Cada elemento es UNA sentencia (los drivers HTTP no aceptan varias a la vez).
export const SENTENCIAS = [
  String.raw`create table if not exists horario (
  dow    smallint primary key check (dow between 0 and 6),
  modo   text not null check (modo in ('barberia', 'domicilio', 'cerrado', 'por_confirmar')),
  abre   smallint check (abre between 0 and 23),
  cierra smallint check (cierra between 1 and 24),
  constraint horario_horas check (
    modo in ('cerrado', 'por_confirmar') or (abre is not null and cierra is not null and abre < cierra)
  ),
  constraint horario_domicilio_miercoles check (modo <> 'domicilio' or dow = 3)
)`,
  String.raw`insert into horario (dow, modo, abre, cierra) values
  (0, 'barberia', 8, 21),
  (1, 'barberia', 8, 21),
  (2, 'barberia', 8, 21),
  (3, 'domicilio', 8, 21),
  (4, 'barberia', 8, 21),
  (5, 'barberia', 8, 21),
  (6, 'barberia', 8, 21)
on conflict (dow) do nothing`,
  String.raw`create table if not exists cierres (
  fecha  date primary key,
  tipo   text not null default 'feriado' check (tipo in ('feriado', 'cerrado')),
  motivo text not null default '' check (char_length(motivo) <= 120),
  creado timestamptz not null default now()
)`,
  String.raw`create table if not exists config (
  id              smallint primary key default 1 check (id = 1),
  domicilio_desde integer not null default 1000 check (domicilio_desde >= 0),
  aviso           text not null default '' check (char_length(aviso) <= 200),
  aviso_activo    boolean not null default false
)`,
  String.raw`insert into config (id) values (1) on conflict (id) do nothing`,
  String.raw`create table if not exists citas (
  id        uuid primary key default gen_random_uuid(),
  creado    timestamptz not null default now(),
  servicio  text not null check (servicio in ('lavado', 'corte-adulto', 'corte-barba', 'cejas', 'corte-ninos', 'tintado-cejas', 'rayas', 'faciales', 'domicilio')),
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
)`,
  String.raw`create unique index if not exists citas_hora_unica
  on citas (fecha, hora) where estado in ('pendiente', 'confirmada')`,
  String.raw`create index if not exists citas_fecha_idx on citas (fecha, hora)`,
  String.raw`create table if not exists intentos (
  id     bigint generated always as identity primary key,
  tipo   text not null,
  ip     text not null,
  creado timestamptz not null default now()
)`,
  String.raw`create index if not exists intentos_idx on intentos (tipo, ip, creado)`,
  String.raw`create or replace function crear_cita(
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
language plpgsql
as $$
declare
  v_local  timestamp := now() at time zone 'America/Santo_Domingo';
  v_hoy    date := v_local::date;
  v_h      horario%rowtype;
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_tel    text := btrim(coalesce(p_telefono, ''));
  v_digitos text := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  v_sector text := btrim(coalesce(p_sector, ''));
  v_id     uuid;
begin
  if p_servicio is null or p_servicio not in ('lavado', 'corte-adulto', 'corte-barba', 'cejas', 'corte-ninos', 'tintado-cejas', 'rayas', 'faciales', 'domicilio') then
    raise exception 'servicio_invalido';
  end if;
  if char_length(v_nombre) < 2 or char_length(v_nombre) > 80 then raise exception 'nombre_invalido'; end if;
  if char_length(v_digitos) < 10 or char_length(v_digitos) > 15 then raise exception 'telefono_invalido'; end if;
  if p_fecha is null or p_fecha < v_hoy or p_fecha > v_hoy + 30 then raise exception 'fecha_invalida'; end if;

  select * into v_h from horario where dow = extract(dow from p_fecha)::smallint;
  if not found or v_h.modo not in ('barberia', 'domicilio') then raise exception 'dia_no_disponible'; end if;
  if exists (select 1 from cierres where fecha = p_fecha) then raise exception 'dia_cerrado'; end if;
  if p_hora is null or p_hora < v_h.abre or p_hora >= v_h.cierra then raise exception 'hora_invalida'; end if;
  if p_fecha = v_hoy and p_hora < extract(hour from v_local)::int + 1 then raise exception 'hora_pasada'; end if;

  if p_servicio = 'domicilio' and v_h.modo <> 'domicilio' then raise exception 'servicio_no_disponible'; end if;
  if v_h.modo = 'domicilio' and char_length(v_sector) < 3 then raise exception 'sector_requerido'; end if;

  -- Freno a abusos: máximo 3 citas activas por número de WhatsApp.
  if (select count(*) from citas
        where regexp_replace(telefono, '\D', '', 'g') = v_digitos
          and estado in ('pendiente', 'confirmada') and fecha >= v_hoy) >= 3 then
    raise exception 'demasiadas_citas';
  end if;

  begin
    insert into citas (servicio, fecha, hora, lugar, nombre, telefono, sector, personas, nota)
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
$$`
];
