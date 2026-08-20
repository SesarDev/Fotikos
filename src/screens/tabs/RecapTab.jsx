import { useEffect, useState } from 'react'
import { computeRecap } from '../../lib/recap'

function formatMinutes(avgMinutes) {
  if (avgMinutes < 60) return `${Math.round(avgMinutes)} min`
  return `${(avgMinutes / 60).toFixed(1)} h`
}

function AwardRow({ icon, label, entry, suffix }) {
  if (!entry?.player) return null
  return (
    <div className="card">
      <p>
        {icon} <strong>{label}</strong>
      </p>
      <p className="muted">
        {entry.player.emoji} {entry.player.name} · {suffix}
      </p>
    </div>
  )
}

export default function RecapTab({ room }) {
  const [recap, setRecap] = useState(null)

  useEffect(() => {
    computeRecap(room.id).then(setRecap)
  }, [room.id])

  if (!recap) {
    return <p className="muted">Cargando recap…</p>
  }

  const { podium, dailyChampions, awards, stats } = recap
  const whatsappUrl = room.settings?.whatsapp_group_url

  return (
    <div className="stack">
      <section className="section">
        <h2>🏆 Podio final</h2>
        <ol className="ranking-list">
          {podium.map((entry, i) => (
            <li key={entry.player.id}>
              <span className="rank-position">{i + 1}</span>
              <span className="rank-emoji">{entry.player.emoji}</span>
              <span className="rank-name">{entry.player.name}</span>
              <span className="rank-points">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      </section>

      {dailyChampions.length > 0 && (
        <section className="section">
          <h2>📅 Campeones del día</h2>
          {dailyChampions.map((d) => (
            <div className="card" key={d.day}>
              <p className="muted">{d.day}</p>
              {d.player ? (
                <p>
                  {d.player.emoji} {d.player.name} · {d.points} pts
                </p>
              ) : (
                <p className="muted">Sin datos</p>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="section">
        <h2>🎖️ Premios</h2>
        <AwardRow icon="🤝" label="Más solicitado" entry={awards.masSolicitado} suffix={`${awards.masSolicitado?.count} veces etiquetado`} />
        <AwardRow icon="🎭" label="Más colaborador" entry={awards.masColaborador} suffix={`${awards.masColaborador?.count} misiones ajenas`} />
        <AwardRow
          icon="⚡"
          label="Más rápido"
          entry={awards.masRapido}
          suffix={awards.masRapido ? `${formatMinutes(awards.masRapido.avgMinutes)} de media` : ''}
        />
        <AwardRow icon="🌙" label="Criatura de la noche" entry={awards.criaturaNoche} suffix={`${awards.criaturaNoche?.count} misiones de madrugada`} />
        <AwardRow
          icon="📬"
          label="Impaciente"
          entry={awards.impaciente}
          suffix={awards.impaciente ? `${formatMinutes(awards.impaciente.avgMinutes)} en abrir` : ''}
        />
        <AwardRow icon="⚔️" label="Rey del duelo" entry={awards.reyDelDuelo} suffix={`${awards.reyDelDuelo?.count} duelos ganados`} />
      </section>

      <section className="section">
        <h2>🎲 Estadísticas tontas</h2>
        <p className="muted">{stats.totalCompletadas} misiones completadas en total</p>
        {stats.bestPair && (
          <p className="muted">
            La pareja que más veces salió junta: {stats.bestPair.a?.name} y {stats.bestPair.b?.name} ({stats.bestPair.count} veces)
          </p>
        )}
        {stats.bestHour && <p className="muted">La hora más activa: {stats.bestHour.hour}:00</p>}
        <p className="muted">{stats.sinAbrir} misiones se quedaron sin abrir</p>
      </section>

      {whatsappUrl && (
        <section className="section">
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <button type="button" className="primary">
              📷 Ver el álbum en WhatsApp
            </button>
          </a>
        </section>
      )}
    </div>
  )
}
