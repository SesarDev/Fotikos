// Horarios del juego, simplificados a Europe/Madrid = UTC+2 (agosto, §11.6).
// Todo lo demás del código guarda y compara timestamps en UTC.

const MADRID_UTC_OFFSET_HOURS = 2

function toMadridParts(date) {
  const madrid = new Date(date.getTime() + MADRID_UTC_OFFSET_HOURS * 3600_000)
  return {
    hours: madrid.getUTCHours(),
    minutes: madrid.getUTCMinutes(),
    dateUTC: madrid, // fecha "shiftada" que se puede leer como si fuera UTC=Madrid
  }
}

function madridLocalToUtc(y, m, d, hh, mm) {
  return new Date(Date.UTC(y, m, d, hh - MADRID_UTC_OFFSET_HOURS, mm))
}

// El juego duerme entre las 04:00 y las 14:00 hora de Madrid (§2.3).
export function isGameAsleep(now = new Date()) {
  const { hours } = toMadridParts(now)
  return hours >= 4 && hours < 14
}

// Caducidad de una misión repartida en `now` (§4.1):
// - normalmente expira en el próximo cierre de sesión (04:00 Madrid).
// - si se reparte entre las 00:00 y las 04:00, sobrevive hasta las 16:00
//   del día siguiente, para no dejar casi sin ventana a quien recibe tarde.
export function computeExpiresAt(now = new Date()) {
  const { hours, dateUTC } = toMadridParts(now)
  const y = dateUTC.getUTCFullYear()
  const m = dateUTC.getUTCMonth()
  const d = dateUTC.getUTCDate()

  if (hours < 4) {
    // Repartido de madrugada: expira a las 16:00 del mismo día "de calendario Madrid".
    return madridLocalToUtc(y, m, d, 16, 0)
  }

  // Próximas 04:00: si ya pasaron las 04:00 de hoy, es la de mañana.
  return madridLocalToUtc(y, m, d + 1, 4, 0)
}

// Bonus de rapidez: ×1,5 si se completa dentro de los 90 min tras abrir (§4.1).
export const RAPIDEZ_BONUS_WINDOW_MS = 90 * 60_000

export function isWithinRapidezBonus(openedAt, now = new Date()) {
  if (!openedAt) return false
  return now.getTime() - new Date(openedAt).getTime() <= RAPIDEZ_BONUS_WINDOW_MS
}

// Filtro simple de tags por franja horaria (§7.5): nada de misiones de barra
// a media tarde, nada de misiones de día a las tantas de la noche.
export function isTagAllowedAtHour(tags, madridHour) {
  const isNight = madridHour >= 22 || madridHour < 6
  const isDay = madridHour >= 10 && madridHour < 20
  if (!isNight && (tags.includes('noche') || tags.includes('barra'))) return false
  if (!isDay && tags.includes('dia')) return false
  return true
}

export function currentMadridHour(now = new Date()) {
  return toMadridParts(now).hours
}
