-- Fase 3: compositor del comité (encargos, borradores programados, anular).

alter table admin_drafts add column if not exists duration_hours numeric;

-- Solo el comité (room.organizer_ids) puede crear misiones directamente
-- desde el cliente (hasta ahora solo el script de reparto, con service
-- role, podía escribir en missions).
drop policy if exists "missions_insert_by_organizer" on missions;
create policy "missions_insert_by_organizer" on missions
  for insert with check (
    room_id in (select id from rooms where auth.uid() = any(organizer_ids))
  );

-- El comité puede anular (cancelled_at) cualquier misión de su sala, no
-- solo las suyas propias.
drop policy if exists "missions_update_by_organizer" on missions;
create policy "missions_update_by_organizer" on missions
  for update using (
    room_id in (select id from rooms where auth.uid() = any(organizer_ids))
  );

-- El comité resuelve duelos (marca ganador/perdedor) creando las
-- completions de los dos participantes, no solo la suya propia.
drop policy if exists "completions_insert_by_organizer" on completions;
create policy "completions_insert_by_organizer" on completions
  for insert with check (
    mission_id in (
      select id from missions where room_id in (
        select id from rooms where auth.uid() = any(organizer_ids)
      )
    )
  );

-- admin_drafts: antes cualquier jugador de la sala podía leer los
-- borradores (filtración de sorpresas). Se sustituye por acceso
-- exclusivo del comité para todo (select/insert/update/delete).
drop policy if exists "admin_drafts_select_same_room" on admin_drafts;
drop policy if exists "admin_drafts_organizer_all" on admin_drafts;
create policy "admin_drafts_organizer_all" on admin_drafts
  for all
  using (room_id in (select id from rooms where auth.uid() = any(organizer_ids)))
  with check (room_id in (select id from rooms where auth.uid() = any(organizer_ids)));
