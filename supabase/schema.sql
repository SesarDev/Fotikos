-- MISIONES — esquema inicial (Fase 0-1)
-- Pega esto en Supabase → SQL Editor → New query → Run
-- Basado en el modelo de datos de misiones-fiestas-spec-v2.md §11.3

create extension if not exists pgcrypto;

-- ROOMS ---------------------------------------------------------------------
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- PLAYERS ---------------------------------------------------------------------
-- No está en el modelo de datos del spec como tabla explícita, pero §2.2 y el
-- resto del modelo (assignee_id, player_id en completions...) la dan por hecha.
create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null,
  accepted_rules_at timestamptz,
  is_organizer boolean not null default false,
  created_at timestamptz not null default now(),
  unique (room_id, auth_user_id)
);

-- SESSIONS ---------------------------------------------------------------------
create table sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  label text not null, -- 'viernes', 'sabado', 'domingo', 'lunes', 'martes'
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  day_multiplier numeric not null default 1
);

-- MISSION TEMPLATES ---------------------------------------------------------------
create table mission_templates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade, -- null = catálogo global (Anexo B)
  text text not null,
  formato text not null check (formato in ('personal','carrera','duelo','cooperativa')),
  dificultad text not null check (dificultad in ('facil','media','dificil','epica')),
  base_points integer not null,
  media text not null check (media in ('foto','video','cualquiera')),
  min_personas integer not null default 1,
  slots jsonb not null default '{}',   -- {"A":"player"}
  roles jsonb not null default '{}',   -- {"A":"artifice","B":"fotografo"}
  ventana text not null default 'permanente' check (ventana in ('permanente','flash','nocturna')),
  tags text[] not null default '{}',
  peso numeric not null default 1
);

-- MISSIONS (instancias repartidas) -------------------------------------------
create table missions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  template_id uuid references mission_templates(id) on delete set null,
  rendered_text text not null,
  slot_values jsonb not null default '{}',
  formato text not null check (formato in ('personal','carrera','duelo','cooperativa')),
  assignee_id uuid references players(id) on delete cascade,
  target_ids uuid[] not null default '{}',
  base_points integer not null,
  min_personas integer not null default 1,
  published_at timestamptz not null default now(),
  expires_at timestamptz not null,
  origen text not null check (origen in ('automatica','encargo')),
  opened_at timestamptz,
  cancelled_at timestamptz,
  rejected_at timestamptz
);

-- COMPLETIONS -----------------------------------------------------------------
create table completions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  completed_at timestamptz not null default now(),
  position integer,
  points_awarded numeric not null default 0,
  breakdown jsonb not null default '{}',
  unique (mission_id, player_id)
);

-- COMPLETION TAGS (cómplices etiquetados) --------------------------------------
create table completion_tags (
  completion_id uuid not null references completions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  points_awarded numeric not null default 0,
  primary key (completion_id, player_id)
);

-- ADMIN DRAFTS (compositor del comité, Fase 3) ---------------------------------
create table admin_drafts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  text text not null,
  formato text not null check (formato in ('personal','carrera','duelo','cooperativa')),
  target_ids uuid[] not null default '{}',
  dificultad text not null check (dificultad in ('facil','media','dificil','epica')),
  duration_hours numeric,
  scheduled_for timestamptz,
  sent_at timestamptz
);

-- HELPER: salas del jugador autenticado (para RLS) -----------------------------
create or replace function current_room_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select room_id from players where auth_user_id = auth.uid()
$$;

-- HELPER: ¿el jugador autenticado es comité de esta sala? Se mira en la
-- ficha del jugador (players.is_organizer), no en una lista fija de
-- auth_user_id — así sobrevive a que alguien reclame su cuenta desde
-- otro dispositivo (players.id no cambia nunca, auth_user_id sí).
create or replace function is_organizer(p_room_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from players
    where room_id = p_room_id
      and auth_user_id = auth.uid()
      and is_organizer = true
  )
$$;

-- HELPER: ¿el jugador autenticado es comité de alguna sala? Para
-- gestionar el catálogo global de misiones (room_id null), que no tiene
-- un dueño más específico que "cualquier comité".
create or replace function is_any_organizer()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from players where auth_user_id = auth.uid() and is_organizer = true)
$$;

-- ROW LEVEL SECURITY ------------------------------------------------------------
-- Cada jugador solo ve/edita datos de su propia sala. Requiere auth anónima
-- activada en Authentication → Providers → Anonymous sign-ins.

