// Crea una sala nueva. Uso:
//   npm run create-room -- --code KIWI7 --name "Misiones · Fiestas 2026"
import { adminClient } from './lib/adminClient.mjs'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--code') args.code = argv[++i]
    if (argv[i] === '--name') args.name = argv[++i]
  }
  if (!args.code || !args.name) {
    throw new Error('Uso: npm run create-room -- --code CODIGO --name "Nombre de la sala"')
  }
  return args
}

async function main() {
  const { code, name } = parseArgs(process.argv.slice(2))
  const { data, error } = await adminClient
    .from('rooms')
    .insert({ code: code.toUpperCase(), name })
    .select()
    .single()
  if (error) throw error
  console.log(`Sala creada: ${data.code} — ${data.name}`)
  console.log(`Enlace: https://fotikos.andres-figueruelas.workers.dev/#/r/${data.code}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
