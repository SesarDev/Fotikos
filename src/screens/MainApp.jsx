import { useEffect, useState } from 'react'
import MissionsTab from './tabs/MissionsTab'
import RankingTab from './tabs/RankingTab'
import MeTab from './tabs/MeTab'
import { usePlayerMissions } from '../hooks/usePlayerMissions'
import { isGameAsleep } from '../lib/schedule'
import { fetchRoomPlayers } from '../lib/ranking'

const TABS = [
  { id: 'misiones', label: 'Misiones', icon: '🎯' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
  { id: 'yo', label: 'Yo', icon: '👤' },
]

export default function MainApp({ room, player }) {
  const [tab, setTab] = useState('misiones')
  const [roomPlayers, setRoomPlayers] = useState(null)
  const { missions, reload, openAll } = usePlayerMissions(room.id, player.id)

  useEffect(() => {
    fetchRoomPlayers(room.id).then(setRoomPlayers)
  }, [room.id])

  if (isGameAsleep()) {
    return (
      <div className="screen-center">
        <p>😴 El juego vuelve a las 14:00</p>
      </div>
    )
  }

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