alter table rooms enable row level security;
alter table players enable row level security;
alter table sessions enable row level security;
alter table mission_templates enable row level security;
alter table missions enable row level security;
alter table completions enable row level security;
alter table completion_tags enable row level security;
alter table admin_drafts enable row level security;

-- rooms: lectura abierta (el código de sala ya es el secreto, §13)
create policy "rooms_select" on rooms
  for select using (true);
create policy "rooms_update_by_organizer" on rooms
  for update using (is_organizer(id));

-- players
-- El chequeo "auth_user_id = auth.uid()" es necesario además de la
-- pertenencia a la sala: al insertar con RETURNING, Postgres evalúa esta
-- política de SELECT sobre la fila recién creada, y current_room_ids()
-- reconsulta la propia tabla players, que en ese instante del mismo
-- comando SQL todavía no ve la fila que se está insertando. El chequeo
-- directo evita depender de esa subconsulta para ver la fila propia.
-- Abierto (igual que rooms): el código de sala ya es el secreto real
-- (§13), y una sesión nueva necesita poder ver un jugador de otra sala
-- para poder "reclamarlo" al recuperar cuenta desde otro dispositivo.
create policy "players_select_open" on players
  for select using (true);
create policy "players_insert_self" on players
  for insert with check (auth_user_id = auth.uid());
-- Editar mi propio perfil + recuperar jugador por nombre desde otro
-- dispositivo (sin contraseñas, sistema de honor como el resto del
-- juego, §1.1), fusionadas en una sola política de UPDATE.
create policy "players_update_own_or_claim" on players
  for update
  using (true)
  with check (auth_user_id = auth.uid());
-- El comité puede ascender a otros jugadores de su sala a comité.
create policy "players_promote_by_organizer" on players
  for update
  using (is_organizer(room_id))
  with check (is_organizer(room_id));

-- sessions
create policy "sessions_select_same_room" on sessions
  for select using (room_id in (select current_room_ids()));

-- mission_templates
create policy "templates_select" on mission_templates
  for select using (room_id is null or room_id in (select current_room_ids()));
-- El comité (de cualquier sala) gestiona el banco de misiones: el
-- catálogo global (room_id null, compartido) y las propias de su sala.
create policy "templates_write_by_organizer" on mission_templates
  for all
  using (
    (room_id is null and is_any_organizer())
    or (room_id is not null and is_organizer(room_id))
  )
  with check (
    (room_id is null and is_any_organizer())
    or (room_id is not null and is_organizer(room_id))
  );

-- missions
create policy "missions_select_same_room" on missions
  for select using (room_id in (select current_room_ids()));
create policy "missions_update_own_or_race" on missions
  for update using (
    room_id in (select current_room_ids())
    and (
      assignee_id in (select id from players where auth_user_id = auth.uid())
      or formato = 'carrera'
    )
  );
-- El comité crea encargos y puede anular cualquier misión de su sala.
create policy "missions_insert_by_organizer" on missions
  for insert with check (is_organizer(room_id));
create policy "missions_update_by_organizer" on missions
  for update using (is_organizer(room_id));

-- completions
create policy "completions_select_same_room" on completions
  for select using (
    mission_id in (select id from missions where room_id in (select current_room_ids()))
  );
create policy "completions_insert_own" on completions
  for insert with check (
    player_id in (select id from players where auth_user_id = auth.uid())
  );
-- El comité resuelve duelos creando las completions de ambos participantes.
create policy "completions_insert_by_organizer" on completions
  for insert with check (
    exists (select 1 from missions m where m.id = mission_id and is_organizer(m.room_id))
  );

-- completion_tags
create policy "completion_tags_select_same_room" on completion_tags
  for select using (
    completion_id in (
      select id from completions where mission_id in (
        select id from missions where room_id in (select current_room_ids())
      )
    )
  );
create policy "completion_tags_confirm_own" on completion_tags
  for update using (player_id in (select id from players where auth_user_id = auth.uid()));
create policy "completion_tags_insert_by_completer" on completion_tags
  for insert with check (
    completion_id in (
      select id from completions where player_id in (
        select id from players where auth_user_id = auth.uid()
      )
    )
  );

-- admin_drafts: exclusivo del comité (select/insert/update/delete). No son
-- visibles al resto de la sala para no filtrar sorpresas antes de enviarlas.
create policy "admin_drafts_organizer_all" on admin_drafts
  for all
  using (is_organizer(room_id))
  with check (is_organizer(room_id));

-- Nota: no hay políticas de INSERT/UPDATE para sessions ni mission_templates
-- porque esas escrituras las hace el motor de sorteo con la service role key
-- desde el servidor (scripts/), no directamente desde el cliente anon.
