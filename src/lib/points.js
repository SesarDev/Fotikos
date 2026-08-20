// Fórmula de puntuación (§6.1): puntos = base × rapidez × posición × grupo × día
// - rapidez solo aplica a personales.
// - posición solo aplica a carreras.
// - duelo y cómplice son casos especiales, planos, sin el resto de multiplicadores.
// El multiplicador de día está fijo a 1 hasta que la sala tenga sesiones
// reales cargadas con sus fechas (checklist "una semana antes", §16).

export function computeCompleterPoints({ formato, basePoints, rapidezBonus = false, position = null, diaMultiplier = 1 }) {
  if (formato === 'duelo') {
    return position === 1 ? basePoints : basePoints * 0.3
  }
  let points = basePoints
  if (formato === 'personal' && rapidezBonus) points *= 1.5
  if (formato === 'carrera' && position) {
    points *= position === 1 ? 3 : position === 2 ? 2 : position === 3 ? 1.5 : 1
  }
  return points * diaMultiplier
}

export function grupoMultiplier(confirmedCount, minPersonas) {
  const extra = Math.max(0, confirmedCount - minPersonas)
  return Math.min(2, 1 + extra * 0.1)
}

export const COMPLICE_SHARE = 0.3
export const MAX_COMPLICE_CONFIRMATIONS_PER_PAIR_PER_DAY = 3
