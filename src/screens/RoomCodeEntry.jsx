import { useState } from 'react'

export default function RoomCodeEntry({ notFound, onSubmit }) {
  const [code, setCode] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="screen">
      <h1>🎯 Misiones</h1>
      <p className="muted">Introduce el código de la sala que te han pasado.</p>
      <form onSubmit={handleSubmit} className="stack">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de sala"
          autoCapitalize="characters"
          autoFocus
        />
        {notFound && <p className="error">No existe ninguna sala con ese código.</p>}
        <button type="submit" className="primary">
          Entrar
        </button>
      </form>
    </div>
  )
}
