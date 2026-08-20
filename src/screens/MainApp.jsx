import { useState } from 'react'
import MissionsTab from './tabs/MissionsTab'
import RankingTab from './tabs/RankingTab'
import MeTab from './tabs/MeTab'

const TABS = [
  { id: 'misiones', label: 'Misiones', icon: '🎯' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
  { id: 'yo', label: 'Yo', icon: '👤' },
]

export default function MainApp({ room, player }) {
  const [tab, setTab] = useState('misiones')

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">MISIONES</span>
        <span className="header-chip">✉️ —</span>
        <span className="header-chip">⏱ —</span>
      </header>

      <main className="app-content">
        {tab === 'misiones' && <MissionsTab room={room} player={player} />}
        {tab === 'ranking' && <RankingTab room={room} player={player} />}
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
