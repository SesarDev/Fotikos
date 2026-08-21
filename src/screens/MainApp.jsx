import { useEffect, useState } from 'react'
import MissionsTab from './tabs/MissionsTab'
import RankingTab from './tabs/RankingTab'
import MeTab from './tabs/MeTab'
import ComiteTab from './tabs/ComiteTab'
import RecapTab from './tabs/RecapTab'
import { usePlayerMissions } from '../hooks/usePlayerMissions'
import { fetchRoomPlayers } from '../lib/ranking'
import { isOrganizer } from '../lib/comite'

export default function MainApp({ room, player, authUserId }) {
  const [tab, setTab] = useState('misiones')
  const [roomPlayers, setRoomPlayers] = useState(null)
  const { missions, reload, openAll } = usePlayerMissions(room.id, player.id)
  const organizer = isOrganizer(room, authUserId)

  useEffect(() => {
    fetchRoomPlayers(room.id).then(setRoomPlayers)
  }, [room.id])

  const TABS = [
    { id: 'misiones', label: 'Misiones', icon: '🎯' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' },
    { id: 'yo', label: 'Yo', icon: '👤' },
    { id: 'recap', label: 'Recap', icon: '🎉' },
    ...(organizer ? [{ id: 'comite', label: 'Comité', icon: '🛠️' }] : []),
  ]

  const unopenedCount = missions?.filter((m) => !m.opened_at && new Date(m.expires_at) > new Date()).length ?? 0

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">MISIONES</span>
        <span className="header-chip">✉️ {unopenedCount}</span>
      </header>

      <main className="app-content">
        {tab === 'misiones' && (
          <MissionsTab missions={missions} onOpenAll={openAll} onCompleted={reload} roomPlayers={roomPlayers} player={player} />
        )}
        {tab === 'ranking' && <RankingTab room={room} player={player} roomPlayers={roomPlayers} />}
        {tab === 'yo' && <MeTab room={room} player={player} />}
        {tab === 'recap' && <RecapTab room={room} />}
        {tab === 'comite' && organizer && <ComiteTab room={room} roomPlayers={roomPlayers} />}
      </main>

      <nav className="app-tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-button ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
