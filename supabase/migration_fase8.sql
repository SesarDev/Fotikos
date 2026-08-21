-- Banco de misiones editable desde la app: el comité puede ver, añadir,
-- modificar y borrar misiones — tanto del catálogo global (room_id null,
-- compartido por todas las salas) como las propias de su sala. Cualquier
-- organizador (de cualquier sala) puede tocar el catálogo global, ya que
-- no tiene un dueño natural más específico.

create or replace function is_any_organizer()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from players where auth_user_id = auth.uid() and is_organizer = true)
$$;

drop policy if exists "templates_insert_by_organizer" on mission_templates;
drop policy if exists "templates_delete_by_organizer" on mission_templates;
drop policy if exists "templates_write_by_organizer" on mission_templates;
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
