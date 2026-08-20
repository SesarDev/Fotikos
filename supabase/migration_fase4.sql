-- Fase 4: recap y premios. El comité necesita poder guardar el enlace del
-- grupo de WhatsApp (rooms.settings) para que el recap lo muestre.

drop policy if exists "rooms_update_by_organizer" on rooms;
create policy "rooms_update_by_organizer" on rooms
  for update using (auth.uid() = any(organizer_ids));
