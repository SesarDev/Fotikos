import { supabase } from './supabase'

export function dificultadFromPoints(basePoints) {
  if (basePoints >= 100) return 'epica'
  if (basePoints >= 50) return 'dificil'
  if (basePoints >= 25) return 'media'
  return 'facil'
}

// Visible para un jugador si: se la asignaron directamente (personal), está
// entre los participantes (cooperativa/duelo), o es una carrera (§3.2, de
// toda la sala).
export async function fetchPlayerMissions(roomId, playerId) {
  const { data, error } = await supabase
    .from('missions')
    .select(
      'id, rendered_text, base_points, min_personas, formato, slot_values, published_at, expires_at, opened_at, completions(id, player_id)',
    )
    .eq('room_id', roomId)
    .or(`assignee_id.eq.${playerId},target_ids.cs.{${playerId}},formato.eq.carrera`)
    .is('cancelled_at', null)
    .is('rejected_at', null)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function openMissions(missionIds) {
  if (missionIds.length === 0) return
  const { error } = await supabase
    .from('missions')
    .update({ opened_at: new Date().toISOString() })
    .in('id', missionIds)
  if (error) throw error
}

// Rechazo silencioso (§5.2, §13): sin coste ni aviso a nadie, la misión
// simplemente desaparece. Sin tope — se puede rechazar todo lo que se
// quiera. Este contador es solo informativo (pestaña "Yo").
export async function countRejectedToday(playerId) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('missions')
    .select('id', { count: 'exact', head: true })
    .eq('assignee_id', playerId)
    .gte('rejected_at', start.toISOString())
  if (error) throw error
  return count ?? 0
}

export async function rejectMission(missionId) {
  const { error } = await supabase
    .from('missions')
    .update({ rejected_at: new Date().toISOString() })
    .eq('id', missionId)
  if (error) throw error
}
