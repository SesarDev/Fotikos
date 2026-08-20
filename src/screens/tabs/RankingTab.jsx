const MOCK_RANKING = [
  { id: 1, emoji: '🦊', name: 'Juan', points: 340 },
  { id: 2, emoji: '🐼', name: 'Marta', points: 295 },
  { id: 3, emoji: '🐸', name: 'Susana', points: 210 },
]

export default function RankingTab({ player }) {
  return (
    <div className="stack">
      <section className="section">
        <h2>🏆 Clasificación general</h2>
        <ol className="ranking-list">
          {MOCK_RANKING.map((entry, i) => (
            <li key={entry.id} className={entry.name === player?.name ? 'me' : ''}>
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
        llegarán con la Fase 2.
      </p>
    </div>
  )
}
