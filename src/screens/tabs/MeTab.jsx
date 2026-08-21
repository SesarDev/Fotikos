import { useEffect, useState } from 'react'
import { fetchPendingTags, confirmTag } from '../../lib/completions'
import { fetchRanking } from '../../lib/ranking'
import { countRejectedToday } from '../../lib/missions'
import { updatePlayerProfile } from '../../lib/room'
import { EMOJIS } from '../../data/emojis'

export default function MeTab({ room, player, onPlayerUpdated }) {
  const [pending, setPending] = useState(null)
  const [myPoints, setMyPoints] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [rejectedToday, setRejectedToday] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(player.name)
  const [editEmoji, setEditEmoji] = useState(player.emoji)
  const [savingProfile, setSavingProfile] = useState(false)

  async function reload() {
    const [tags, totals, rejected] = await Promise.all([
      fetchPendingTags(player.id),
      fetchRanking(room.id),
      countRejectedToday(player.id),
    ])
    setPending(tags)
    setMyPoints(Math.round(totals.get(player.id) ?? 0))
    setRejectedToday(rejected)
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

  function startEditing() {
    setEditName(player.name)
    setEditEmoji(player.emoji)
    setEditing(true)
  }

  async function handleSaveProfile() {
    if (!editName.trim()) return
    setSavingProfile(true)
    try {
      const updated = await updatePlayerProfile(player.id, { name: editName.trim(), emoji: editEmoji })
      onPlayerUpdated?.(updated)
      setEditing(false)
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className="stack">
      <section className="section profile-card">
        {!editing ? (
          <>
            <span className="profile-emoji">{player?.emoji}</span>
            <span className="profile-name">{player?.name}</span>
            <button type="button" className="small" onClick={startEditing}>
              Cambiar nombre y avatar
            </button>
          </>
        ) : (
          <div className="stack" style={{ width: '100%' }}>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={24} placeholder="Tu nombre" />
            <div className="emoji-grid">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  className={`emoji-option ${e === editEmoji ? 'selected' : ''}`}
                  onClick={() => setEditEmoji(e)}
                  aria-label={`Avatar ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="card-footer">
              <button type="button" onClick={() => setEditing(false)} disabled={savingProfile}>
                Cancelar
              </button>
              <button type="button" className="primary small" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
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
        <h2>Descartes</h2>
        <p className="muted">
          {rejectedToday === null ? '…' : `${rejectedToday} misión${rejectedToday === 1 ? '' : 'es'} rechazada${rejectedToday === 1 ? '' : 's'} hoy`}
        </p>
      </section>

      <section className="section">
        <button type="button" onClick={() => (window.location.href = window.location.pathname)}>
          Cambiar de sala
        </button>
      </section>
    </div>
  )
}
