import { useCallback, useEffect, useState } from 'react'
import { fetchPlayerMissions, openMissions } from '../lib/missions'

export function usePlayerMissions(roomId, playerId) {
  const [missions, setMissions] = useState(null)

  const reload = useCallback(async () => {
    const data = await fetchPlayerMissions(roomId, playerId)
    setMissions(data)
  }, [roomId, playerId])

  useEffect(() => {
    reload()
    // Refresco automático (§11.2: cada ~30s es más que suficiente) para
    // que un reparto nuevo del comité aparezca sin que el jugador tenga
    // que cerrar y reabrir la app.
    const tick = setInterval(reload, 30_000)
    return () => clearInterval(tick)
  }, [reload])

  const openAll = useCallback(
    async (missionIds) => {
      await openMissions(missionIds)
      await reload()
    },
    [reload],
  )

  return { missions, reload, openAll }
}
