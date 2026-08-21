import { supabase } from './supabase'
import { grupoMultiplier } from './points'
import { gameDayKey, currentMadridHour } from './schedule'

async function fetchRawData(roomId) {
  const { data: completions, error: e1 } = await supabase
    .from('completions')
    .select(
      'id, player_id, points_awarded, completed_at, breakdown, mission_id, missions!inner(room_id, min_personas, formato, opened_at, published_at)',
    )
    .eq('missions.room_id', roomId)
  if (e1) throw e1

  let tags = []
  if (completions.length > 0) {
    const { data, error: e2 } = await supabase
      .from('completion_tags')
      .select('completion_id, player_id, confirmed, confirmed_at, points_awarded')
      .in(
        'completion_id',
        completions.map((c) => c.id),
      )
    if (e2) throw e2
    tags = data
  }

  const { data: players, error: e3 } = await supabase.from('players').select('id, name, emoji').eq('room_id', roomId)
  if (e3) throw e3

  const { data: allMissions, error: e4 } = await supabase
    .from('missions')
    .select('id, formato, assignee_id, opened_at, published_at, cancelled_at, rejected_at')
    .eq('room_id', roomId)
  if (e4) throw e4

  return { completions, tags, players, allMissions }
}

function topEntry(counts, playerById) {
  let best = null
  for (const [playerId, count] of counts) {
    if (!best || count > best.count) best = { player: playerById.get(playerId), count }
  }
  return best
}

function bestAverage(samplesByPlayer, playerById) {
  let best = null
  for (const [playerId, values] of samplesByPlayer) {
    const avgMinutes = values.reduce((a, b) => a + b, 0) / values.length
    if (!best || avgMinutes < best.avgMinutes) best = { player: playerById.get(playerId), avgMinutes }
  }
  return best
}

export async function computeRecap(roomId) {
  const { completions, tags, players, allMissions } = await fetchRawData(roomId)
  const playerById = new Map(players.map((p) => [p.id, p]))

  const tagsByCompletion = new Map()
  for (const t of tags) {
    if (!tagsByCompletion.has(t.completion_id)) tagsByCompletion.set(t.completion_id, [])
    tagsByCompletion.get(t.completion_id).push(t)
  }

  const totals = new Map()
  const dailyTotals = new Map()

  function addDaily(day, playerId, points) {
    if (!dailyTotals.has(day)) dailyTotals.set(day, new Map())
    const dayMap = dailyTotals.get(day)
    dayMap.set(playerId, (dayMap.get(playerId) ?? 0) + points)
  }

  for (const c of completions) {
    const cTags = tagsByCompletion.get(c.id) ?? []
    const confirmedCount = cTags.filter((t) => t.confirmed).length
    const points = Number(c.points_awarded) * grupoMultiplier(confirmedCount, c.missions.min_personas)
    totals.set(c.player_id, (totals.get(c.player_id) ?? 0) + points)
    addDaily(gameDayKey(new Date(c.completed_at)), c.player_id, points)
  }
  for (const t of tags) {
    if (!t.confirmed) continue
    totals.set(t.player_id, (totals.get(t.player_id) ?? 0) + Number(t.points_awarded))
    addDaily(gameDayKey(new Date(t.confirmed_at)), t.player_id, Number(t.points_awarded))
  }

  const podium = [...totals.entries()]
    .map(([playerId, points]) => ({ player: playerById.get(playerId), points: Math.round(points) }))
    .sort((a, b) => b.points - a.points)

  const dailyStandings = [...dailyTotals.entries()]
    .map(([day, dayMap]) => ({
      day,
      ranking: [...dayMap.entries()]
        .map(([playerId, points]) => ({ player: playerById.get(playerId), points: Math.round(points) }))
        .sort((a, b) => b.points - a.points),
    }))
    .sort((a, b) => a.day.localeCompare(b.day))

  const dailyChampions = dailyStandings.map(({ day, ranking }) => ({
    day,
    player: ranking[0]?.player ?? null,
    points: ranking[0]?.points ?? 0,
  }))

  const today = dailyStandings.find((d) => d.day === gameDayKey(new Date()))?.ranking ?? []

  // Más solicitado / más colaborador: misma métrica (etiquetas confirmadas
  // como cómplice) presentada como dos premios — el spec no da una manera
  // de distinguirlas con los datos que guardamos.
  const tagCounts = new Map()
  for (const t of tags) {
    if (!t.confirmed) continue
    tagCounts.set(t.player_id, (tagCounts.get(t.player_id) ?? 0) + 1)
  }
  const masSolicitado = topEntry(tagCounts, playerById)

  const speedByPlayer = new Map()
  for (const c of completions) {
    if (!c.missions.opened_at) continue
    const deltaMin = (new Date(c.completed_at) - new Date(c.missions.opened_at)) / 60_000
    if (deltaMin < 0) continue
    if (!speedByPlayer.has(c.player_id)) speedByPlayer.set(c.player_id, [])
    speedByPlayer.get(c.player_id).push(deltaMin)
  }
  const masRapido = bestAverage(speedByPlayer, playerById)

  const nightCounts = new Map()
  for (const c of completions) {
    const hour = currentMadridHour(new Date(c.completed_at))
    if (hour >= 2 && hour < 4) nightCounts.set(c.player_id, (nightCounts.get(c.player_id) ?? 0) + 1)
  }
  const criaturaNoche = topEntry(nightCounts, playerById)

  const openSpeedByPlayer = new Map()
  for (const m of allMissions) {
    if (!m.opened_at || !m.assignee_id) continue
    const deltaMin = (new Date(m.opened_at) - new Date(m.published_at)) / 60_000
    if (deltaMin < 0) continue
    if (!openSpeedByPlayer.has(m.assignee_id)) openSpeedByPlayer.set(m.assignee_id, [])
    openSpeedByPlayer.get(m.assignee_id).push(deltaMin)
  }
  const impaciente = bestAverage(openSpeedByPlayer, playerById)

  const duelWins = new Map()
  for (const c of completions) {
    if (c.missions.formato === 'duelo' && c.breakdown?.duelo === 'ganador') {
      duelWins.set(c.player_id, (duelWins.get(c.player_id) ?? 0) + 1)
    }
  }
  const reyDelDuelo = topEntry(duelWins, playerById)

  const pairCounts = new Map()
  const completionById = new Map(completions.map((c) => [c.id, c]))
  for (const t of tags) {
    if (!t.confirmed) continue
    const completion = completionById.get(t.completion_id)
    if (!completion) continue
    const key = [completion.player_id, t.player_id].sort().join('|')
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
  }
  let bestPair = null
  for (const [key, count] of pairCounts) {
    if (!bestPair || count > bestPair.count) {
      const [a, b] = key.split('|')
      bestPair = { a: playerById.get(a), b: playerById.get(b), count }
    }
  }

  const hourCounts = new Map()
  for (const c of completions) {
    const hour = currentMadridHour(new Date(c.completed_at))
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)
  }
  let bestHour = null
  for (const [hour, count] of hourCounts) {
    if (!bestHour || count > bestHour.count) bestHour = { hour, count }
  }

  const sinAbrir = allMissions.filter((m) => !m.opened_at && !m.cancelled_at && !m.rejected_at).length

  return {
    podium,
    today,
    dailyStandings,
    dailyChampions,
    awards: {
      masSolicitado,
      masColaborador: masSolicitado,
      masRapido,
      criaturaNoche,
      impaciente,
      reyDelDuelo,
    },
    stats: {
      totalCompletadas: completions.length,
      bestPair,
      bestHour,
      sinAbrir,
    },
  }
}
