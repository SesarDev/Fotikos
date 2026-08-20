import { supabase } from './supabase'
import { computeCompleterPoints, COMPLICE_SHARE, MAX_COMPLICE_CONFIRMATIONS_PER_PAIR_PER_DAY } from './points'
import { dificultadFromPoints } from './missions'

export function missionCode(missionId) {
  return 'M' + missionId.replace(/-/g, '').slice(0, 4).toUpperCase()
}

export function buildCaption(mission) {
  const dificultad = dificultadFromPoints(mission.base_points)
  const label = dificultad.charAt(0).toUpperCase() + dificultad.slice(1)
  const names = Object.values(mission.slot_values ?? {}).map((v) => v.name)

  const lines = [
    `✅ ${missionCode(mission.id)} · ${label} · ${mission.base_points} pts`,
    `"${mission.rendered_text}"`,
  ]
  if (names.length > 0) lines.push(`— con ${names.join(' y ')}`)
  return lines.join('\n')
}

export async function completeMission({ mission, playerId, tagPlayerIds }) {
  const rapidezBonus = isWithinRapidezBonus(mission.opened_at)

  let position = null
  if (mission.formato === 'carrera') {
    const { count, error: countError } = await supabase
      .from('completions')
      .select('id', { count: 'exact', head: true })
      .eq('mission_id', mission.id)
    if (countError) throw countError
    position = (count ?? 0) + 1
  }

  const points = computeCompleterPoints({
    formato: mission.formato,
    basePoints: mission.base_points,
    rapidezBonus,
    position,
  })

  const { data: completion, error } = await supabase
    .from('completions')
    .insert({
      mission_id: mission.id,
      player_id: playerId,
      points_awarded: points,
      breakdown: { base: mission.base_points, rapidez: rapidezBonus, position },
    })
    .select()
    .single()
  if (error) throw error

  if (tagPlayerIds.length > 0) {
    const rows = tagPlayerIds.map((player_id) => ({ completion_id: completion.id, player_id }))
    const { error: tagError } = await supabase.from('completion_tags').insert(rows)
    if (tagError) throw tagError
  }

  return completion
}

function isWithinRapidezBonus(openedAt) {
  if (!openedAt) return false
  return Date.now() - new Date(openedAt).getTime() <= 90 * 60_000
}

export async function fetchPendingTags(playerId) {
  const { data, error } = await supabase
    .from('completion_tags')
    .select('completion_id, completions(id, mission_id, missions(rendered_text, base_points))')
    .eq('player_id', playerId)
    .eq('confirmed', false)
  if (error) throw error
  return data
}

export async function confirmTag({ completionId, playerId, basePoints }) {
  const { data: completion, error: completionError } = await supabase
    .from('completions')
    .select('player_id')
    .eq('id', completionId)
    .single()
  if (completionError) throw completionError

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count, error: countError } = await supabase
    .from('completion_tags')
    .select('completion_id, completions!inner(player_id)', { count: 'exact', head: true })
    .eq('player_id', playerId)
    .eq('confirmed', true)
    .eq('completions.player_id', completion.player_id)
    .gte('confirmed_at', todayStart.toISOString())
  if (countError) throw countError

  const pointsAwarded = (count ?? 0) < MAX_COMPLICE_CONFIRMATIONS_PER_PAIR_PER_DAY ? basePoints * COMPLICE_SHARE : 0

  const { error } = await supabase
    .from('completion_tags')
    .update({ confirmed: true, confirmed_at: new Date().toISOString(), points_awarded: pointsAwarded })
    .eq('completion_id', completionId)
    .eq('player_id', playerId)
  if (error) throw error

  return pointsAwarded
}
