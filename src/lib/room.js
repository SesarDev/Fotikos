import { supabase } from './supabase'

export function parseRoomCodeFromHash(hash) {
  const match = /^#\/r\/([A-Za-z0-9]+)/.exec(hash || '')
  return match ? match[1].toUpperCase() : null
}

export async function ensureAnonSession() {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) return sessionData.session

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.session
}

export async function fetchRoomByCode(code) {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, code, name, organizer_ids')
    .eq('code', code)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchPlayer(roomId, authUserId) {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, emoji, accepted_rules_at')
    .eq('room_id', roomId)
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createPlayer({ roomId, authUserId, name, emoji }) {
  const { data, error } = await supabase
    .from('players')
    .insert({
      room_id: roomId,
      auth_user_id: authUserId,
      name,
      emoji,
      accepted_rules_at: new Date().toISOString(),
    })
    .select('id, name, emoji, accepted_rules_at')
    .single()
  if (error) throw error
  return data
}
