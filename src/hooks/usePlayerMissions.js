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
