import { useEffect, useState } from 'react'
import { parseRoomCodeFromHash, ensureAnonSession, fetchRoomByCode, fetchPlayer } from './lib/room'
import RoomCodeEntry from './screens/RoomCodeEntry'
import PlayerSetup from './screens/PlayerSetup'
import MainApp from './screens/MainApp'

function App() {
  const [status, setStatus] = useState('loading')
  const [room, setRoom] = useState(null)
  const [authUserId, setAuthUserId] = useState(null)
  const [player, setPlayer] = useState(null)

  async function loadRoom(code) {
    setStatus('loading')
    try {
      const session = await ensureAnonSession()
      const uid = session.user.id
      setAuthUserId(uid)

      const foundRoom = await fetchRoomByCode(code)
      if (!foundRoom) {
        setStatus('not-found')
        return
      }
      setRoom(foundRoom)

      const foundPlayer = await fetchPlayer(foundRoom.id, uid)
      if (foundPlayer) {
        setPlayer(foundPlayer)
        setStatus('ready')
      } else {
        setStatus('setup')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  useEffect(() => {
    const code = parseRoomCodeFromHash(window.location.hash)
    if (code) {
      loadRoom(code)
    } else {
      setStatus('need-code')
    }
  }, [])

  if (status === 'loading') {
    return <div className="screen-center">Cargando…</div>
  }

  if (status === 'error') {
    return <div className="screen-center">Algo ha fallado. Recarga la página.</div>
  }

  if (status === 'need-code' || status === 'not-found') {
    return (
      <RoomCodeEntry
        notFound={status === 'not-found'}
        onSubmit={(code) => {
          window.location.hash = `#/r/${code}`
          loadRoom(code)
        }}
      />
    )
  }

  if (status === 'setup') {
    return (
      <PlayerSetup
        room={room}
        authUserId={authUserId}
        onComplete={(newPlayer) => {
          setPlayer(newPlayer)
          setStatus('ready')
        }}
      />
    )
  }

  return <MainApp room={room} player={player} />
}

export default App
