import { useState } from 'react'
import { createPlayer, fetchPlayerByName, claimPlayer } from '../lib/room'
import { EMOJIS } from '../data/emojis'

const RULES = [
  'Las misiones son un juego de honor: no hay jueces, solo el grupo de WhatsApp.',
  'Las fotos y vídeos se mandan al grupo de WhatsApp del juego, no aquí.',
  'Puedes rechazar cualquier misión sin dar explicaciones ni perder puntos.',
  'Respeta a quien no quiera salir en una foto.',
  'Lo que se manda al grupo, se queda en el grupo.',
]

export default function PlayerSetup({ room, authUserId, onComplete }) {
  const [step, setStep] = useState('profile') // profile | claim | rules
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [existingPlayer, setExistingPlayer] = useState(null)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleProfileSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setChecking(true)
    setError(null)
    try {
      const existing = await fetchPlayerByName(room.id, name)
      if (existing) {
        setExistingPlayer(existing)
        setStep('claim')
      } else {
        setStep('rules')
      }
    } catch (err) {
      console.error(err)
      setError('No se ha podido comprobar. Prueba otra vez.')
    } finally {
      setChecking(false)
    }
  }

  async function handleClaim() {
    setSaving(true)
    setError(null)
    try {
      const player = await claimPlayer({ playerId: existingPlayer.id, authUserId })
      onComplete(player)
    } catch (err) {
      console.error(err)
      setError('No se ha podido recuperar. Prueba otra vez.')
      setSaving(false)
    }
  }

  function handleNotMe() {
    setExistingPlayer(null)
    setStep('profile')
    setName('')
  }

  async function handleAccept() {
    setSaving(true)
    setError(null)
    try {
      const player = await createPlayer({
        roomId: room.id,
        authUserId,
        name: name.trim(),
        emoji,
      })
      onComplete(player)
    } catch (err) {
      console.error(err)
      setError('No se ha podido guardar. Prueba otra vez.')
      setSaving(false)
    }
  }

  if (step === 'claim') {
    return (
      <div className="screen">
        <h1>¿Eres tú?</h1>
        <p className="muted">
          Ya hay un jugador llamado {existingPlayer.emoji} {existingPlayer.name} en esta sala. Si entras desde
          otro dispositivo, recuperas tus puntos.
        </p>
        {error && <p className="error">{error}</p>}
        <button type="button" className="primary" onClick={handleClaim} disabled={saving}>
          {saving ? 'Recuperando…' : 'Sí, soy yo'}
        </button>
        <button type="button" onClick={handleNotMe} disabled={saving}>
          No, soy otra persona
        </button>
      </div>
    )
  }

  if (step === 'rules') {
    return (
      <div className="screen">
        <h1>Antes de entrar</h1>
        <ul className="rules-list">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        {error && <p className="error">{error}</p>}
        <button type="button" className="primary" onClick={handleAccept} disabled={saving}>
          {saving ? 'Entrando…' : 'Acepto y quiero jugar'}
        </button>
      </div>
    )
  }

  return (
    <div className="screen">
      <h1>{room.name}</h1>
      <p className="muted">Elige tu nombre y un emoji para que te reconozcan.</p>
      <form onSubmit={handleProfileSubmit} className="stack">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          maxLength={24}
          autoFocus
        />
        <div className="emoji-grid">
          {EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              className={`emoji-option ${e === emoji ? 'selected' : ''}`}
              onClick={() => setEmoji(e)}
              aria-label={`Avatar ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary" disabled={checking}>
          {checking ? 'Comprobando…' : 'Continuar'}
        </button>
      </form>
    </div>
  )
}
