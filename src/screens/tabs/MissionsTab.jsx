import { useEffect, useState } from 'react'
import { dificultadFromPoints, countRejectedToday, rejectMission } from '../../lib/missions'
import { isWithinRapidezBonus } from '../../lib/schedule'
import { completeMission, buildCaption } from '../../lib/completions'

function timeLeft(expiresAt, now) {
  const ms = new Date(expiresAt).getTime() - now.getTime()
  if (ms <= 0) return 'caducada'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function isMine(mission, playerId) {
  return mission.completions.some((c) => c.player_id === playerId)
}

export default function MissionsTab({ missions, onOpenAll, onCompleted, roomPlayers, player }) {
  const [now, setNow] = useState(new Date())
  const [opening, setOpening] = useState(false)
  const [canReject, setCanReject] = useState(true)

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    countRejectedToday(player.id).then((count) => setCanReject(count < 1))
  }, [player.id, missions])

  if (!missions) {
    return <p className="muted">Cargando misiones…</p>
  }

  const notExpired = missions.filter((m) => new Date(m.expires_at) > now)
  const unopened = notExpired.filter((m) => !m.opened_at)
  const opened = notExpired.filter((m) => m.opened_at && !isMine(m, player.id))
  const expiringSoon = opened.filter((m) => new Date(m.expires_at) - now < 2 * 3_600_000)
  const restOpened = opened.filter((m) => !expiringSoon.includes(m))
  const completedToday = missions.filter((m) => isMine(m, player.id))

  async function handleOpenAll() {
    setOpening(true)
    try {
      await onOpenAll(unopened.map((m) => m.id))
    } finally {
      setOpening(false)
    }
  }

  async function handleReject(missionId) {
    await rejectMission(missionId)
    await onCompleted()
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
            <MissionCard
              key={m.id}
              mission={m}
              now={now}
              roomPlayers={roomPlayers}
              player={player}
              onCompleted={onCompleted}
              canReject={canReject}
              onReject={handleReject}
            />
          ))}
        </section>
      )}

      <section className="section">
        <h2>🎯 Abiertas</h2>
        {restOpened.length === 0 && <p className="muted">No tienes misiones abiertas.</p>}
        {restOpened.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            now={now}
            roomPlayers={roomPlayers}
            player={player}
            onCompleted={onCompleted}
            canReject={canReject}
            onReject={handleReject}
          />
        ))}
      </section>

      <section className="section">
        <h2>✅ Completadas hoy</h2>
        {completedToday.length === 0 && <p className="muted">Todavía no has completado ninguna.</p>}
        {completedToday.map((m) => (
          <div className="card" key={m.id}>
            <p>{m.rendered_text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

function MissionCard({ mission, now, roomPlayers, player, onCompleted, canReject, onReject }) {
  const dificultad = dificultadFromPoints(mission.base_points)
  const rapidez = isWithinRapidezBonus(mission.opened_at, now)
  const [tagging, setTagging] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [submitting, setSubmitting] = useState(false)

  function startTagging() {
    const defaults = Object.values(mission.slot_values ?? {}).map((v) => v.id)
    setSelectedIds(new Set(defaults))
    setTagging(true)
  }

  function toggle(playerId) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(playerId)) next.delete(playerId)
      else next.add(playerId)
      return next
    })
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const caption = buildCaption(mission)
      try {
        await navigator.clipboard.writeText(caption)
      } catch {
        // el portapapeles puede fallar por permisos; el usuario aún puede copiar a mano
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank')

      await completeMission({
        mission,
        playerId: player.id,
        tagPlayerIds: [...selectedIds],
      })
      await onCompleted()
    } finally {
      setSubmitting(false)
    }
  }

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
        {!tagging && (
          <div className="stack-row">
            {canReject && (
              <button type="button" className="small" onClick={() => onReject(mission.id)}>
                No, gracias
              </button>
            )}
            <button type="button" className="primary small" onClick={startTagging}>
              Completada
            </button>
          </div>
        )}
      </div>

      {tagging && (
        <div className="stack tag-picker">
          <p className="muted">¿Con quién? (opcional)</p>
          <div className="tag-chip-row">
            {(roomPlayers ?? [])
              .filter((p) => p.id !== player.id)
              .map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`tag-chip ${selectedIds.has(p.id) ? 'selected' : ''}`}
                  onClick={() => toggle(p.id)}
                >
                  {p.emoji} {p.name}
                </button>
              ))}
          </div>
          <button type="button" className="primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Enviando…' : 'Confirmar y abrir WhatsApp'}
          </button>
        </div>
      )}
    </div>
  )
}
