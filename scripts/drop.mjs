// Reparte `count` misiones personales a cada jugador de la sala. Lo ejecuta
// el comité a mano en cada horario de drop (§7.2-7.3: 15:00, 19:00, 22:00,
// 01:00). Uso:
//   npm run drop -- --room KIWI7 --count 1
import { adminClient } from './lib/adminClient.mjs'
import { pickPersonalMissions } from '../src/lib/sorteo.js'
import { computeExpiresAt, currentMadridHour, isTagAllowedAtHour } from '../src/lib/schedule.js'

function parseArgs(argv) {
  const args = { count: 1 }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--room') args.room = argv[++i]
    if (argv[i] === '--count') args.count = Number(argv[++i])
  }
  if (!args.room) throw new Error('Falta --room <codigo>')
  return args
}

async function main() {
  const { room: roomCode, count } = parseArgs(process.argv.slice(2))
  const now = new Date()

  const { data: room, error: roomError } = await adminClient
    .from('rooms')
    .select('id, code, name')
    .eq('code', roomCode)
    .single()
  if (roomError) throw roomError

  const { data: players, error: playersError } = await adminClient
    .from('players')
    .select('id, name')
    .eq('room_id', room.id)
  if (playersError) throw playersError
  if (players.length === 0) throw new Error('La sala no tiene jugadores todavía.')

  const { data: templates, error: templatesError } = await adminClient
    .from('mission_templates')
    .select('*')
    .eq('formato', 'personal')
    .or(`room_id.is.null,room_id.eq.${room.id}`)
  if (templatesError) throw templatesError

  const { data: previousMissions, error: previousError } = await adminClient
    .from('missions')
    .select('template_id, assignee_id, target_ids, expires_at')
    .eq('room_id', room.id)
    .eq('formato', 'personal')
  if (previousError) throw previousError

  const madridHour = currentMadridHour(now)
  const picks = pickPersonalMissions({
    templates,
    players,
    previousMissions,
    count,
    madridHour,
    isTagAllowedAtHour,
  })

  if (picks.length === 0) {
    console.log('No se ha generado ninguna misión (¿pool de plantillas agotado?).')
    return
  }

  const expiresAt = computeExpiresAt(now).toISOString()
  const rows = picks.map((p) => ({
    room_id: room.id,
    template_id: p.templateId,
    rendered_text: p.renderedText,
    slot_values: p.slotValues,
    formato: 'personal',
    assignee_id: p.assigneeId,
    target_ids: p.targetIds,
    base_points: p.basePoints,
    published_at: now.toISOString(),
    expires_at: expiresAt,
    origen: 'automatica',
  }))

  const { data, error } = await adminClient.from('missions').insert(rows).select('id')
  if (error) throw error

  console.log(`Repartidas ${data.length} misiones personales en "${room.name}" (caducan: ${expiresAt}).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
