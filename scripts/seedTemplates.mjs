// Reemplaza el catálogo global de plantillas (room_id = null) por el
// contenido actual de src/data/missionTemplates.js. Uso:
//   npm run seed:templates
import { adminClient } from './lib/adminClient.mjs'
import { MISSION_TEMPLATES } from '../src/data/missionTemplates.js'

async function main() {
  const { error: deleteError } = await adminClient
    .from('mission_templates')
    .delete()
    .is('room_id', null)
  if (deleteError) throw deleteError

  const rows = MISSION_TEMPLATES.map(({ id: _id, ...t }) => ({
    text: t.text,
    formato: t.formato,
    dificultad: t.dificultad,
    base_points: t.base_points,
    media: t.media,
    min_personas: t.min_personas,
    slots: t.slots,
    roles: t.roles,
    ventana: t.ventana,
    tags: t.tags,
    peso: t.peso,
  }))

  const { data, error } = await adminClient.from('mission_templates').insert(rows).select('id')
  if (error) throw error

  console.log(`Sembradas ${data.length} plantillas globales.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
