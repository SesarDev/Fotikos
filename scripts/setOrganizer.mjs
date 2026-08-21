// Asciende a un jugador ya existente a comité de su sala (marca su ficha
// de jugador, no depende de qué dispositivo/sesión use — persiste aunque
// reclame su cuenta desde otro navegador más adelante). Uso:
//   npm run set-organizer -- --code KIWI7 --player "Sesar"
import { adminClient } from './lib/adminClient.mjs'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--code') args.code = argv[++i]
    if (argv[i] === '--player') args.player = argv[++i]
  }
  if (!args.code || !args.player) {
    throw new Error('Uso: npm run set-organizer -- --code CODIGO --player "Nombre"')
  }
  return args
}

async function main() {
  const { code, player } = parseArgs(process.argv.slice(2))

  const { data: room, error: roomError } = await adminClient
    .from('rooms')
    .select('id')
    .eq('code', code.toUpperCase())
    .single()
  if (roomError) throw roomError

  const { data: p, error: playerError } = await adminClient
    .from('players')
    .update({ is_organizer: true })
    .eq('room_id', room.id)
    .ilike('name', player)
    .select('name')
    .single()
  if (playerError) throw playerError

  console.log(`${p.name} ahora es comité de la sala ${code.toUpperCase()}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
