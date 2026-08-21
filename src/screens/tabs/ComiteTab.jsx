import { useEffect, useState } from 'react'
import {
  sendEncargo,
  saveDraft,
  fetchDrafts,
  sendDraft,
  deleteDraft,
  fetchActiveMissions,
  cancelMission,
  countTodayEncargosForTarget,
  resolveDuelo,
  updateWhatsappGroupUrl,
  dropPersonalMissions,
  setPlayerOrganizer,
  fetchAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  buildDropAnnouncement,
  buildDuelCitation,
  buildDuelResult,
  buildSessionClose,
} from '../../lib/comite'
import { fetchRoomPlayers, fetchRanking } from '../../lib/ranking'
import { shareToWhatsApp } from '../../lib/whatsapp'

const FORMATOS = ['personal', 'carrera', 'duelo', 'cooperativa']
const DIFICULTADES = [
  { value: 'facil', label: 'Fácil · 10 pts' },
  { value: 'media', label: 'Media · 25 pts' },
  { value: 'dificil', label: 'Difícil · 50 pts' },
  { value: 'epica', label: 'Épica · 100 pts' },
]
const DURATIONS = [
  { value: 0.75, label: '45 min (duelo)' },
  { value: 2, label: '2 h' },
  { value: 3, label: '3 h' },
  { value: 12, label: '12 h (cooperativa)' },
  { value: 24, label: '24 h' },
  { value: '', label: 'Hasta el cierre de sesión' },
]

function emptyForm() {
  return { text: '', formato: 'personal', targetIds: [], dificultad: 'media', durationHours: '' }
}

