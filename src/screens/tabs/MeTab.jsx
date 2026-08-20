export default function MeTab({ player }) {
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
        <p className="muted">El desglose de puntos llega con la Fase 2.</p>
      </section>

      <section className="section">
        <h2>Etiquetas pendientes de confirmar</h2>
        <p className="muted">No tienes ninguna pendiente.</p>
      </section>

      <section className="section">
        <h2>Descarte del día</h2>
        <p className="muted">Todavía no has usado tu descarte de hoy.</p>
      </section>
    </div>
  )
}
