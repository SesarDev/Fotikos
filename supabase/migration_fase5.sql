-- Recuperar jugador por nombre desde otro dispositivo/navegador (§1.1,
-- sistema de honor, sin contraseñas).
--
-- La causa real del bloqueo no era la política de UPDATE (probado con una
-- USING(true)/WITH CHECK(true) totalmente abierta y seguía sin funcionar):
-- Postgres exige que una fila sea visible por alguna política de SELECT
-- para poder actualizarla. Una sesión nueva que todavía no es jugador de
-- ninguna sala no pasaba "players_select_same_room", así que no podía ni
-- ver ni reclamar la fila de otro jugador. Se abre el SELECT de players
-- igual que ya está abierto el de rooms (el código de sala ya es el
-- secreto real, §13; app personal, no publicada).

drop policy if exists "players_select_same_room" on players;
create policy "players_select_open" on players
  for select using (true);

drop policy if exists "players_update_own_or_claim" on players;
create policy "players_update_own_or_claim" on players
  for update
  using (true)
  with check (auth_user_id = auth.uid());

-- Limpieza de las políticas/funciones de diagnóstico creadas mientras
-- depurábamos esto.
drop policy if exists "debug_players_open" on players;
drop function if exists debug_try_update(uuid, uuid);
drop function if exists debug_whoami();
drop function if exists debug_check(uuid);
