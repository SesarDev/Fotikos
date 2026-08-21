import { useEffect, useState } from 'react'
import { computeRecap } from '../../lib/recap'

function RankList({ entries, playerId, emptyText }) {
  if (entries.length === 0) return <p className="muted">{emptyText}</p>
  return (
    <ol className="ranking-list">
      {entries.map((entry, i) => (
        <li key={entry.player.id} className={entry.player.id === playerId ? 'me' : ''}>
          <span className="rank-position">{i + 1}</span>
          <span className="rank-emoji">{entry.player.emoji}</span>
          <span className="rank-name">{entry.player.name}</span>
          <span className="rank-points">{entry.points} pts</span>
        </li>
      ))}
    </ol>
  )
}

function AwardLine({ icon, label, entry, suffix }) {
  if (!entry?.player) return <p className="muted">{label}: todavía nadie</p>
  return (
    <p>
      {icon} <strong>{label}:</strong> {entry.player.emoji} {entry.player.name} {suffix ? `(${suffix})` : ''}
    </p>
  )
}

export default function RankingTab({ room, player, roomPlayers }) {
  const [recap, setRecap] = useState(null)

  useEffect(() => {
    computeRecap(room.id).then(setRecap)
    const tick = setInterval(() => computeRecap(room.id).then(setRecap), 30_000)
    return () => clearInterval(tick)
  }, [room.id])

  if (!recap || !roomPlayers) {
    return <p className="muted">Cargando clasificación…</p>
  }

  // La general incluye a todos, aunque tengan 0 puntos; la de hoy solo a
  // quien ya ha sumado algo.
  const general = roomPlayers
    .map((p) => ({ player: p, points: recap.podium.find((e) => e.player.id === p.id)?.points ?? 0 }))
    .sort((a, b) => b.points - a.points)

  return (
    <div className="stack">
      <section className="section">
        <h2>🏆 Clasificación general</h2>
        <RankList entries={general} playerId={player.id} emptyText="Todavía no hay puntos." />
      </section>

      <section className="section">
        <h2>📅 Clasificación de hoy</h2>
        <RankList entries={recap.today} playerId={player.id} emptyText="Todavía nadie ha puntuado hoy." />
      </section>

      <section className="section">
        <h2>🎖️ Otras tablas</h2>
        <AwardLine icon="🤝" label="Más solicitado" entry={recap.awards.masSolicitado} suffix={recap.awards.masSolicitado ? `${recap.awards.masSolicitado.count} veces` : ''} />
        <AwardLine icon="🎭" label="Más colaborador" entry={recap.awards.masColaborador} suffix={recap.awards.masColaborador ? `${recap.awards.masColaborador.count} misiones` : ''} />
        <AwardLine icon="⚔️" label="Rey del duelo" entry={recap.awards.reyDelDuelo} suffix={recap.awards.reyDelDuelo ? `${recap.awards.reyDelDuelo.count} ganados` : ''} />
      </section>
    </div>
  )
}
