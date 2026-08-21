-- El comité puede ascender a otros jugadores de su sala directamente
-- desde la app (players.is_organizer), sin pasar por el terminal.
drop policy if exists "players_promote_by_organizer" on players;
create policy "players_promote_by_organizer" on players
  for update
  using (is_organizer(room_id))
  with check (is_organizer(room_id));
