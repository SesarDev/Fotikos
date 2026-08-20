// Motor de sorteo de misiones personales (§11.5, alcance v1: solo
// "personal" se reparte automáticamente — carrera/duelo/cooperativa son
// encargos manuales del comité, §1.3).
//
// Función pura: no toca la red ni la base de datos. Recibe el estado
// necesario y devuelve qué misiones tocaría repartir.

function weightedPick(items, rng) {
  const totalWeight = items.reduce((sum, it) => sum + it.peso, 0)
  let roll = rng() * totalWeight
  for (const it of items) {
    roll -= it.peso
    if (roll <= 0) return it
  }
  return items[items.length - 1]
}

function renderText(template, slotValues) {
  return template.text.replace(/\{(A|B)\}/g, (_, key) => slotValues[key]?.name ?? `{${key}}`)
}

/**
 * @param {object} params
 * @param {Array} params.templates - plantillas formato "personal" candidatas
 * @param {Array} params.players - [{ id, name }] jugadores de la sala
 * @param {Array} params.previousMissions - misiones "personal" ya repartidas en la sala
 *   [{ template_id, assignee_id, target_ids, expires_at, rendered_text_completed? }]
 * @param {number} params.count - cuántas misiones repartir por jugador en este drop
 * @param {number} params.madridHour - hora local (0-23) para filtrar tags
 * @param {(tags: string[], hour: number) => boolean} params.isTagAllowedAtHour
 * @param {() => number} [params.rng] - generador [0,1) inyectable para tests
 * @returns {Array<{ assigneeId, templateId, renderedText, slotValues, basePoints, targetIds }>}
 */
export function pickPersonalMissions({
  templates,
  players,
  previousMissions,
  count,
  madridHour,
  isTagAllowedAtHour,
  rng = Math.random,
}) {
  const usedTemplateIdsByPlayer = new Map()
  const activeMentionCount = new Map()

  for (const p of players) {
    usedTemplateIdsByPlayer.set(p.id, new Set())
    activeMentionCount.set(p.id, 0)
  }
  for (const m of previousMissions) {
    usedTemplateIdsByPlayer.get(m.assignee_id)?.add(m.template_id)
    const stillActive = !m.expires_at || new Date(m.expires_at) > new Date()
    if (stillActive) {
      for (const targetId of m.target_ids ?? []) {
        activeMentionCount.set(targetId, (activeMentionCount.get(targetId) ?? 0) + 1)
      }
    }
  }

  const eligibleTemplates = templates.filter(
    (t) => t.formato === 'personal' && isTagAllowedAtHour(t.tags, madridHour),
  )

  const results = []

  for (const player of players) {
    for (let i = 0; i < count; i++) {
      const usedIds = usedTemplateIdsByPlayer.get(player.id)
      const candidates = eligibleTemplates.filter((t) => !usedIds.has(t.id))
      if (candidates.length === 0) continue // pool agotado para este jugador

      const template = weightedPick(candidates, rng)
      usedIds.add(template.id)

      const slotKeys = Object.keys(template.slots ?? {})
      const slotValues = {}
      const targetIds = []

      for (const key of slotKeys) {
        const otherPlayers = players.filter(
          (p) => p.id !== player.id && !targetIds.includes(p.id),
        )
        if (otherPlayers.length === 0) continue

        // Máximo 3 menciones activas simultáneas por jugador (regla 4).
        const withRoom = otherPlayers.filter(
          (p) => (activeMentionCount.get(p.id) ?? 0) < 3,
        )
        const pool = withRoom.length > 0 ? withRoom : otherPlayers

        // Prioriza a quien menos veces ha salido nombrado (regla 3).
        const minMentions = Math.min(...pool.map((p) => activeMentionCount.get(p.id) ?? 0))
        const leastMentioned = pool.filter((p) => (activeMentionCount.get(p.id) ?? 0) === minMentions)
        const chosen = leastMentioned[Math.floor(rng() * leastMentioned.length)]

        slotValues[key] = { id: chosen.id, name: chosen.name }
        targetIds.push(chosen.id)
        activeMentionCount.set(chosen.id, (activeMentionCount.get(chosen.id) ?? 0) + 1)
      }

      results.push({
        assigneeId: player.id,
        templateId: template.id,
        renderedText: renderText(template, slotValues),
        slotValues,
        basePoints: template.base_points,
        targetIds,
      })
    }
  }

  return results
}
