import { useEffect, useState } from 'react'
import { fetchPendingTags, confirmTag } from '../../lib/completions'
import { fetchRanking } from '../../lib/ranking'

export default function MeTab({ room, player }) {
  const [pending, setPending] = useState(null)
  const [myPoints, setMyPoints] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  async function reload() {
    const [tags, totals] = await Promise.all([fetchPendingTags(player.id), fetchRanking(room.id)])
    setPending(tags)
    setMyPoints(Math.round(totals.get(player.id) ?? 0))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id, player.id])

  async function handleConfirm(tag) {
    setConfirmingId(tag.completion_id)
    try {
      await confirmTag({
        completionId: tag.completion_id,
        playerId: player.id,
        basePoints: tag.completions.missions.base_points,
      })
      await reload()
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="stack">
      <section className="section profile-card">
        <span className="profile-emoji">{player?.emoji}</span>
        <span className="profile-name">{player?.name}</span>
        <button type="button" className="small">
          Cambiar nombre y avatar
        </button>
      </section>

      <section className="section">
        <h2>Tus puntos</h2>
        <p className="points">{myPoints === null ? '…' : `${myPoints} pts`}</p>
      </section>

      <section className="section">
        <h2>Etiquetas pendientes de confirmar</h2>
        {!pending && <p className="muted">Cargando…</p>}
        {pending?.length === 0 && <p className="muted">No tienes ninguna pendiente.</p>}
        {pending?.map((tag) => (
          <div className="card" key={tag.completion_id}>
            <p>{tag.completions.missions.rendered_text}</p>
            <div className="card-footer">
              <span className="points">+{Math.round(tag.completions.missions.base_points * 0.3)} pts si confirmas</span>
              <button
                type="button"
                className="primary small"
                onClick={() => handleConfirm(tag)}
                disabled={confirmingId === tag.completion_id}
              >
                {confirmingId === tag.completion_id ? 'Confirmando…' : 'Sí, estaba ahí'}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="section">
        <h2>Descarte del día</h2>
        <p className="muted">Todavía no has usado tu descarte de hoy.</p>
      </section>
    </div>
  )
}
