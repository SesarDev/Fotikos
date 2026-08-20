-- Fase 2: completar misión, etiquetado, confirmación, puntos.

alter table missions add column if not exists min_personas integer not null default 1;
alter table completion_tags add column if not exists points_awarded numeric not null default 0;

-- El jugador que completa la misión necesita poder crear las filas de
-- etiqueta pendientes de sus cómplices (antes solo existían SELECT/UPDATE).
drop policy if exists "completion_tags_insert_by_completer" on completion_tags;
create policy "completion_tags_insert_by_completer" on completion_tags
  for insert with check (
    completion_id in (
      select id from completions where player_id in (
        select id from players where auth_user_id = auth.uid()
      )
    )
  );
