import { supabase } from './supabase'

export function dificultadFromPoints(basePoints) {
  if (basePoints >= 100) return 'epica'
  if (basePoints >= 50) return 'dificil'
  if (basePoints >= 25) return 'media'
  return 'facil'
}

export async function fetchPlayerMissions(roomId, playerId) {
  const { data, error } = await supabase
    .from('missions')
    .select('id, rendered_text, base_points, formato, published_at, expires_at, opened_at')
    .eq('room_id', roomId)
    .eq('assignee_id', playerId)
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
