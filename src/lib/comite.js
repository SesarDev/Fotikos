import { supabase } from './supabase'
import { computeExpiresAt, currentMadridHour, isTagAllowedAtHour } from './schedule'
import { computeCompleterPoints } from './points'
import { pickPersonalMissions } from './sorteo'

// players.is_organizer, no rooms.organizer_ids: el jugador (players.id)
// no cambia nunca, aunque cambie de dispositivo/navegador y su
// auth_user_id se reasigne al reclamar (ver migration_fase6.sql).
export function isOrganizer(player) {
  return !!player?.is_organizer
}

const DIFICULTAD_POINTS = { facil: 10, media: 25, dificil: 50, epica: 100 }

export function basePointsForDificultad(dificultad) {
  return DIFICULTAD_POINTS[dificultad]
}

function computeExpiresAtWithDuration(durationHours) {
  if (!durationHours) return computeExpiresAt(new Date())
  return new Date(Date.now() + durationHours * 3_600_000)
}

function buildMissionRow({ roomId, text, formato, targetIds, dificultad, durationHours }) {
  let assigneeId = null
  let finalTargetIds = []
  let minPersonas = 1

  if (formato === 'personal') {
    assigneeId = targetIds[0] ?? null
    finalTargetIds = targetIds.slice(1)
    minPersonas = Math.max(1, targetIds.length)
  } else if (formato === 'cooperativa') {
    assigneeId = targetIds[0] ?? null
    finalTargetIds = targetIds.slice(1)
    minPersonas = 2
  } else if (formato === 'duelo') {
    finalTargetIds = targetIds
    minPersonas = 2
  }

  return {
    room_id: roomId,
    rendered_text: text,
    formato,
    assignee_id: assigneeId,
    target_ids: finalTargetIds,
    base_points: basePointsForDificultad(dificultad),
    min_personas: minPersonas,
    published_at: new Date().toISOString(),
    expires_at: computeExpiresAtWithDuration(durationHours).toISOString(),
    origen: 'encargo',
    // Las carreras no tienen sobre cerrado: no hay secreto que guardar
    // cuando la misión es "de toda la sala" desde el principio (§3.2).
    opened_at: formato === 'carrera' ? new Date().toISOString() : null,
  }
}

export async function sendEncargo(params) {
  const row = buildMissionRow(params)
  const { data, error } = await supabase.from('missions').insert(row).select().single()
  if (error) throw error
  return data
}

export async function saveDraft({ roomId, text, formato, targetIds, dificultad, durationHours, scheduledFor }) {
  const { data, error } = await supabase
    .from('admin_drafts')
    .insert({
      room_id: roomId,
      text,
      formato,
      target_ids: targetIds,
      dificultad,
      duration_hours: durationHours,
      scheduled_for: scheduledFor,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchDrafts(roomId) {
  const { data, error } = await supabase
    .from('admin_drafts')
    .select('*')
    .eq('room_id', roomId)
    .is('sent_at', null)
    .order('scheduled_for', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data
}

export async function sendDraft(draft) {
  await sendEncargo({
    roomId: draft.room_id,
    text: draft.text,
    formato: draft.formato,
    targetIds: draft.target_ids,
    dificultad: draft.dificultad,
    durationHours: draft.duration_hours,
  })
  const { error } = await supabase.from('admin_drafts').update({ sent_at: new Date().toISOString() }).eq('id', draft.id)
  if (error) throw error
}

export async function deleteDraft(draftId) {
  const { error } = await supabase.from('admin_drafts').delete().eq('id', draftId)
  if (error) throw error
}

export async function fetchActiveMissions(roomId) {
  const { data, error } = await supabase
    .from('missions')
    .select('id, rendered_text, formato, assignee_id, target_ids, base_points, expires_at, origen, published_at')
    .eq('room_id', roomId)
    .is('cancelled_at', null)
    .is('rejected_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function cancelMission(missionId) {
  const { error } = await supabase.from('missions').update({ cancelled_at: new Date().toISOString() }).eq('id', missionId)
  if (error) throw error
}

// Tope de 2-3 encargos por destinatario al día (§8.4): cuenta cuántas veces
// ya ha sido destinatario de un encargo hoy, para avisar antes de enviar.
export async function countTodayEncargosForTarget(roomId, playerId) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('missions')
    .select('assignee_id, target_ids')
    .eq('room_id', roomId)
    .eq('origen', 'encargo')
    .gte('published_at', start.toISOString())
  if (error) throw error
  return data.filter((m) => m.assignee_id === playerId || (m.target_ids ?? []).includes(playerId)).length
}

export async function setPlayerOrganizer(playerId, value) {
  const { error } = await supabase.from('players').update({ is_organizer: value }).eq('id', playerId)
  if (error) throw error
}

export async function updateWhatsappGroupUrl(room, url) {
  const { error } = await supabase
    .from('rooms')
    .update({ settings: { ...(room.settings ?? {}), whatsapp_group_url: url } })
    .eq('id', room.id)
  if (error) throw error
}

// Reparto aleatorio de personales a todos los jugadores de la sala, desde
// la propia app (botón del comité) en vez del script de terminal — mismo
// motor de sorteo (§11.5), disparado a mano cuando el comité quiera.
export async function dropPersonalMissions({ room, roomPlayers, count }) {
  const now = new Date()

  const { data: templates, error: templatesError } = await supabase
    .from('mission_templates')
    .select('*')
    .eq('formato', 'personal')
    .or(`room_id.is.null,room_id.eq.${room.id}`)
  if (templatesError) throw templatesError

  const { data: previousMissions, error: previousError } = await supabase
    .from('missions')
    .select('template_id, assignee_id, target_ids, expires_at')
    .eq('room_id', room.id)
    .eq('formato', 'personal')
  if (previousError) throw previousError

  const picks = pickPersonalMissions({
    templates,
    players: roomPlayers,
    previousMissions,
    count,
    madridHour: currentMadridHour(now),
    isTagAllowedAtHour,
  })

  if (picks.length === 0) return { count: 0 }

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
    min_personas: p.minPersonas,
    published_at: now.toISOString(),
    expires_at: expiresAt,
    origen: 'automatica',
  }))

  const { data, error } = await supabase.from('missions').insert(rows).select('id')
  if (error) throw error
  return { count: data.length, expiresAt }
}

// Duelos: la votación pasa por una encuesta de WhatsApp (§3.3), fuera de la
// app. El comité solo teclea aquí el resultado para repartir los puntos.
export async function resolveDuelo({ mission, winnerId, loserId }) {
  const winnerPoints = computeCompleterPoints({ formato: 'duelo', basePoints: mission.base_points, position: 1 })
  const loserPoints = computeCompleterPoints({ formato: 'duelo', basePoints: mission.base_points, position: 2 })
  const { error } = await supabase.from('completions').insert([
    { mission_id: mission.id, player_id: winnerId, points_awarded: winnerPoints, breakdown: { duelo: 'ganador' } },
    { mission_id: mission.id, player_id: loserId, points_awarded: loserPoints, breakdown: { duelo: 'perdedor' } },
  ])
  if (error) throw error
}
