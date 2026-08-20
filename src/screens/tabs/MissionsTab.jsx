import { useEffect, useState } from 'react'
import { dificultadFromPoints } from '../../lib/missions'
import { isWithinRapidezBonus } from '../../lib/schedule'

function timeLeft(expiresAt, now) {
  const ms = new Date(expiresAt).getTime() - now.getTime()
  if (ms <= 0) return 'caducada'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function MissionsTab({ missions, onOpenAll }) {
  const [now, setNow] = useState(new Date())
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(tick)
  }, [])

  if (!missions) {
    return <p className="muted">Cargando misiones…</p>
  }

  const notExpired = missions.filter((m) => new Date(m.expires_at) > now)
  const unopened = notExpired.filter((m) => !m.opened_at)
  const opened = notExpired.filter((m) => m.opened_at)
  const expiringSoon = opened.filter((m) => new Date(m.expires_at) - now < 2 * 3_600_000)
  const restOpened = opened.filter((m) => !expiringSoon.includes(m))

  async function handleOpenAll() {
    setOpening(true)
    try {
      await onOpenAll(unopened.map((m) => m.id))
    } finally {
      setOpening(false)
    }
  }

  return (
    <div className="stack">
      {unopened.length > 0 && (
        <section className="section">
          <h2>✉️ Sobres sin abrir</h2>
          <button type="button" className="envelope-card" onClick={handleOpenAll} disabled={opening}>
            <span>
              {unopened.length} sobre{unopened.length > 1 ? 's' : ''} sin abrir
            </span>
            <span className="primary-chip">{opening ? 'Abriendo…' : 'Abrir'}</span>
          </button>
        </section>
      )}

      {expiringSoon.length > 0 && (
        <section className="section">
          <h2>⚡ Caducan pronto</h2>
          {expiringSoon.map((m) => (
            <MissionCard key={m.id} mission={m} now={now} />
          ))}
        </section>
      )}

      <section className="section">
        <h2>🎯 Abiertas</h2>
        {restOpened.length === 0 && <p className="muted">No tienes misiones abiertas.</p>}
        {restOpened.map((m) => (
          <MissionCard key={m.id} mission={m} now={now} />
        ))}
      </section>
    </div>
  )
}

function MissionCard({ mission, now }) {
  const dificultad = dificultadFromPoints(mission.base_points)
  const rapidez = isWithinRapidezBonus(mission.opened_at, now)
  return (
    <div className="card">
      <div className="card-tags">
        <span className={`chip chip-${dificultad}`}>{dificultad}</span>
        {rapidez && <span className="chip">⚡ bonus rapidez</span>}
      </div>
      <p>{mission.rendered_text}</p>
      <div className="card-footer">
        <span className="points">
          +{mission.base_points} pts · caduca en {timeLeft(mission.expires_at, now)}
        </span>
        <button type="button" className="primary small">
          Completada
        </button>
      </div>
    </div>
  )
}