export default function ComiteTab({ room, roomPlayers }) {
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [drafts, setDrafts] = useState(null)
  const [activeMissions, setActiveMissions] = useState(null)
  const [whatsappUrl, setWhatsappUrl] = useState(room.settings?.whatsapp_group_url ?? '')
  const [savingUrl, setSavingUrl] = useState(false)
  const [dropCount, setDropCount] = useState(1)
  const [dropping, setDropping] = useState(false)
  const [dropResult, setDropResult] = useState(null)
  const [members, setMembers] = useState(roomPlayers)
  const [promoting, setPromoting] = useState(null)

  async function reload() {
    const [d, m, p] = await Promise.all([fetchDrafts(room.id), fetchActiveMissions(room.id), fetchRoomPlayers(room.id)])
    setDrafts(d)
    setActiveMissions(m)
    setMembers(p)
  }

  async function handleTogglePromote(player) {
    setPromoting(player.id)
    try {
      await setPlayerOrganizer(player.id, !player.is_organizer)
      const p = await fetchRoomPlayers(room.id)
      setMembers(p)
    } finally {
      setPromoting(null)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id])

  function toggleTarget(playerId) {
    setForm((f) => ({
      ...f,
      targetIds: f.targetIds.includes(playerId)
        ? f.targetIds.filter((id) => id !== playerId)
        : [...f.targetIds, playerId],
    }))
  }

  async function warnIfOverTarget(targetIds) {
    for (const id of targetIds) {
      const count = await countTodayEncargosForTarget(room.id, id)
      if (count >= 3) {
        const name = roomPlayers.find((p) => p.id === id)?.name ?? id
        if (!window.confirm(`${name} ya tiene ${count} encargos hoy. ¿Enviar de todas formas?`)) {
          return false
        }
      }
    }
    return true
  }

  async function handleSend() {
    if (!form.text.trim()) return
    if (!(await warnIfOverTarget(form.targetIds))) return
    setSending(true)
    try {
      await sendEncargo({ roomId: room.id, ...form, targetIds: form.targetIds })
      if (form.formato === 'duelo' && form.targetIds.length === 2) {
        const [aName, bName] = form.targetIds.map((id) => roomPlayers.find((p) => p.id === id)?.name ?? '?')
        await shareToWhatsApp(buildDuelCitation({ aName, bName }))
      }
      setForm(emptyForm())
      await reload()
    } finally {
      setSending(false)
    }
  }

  async function handleSaveDraft() {
    if (!form.text.trim()) return
    setSending(true)
    try {
      const scheduledFor = window.prompt('¿A qué hora quieres programarlo? (HH:MM, hoy)')
      let scheduledForIso = null
      if (scheduledFor) {
        const [h, m] = scheduledFor.split(':').map(Number)
        const d = new Date()
        d.setHours(h || 0, m || 0, 0, 0)
        scheduledForIso = d.toISOString()
      }
      await saveDraft({ roomId: room.id, ...form, targetIds: form.targetIds, scheduledFor: scheduledForIso })
      setForm(emptyForm())
      await reload()
    } finally {
      setSending(false)
    }
  }

  async function handleSendDraft(draft) {
    if (!(await warnIfOverTarget(draft.target_ids))) return
    await sendDraft(draft)
    await reload()
  }

  async function handleDeleteDraft(draftId) {
    await deleteDraft(draftId)
    await reload()
  }

  async function handleCancel(missionId) {
    await cancelMission(missionId)
    await reload()
  }

  async function handleResolveDuelo(mission, winnerId, loserId) {
    await resolveDuelo({ mission, winnerId, loserId })
    const winnerName = roomPlayers?.find((p) => p.id === winnerId)?.name ?? '?'
    await shareToWhatsApp(buildDuelResult(winnerName))
    await reload()
  }

  const activeDuelos = (activeMissions ?? []).filter(
    (m) => m.formato === 'duelo' && m.target_ids?.length === 2,
  )

  async function handleSaveUrl() {
    setSavingUrl(true)
    try {
      await updateWhatsappGroupUrl(room, whatsappUrl.trim())
    } finally {
      setSavingUrl(false)
    }
  }

  async function handleCloseSession() {
    const totals = await fetchRanking(room.id)
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1])
    const [leaderId, leaderPoints] = ranked[0] ?? []
    const leaderName = roomPlayers?.find((p) => p.id === leaderId)?.name ?? '?'
    await shareToWhatsApp(buildSessionClose({ leaderName, leaderPoints: leaderPoints ?? 0 }))
  }

  async function handleDropAll() {
    setDropping(true)
    setDropResult(null)
    try {
      const result = await dropPersonalMissions({ room, roomPlayers, count: dropCount })
      setDropResult(result)
      await reload()
    } finally {
      setDropping(false)
    }
  }

  return (
    <div className="stack">
      <section className="section">
        <h2>🛠️ Comité de la sala</h2>
        {(members ?? []).map((p) => (
          <div className="card-footer" key={p.id}>
            <span>
              {p.emoji} {p.name} {p.is_organizer && '· comité'}
            </span>
            <button type="button" className="small" onClick={() => handleTogglePromote(p)} disabled={promoting === p.id}>
              {promoting === p.id ? '…' : p.is_organizer ? 'Quitar comité' : 'Hacer comité'}
            </button>
          </div>
        ))}
      </section>

      <section className="section">
        <h2>🎲 Reparto aleatorio</h2>
        <p className="muted">Reparte misiones personales a todos los jugadores de la sala, sorteadas del catálogo.</p>
        <div className="stack-row">
          <input
            type="number"
            min="1"
            max="5"
            value={dropCount}
            onChange={(e) => setDropCount(Math.max(1, Number(e.target.value)))}
            style={{ width: 70 }}
          />
          <button type="button" className="primary" onClick={handleDropAll} disabled={dropping}>
            {dropping ? 'Repartiendo…' : `Repartir a todos ahora (${roomPlayers?.length ?? 0} jugadores)`}
          </button>
        </div>
        {dropResult && <p className="muted">Repartidas {dropResult.count} misiones.</p>}
      </section>

      <section className="section">
        <h2>📣 Avisos por WhatsApp</h2>
        <p className="muted">Un aviso genérico sirve para todos — nadie sabe qué le ha tocado a nadie (§4).</p>
        <div className="stack-row">
          <button type="button" onClick={() => shareToWhatsApp(buildDropAnnouncement())}>
            🔔 Se han repartido sobres
          </button>
          <button type="button" onClick={handleCloseSession}>
            😴 Cerrar sesión
          </button>
        </div>
      </section>

      <section className="section">
        <h2>📷 Enlace del grupo de WhatsApp</h2>
        <div className="stack-row">
          <input value={whatsappUrl} onChange={(e) => setWhatsappUrl(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
          <button type="button" onClick={handleSaveUrl} disabled={savingUrl}>
            {savingUrl ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        <p className="muted">Aparecerá en el Recap para descargar el álbum (§12).</p>
      </section>

      <section className="section">
        <h2>✏️ Nuevo encargo</h2>
        <div className="stack">
          <textarea
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="Texto de la misión"
            rows={3}
          />

          <label>
            Formato
            <select value={form.formato} onChange={(e) => setForm((f) => ({ ...f, formato: e.target.value, targetIds: [] }))}>
              {FORMATOS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>

          {form.formato !== 'carrera' && (
            <div>
              <p className="muted">A quién</p>
              <div className="tag-chip-row">
                {(roomPlayers ?? []).map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={`tag-chip ${form.targetIds.includes(p.id) ? 'selected' : ''}`}
                    onClick={() => toggleTarget(p.id)}
                  >
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label>
            Nivel
            <select value={form.dificultad} onChange={(e) => setForm((f) => ({ ...f, dificultad: e.target.value }))}>
              {DIFICULTADES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Caduca
            <select
              value={form.durationHours}
              onChange={(e) => setForm((f) => ({ ...f, durationHours: e.target.value ? Number(e.target.value) : '' }))}
            >
              {DURATIONS.map((d) => (
                <option key={d.label} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <div className="card-footer">
            <button type="button" onClick={handleSaveDraft} disabled={sending}>
              Programar
            </button>
            <button type="button" className="primary" onClick={handleSend} disabled={sending}>
              {sending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>🗂️ Borradores pendientes</h2>
        {!drafts && <p className="muted">Cargando…</p>}
        {drafts?.length === 0 && <p className="muted">No hay borradores guardados.</p>}
        {drafts?.map((d) => (
          <div className="card" key={d.id}>
            <p>{d.text}</p>
            <p className="muted">
              {d.formato} · {d.dificultad}
              {d.scheduled_for ? ` · programado ${new Date(d.scheduled_for).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
            <div className="card-footer">
              <button type="button" onClick={() => handleDeleteDraft(d.id)}>
                Borrar
              </button>
              <button type="button" className="primary small" onClick={() => handleSendDraft(d)}>
                Enviar ahora
              </button>
            </div>
          </div>
        ))}
      </section>

      {activeDuelos.length > 0 && (
        <section className="section">
          <h2>⚔️ Duelos por resolver</h2>
          {activeDuelos.map((m) => {
            const [aId, bId] = m.target_ids
            const a = roomPlayers?.find((p) => p.id === aId)
            const b = roomPlayers?.find((p) => p.id === bId)
            return (
              <div className="card" key={m.id}>
                <p>{m.rendered_text}</p>
                <div className="card-footer">
                  <button type="button" onClick={() => handleResolveDuelo(m, aId, bId)}>
                    Ganó {a?.name}
                  </button>
                  <button type="button" onClick={() => handleResolveDuelo(m, bId, aId)}>
                    Ganó {b?.name}
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      )}

      <section className="section">
        <h2>📋 Misiones activas de la sala</h2>
        {!activeMissions && <p className="muted">Cargando…</p>}
        {activeMissions?.map((m) => {
          const assignee = roomPlayers?.find((p) => p.id === m.assignee_id)
          const targets = (m.target_ids ?? [])
            .map((id) => roomPlayers?.find((p) => p.id === id)?.name)
            .filter(Boolean)
          const who = [assignee?.name, ...targets].filter(Boolean)
          return (
            <div className="card" key={m.id}>
              <div className="card-tags">
                <span className="chip">{m.formato}</span>
                <span className="chip">{m.origen}</span>
              </div>
              <p>{m.rendered_text}</p>
              <p className="muted">{who.length > 0 ? `Para: ${who.join(', ')}` : 'De toda la sala'}</p>
              <div className="card-footer">
                <span className="points">{m.base_points} pts</span>
                <button type="button" onClick={() => handleCancel(m.id)}>
                  Anular
                </button>
              </div>
            </div>
          )
        })}
      </section>

      <BancoMisiones room={room} />
    </div>
  )
}

const MEDIAS = ['foto', 'video', 'cualquiera']

function emptyTemplateForm() {
  return { text: '', formato: 'personal', dificultad: 'media', media: 'foto', tags: '' }
}

function BancoMisiones({ room }) {
  const [templates, setTemplates] = useState(null)
  const [form, setForm] = useState(emptyTemplateForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)

  async function reload() {
    const data = await fetchAllTemplates(room.id)
    setTemplates(data)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id])

  async function handleCreate() {
    if (!form.text.trim()) return
    setSaving(true)
    try {
      await createTemplate({
        roomId: room.id,
        text: form.text.trim(),
        formato: form.formato,
        dificultad: form.dificultad,
        media: form.media,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      setForm(emptyTemplateForm())
      await reload()
    } finally {
      setSaving(false)
    }
  }

  function startEdit(t) {
    setEditingId(t.id)
    setEditForm({ text: t.text, formato: t.formato, dificultad: t.dificultad, media: t.media, tags: (t.tags ?? []).join(', ') })
  }

  async function handleSaveEdit(id) {
    setSaving(true)
    try {
      await updateTemplate(id, {
        text: editForm.text.trim(),
        formato: editForm.formato,
        dificultad: editForm.dificultad,
        media: editForm.media,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      setEditingId(null)
      await reload()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Borrar esta misión del banco?')) return
    await deleteTemplate(id)
    await reload()
  }

  return (
    <section className="section">
      <h2>🗃️ Banco de misiones</h2>
      <p className="muted">Catálogo compartido por todas las salas (más las propias de esta sala, si las hay).</p>

      <div className="stack">
        <textarea
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          placeholder="Texto de la misión (usa {A} y {B} para nombrar jugadores)"
          rows={2}
        />
        <div className="stack-row">
          <select value={form.formato} onChange={(e) => setForm((f) => ({ ...f, formato: e.target.value }))}>
            {FORMATOS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select value={form.dificultad} onChange={(e) => setForm((f) => ({ ...f, dificultad: e.target.value }))}>
            {DIFICULTADES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <select value={form.media} onChange={(e) => setForm((f) => ({ ...f, media: e.target.value }))}>
            {MEDIAS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="tags separados por coma (ej: noche, grupo)"
        />
        <button type="button" className="primary" onClick={handleCreate} disabled={saving}>
          {saving ? 'Añadiendo…' : 'Añadir al banco'}
        </button>
      </div>

      <div className="stack" style={{ marginTop: 16 }}>
        {!templates && <p className="muted">Cargando…</p>}
        {templates?.map((t) =>
          editingId === t.id ? (
            <div className="card" key={t.id}>
              <textarea value={editForm.text} onChange={(e) => setEditForm((f) => ({ ...f, text: e.target.value }))} rows={2} />
              <div className="stack-row">
                <select value={editForm.formato} onChange={(e) => setEditForm((f) => ({ ...f, formato: e.target.value }))}>
                  {FORMATOS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <select value={editForm.dificultad} onChange={(e) => setEditForm((f) => ({ ...f, dificultad: e.target.value }))}>
                  {DIFICULTADES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select value={editForm.media} onChange={(e) => setEditForm((f) => ({ ...f, media: e.target.value }))}>
                  {MEDIAS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <input value={editForm.tags} onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))} placeholder="tags" />
              <div className="card-footer">
                <button type="button" onClick={() => setEditingId(null)} disabled={saving}>
                  Cancelar
                </button>
                <button type="button" className="primary small" onClick={() => handleSaveEdit(t.id)} disabled={saving}>
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="card" key={t.id}>
              <div className="card-tags">
                <span className={`chip chip-${t.dificultad}`}>{t.dificultad}</span>
                <span className="chip">{t.formato}</span>
                {t.room_id === null && <span className="chip">global</span>}
              </div>
              <p>{t.text}</p>
              <p className="muted">{(t.tags ?? []).join(', ')}</p>
              <div className="card-footer">
                <span className="points">{t.base_points} pts</span>
                <div className="stack-row">
                  <button type="button" className="small" onClick={() => startEdit(t)}>
                    Editar
                  </button>
                  <button type="button" className="small" onClick={() => handleDelete(t.id)}>
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  )
}
