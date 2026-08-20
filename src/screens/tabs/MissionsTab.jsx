const MOCK_ENVELOPES = 2
const MOCK_EXPIRING = [
  { id: 1, dificultad: 'media', puntos: 25, texto: 'Selfie con alguien imitando una estatua del pueblo' },
]
const MOCK_OPEN = [
  { id: 2, dificultad: 'facil', puntos: 10, texto: 'Foto de tu desayuno con alguien de testigo al fondo' },
]

export default function MissionsTab() {
  return (
    <div className="stack">
      <section className="section">
        <h2>✉️ Sobres sin abrir</h2>
        <button type="button" className="envelope-card">
          <span>{MOCK_ENVELOPES} sobres sin abrir</span>
          <span className="primary-chip">Abrir</span>
        </button>
      </section>

      <section className="section">
        <h2>⚡ Caducan pronto</h2>
        {MOCK_EXPIRING.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </section>

      <section className="section">
        <h2>🎯 Abiertas</h2>
        {MOCK_OPEN.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </section>

      <section className="section">
        <h2>✅ Completadas hoy</h2>
        <p className="muted">Todavía no has completado ninguna.</p>
      </section>
    </div>
  )
}

function MissionCard({ mission }) {
  return (
    <div className="card">
      <div className="card-tags">
        <span className={`chip chip-${mission.dificultad}`}>{mission.dificultad}</span>
      </div>
      <p>{mission.texto}</p>
      <div className="card-footer">
        <span className="points">+{mission.puntos} pts</span>
        <button type="button" className="primary small">
          Completada
        </button>
      </div>
    </div>
  )
}
