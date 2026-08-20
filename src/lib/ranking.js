import { supabase } from './supabase'
import { grupoMultiplier } from './points'

export async function fetchRoomPlayers(roomId) {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, emoji')
    .eq('room_id', roomId)
  if (error) throw error
  return data
}

export async function fetchRanking(roomId) {
  const { data: completions, error: completionsError } = await supabase
    .from('completions')
    .select('id, player_id, points_awarded, missions!inner(room_id, min_personas)')
    .eq('missions.room_id', roomId)
  if (completionsError) throw completionsError

  const totals = new Map()

  if (completions.length > 0) {
    const { data: tags, error: tagsError } = await supabase
      .from('completion_tags')
      .select('completion_id, player_id, confirmed, points_awarded')
      .in(
        'completion_id',
        completions.map((c) => c.id),
      )
    if (tagsError) throw tagsError

    const tagsByCompletion = new Map()
    for (const tag of tags) {
      if (!tagsByCompletion.has(tag.completion_id)) tagsByCompletion.set(tag.completion_id, [])
      tagsByCompletion.get(tag.completion_id).push(tag)
      if (tag.confirmed) {
        totals.set(tag.player_id, (totals.get(tag.player_id) ?? 0) + Number(tag.points_awarded))
      }
    }

    for (const c of completions) {
      const confirmedCount = (tagsByCompletion.get(c.id) ?? []).filter((t) => t.confirmed).length
      const multiplier = grupoMultiplier(confirmedCount, c.missions.min_personas)
      const points = Number(c.points_awarded) * multiplier
      totals.set(c.player_id, (totals.get(c.player_id) ?? 0) + points)
    }
  }

  return totals
}
