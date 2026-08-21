-- Comité robusto frente a cambios de sesión/dispositivo: en vez de una
-- foto fija de auth_user_id en rooms.organizer_ids (que se queda
-- obsoleta cada vez que alguien reclama su jugador desde otro
-- dispositivo, §migration_fase5), se marca directamente en la fila del
-- jugador — players.id no cambia nunca, solo auth_user_id.

alter table players add column if not exists is_organizer boolean not null default false;

-- Migra el estado actual: quien ya era comité vía organizer_ids pasa a
-- is_organizer = true en su fila de jugador actual.
update players p
set is_organizer = true
from rooms r
where p.room_id = r.id
  and p.auth_user_id = any(r.organizer_ids);

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

drop policy if exists "missions_insert_by_organizer" on missions;
create policy "missions_insert_by_organizer" on missions
  for insert with check (is_organizer(room_id));

drop policy if exists "missions_update_by_organizer" on missions;
create policy "missions_update_by_organizer" on missions
  for update using (is_organizer(room_id));

drop policy if exists "admin_drafts_organizer_all" on admin_drafts;
create policy "admin_drafts_organizer_all" on admin_drafts
  for all
  using (is_organizer(room_id))
  with check (is_organizer(room_id));

drop policy if exists "rooms_update_by_organizer" on rooms;
create policy "rooms_update_by_organizer" on rooms
  for update using (is_organizer(id));

drop policy if exists "completions_insert_by_organizer" on completions;
create policy "completions_insert_by_organizer" on completions
  for insert with check (
    exists (select 1 from missions m where m.id = mission_id and is_organizer(m.room_id))
  );
