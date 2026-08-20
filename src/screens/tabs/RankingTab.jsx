import { useEffect, useState } from 'react'
import { fetchRanking } from '../../lib/ranking'

export default function RankingTab({ room, player, roomPlayers }) {
  const [totals, setTotals] = useState(null)

  useEffect(() => {
    fetchRanking(room.id).then(setTotals)
  }, [room.id])

  if (!totals || !roomPlayers) {
    return <p className="muted">Cargando clasificación…</p>
  }

  const entries = roomPlayers
    .map((p) => ({ ...p, points: Math.round(totals.get(p.id) ?? 0) }))
    .sort((a, b) => b.points - a.points)

  return (
    <div className="stack">
      <section className="section">
        <h2>🏆 Clasificación general</h2>
        <ol className="ranking-list">
          {entries.map((entry, i) => (
            <li key={entry.id} className={entry.id === player.id ? 'me' : ''}>
              <span className="rank-position">{i + 1}</span>
              <span className="rank-emoji">{entry.emoji}</span>
              <span className="rank-name">{entry.name}</span>
              <span className="rank-points">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      </section>
      <p className="muted">
        Clasificación diaria y otras tablas (más solicitado, más colaborador, más madrugador)
        llegarán con el recap de la Fase 4.
      </p>
    </div>
  )
}
