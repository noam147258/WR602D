import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function formatDateDisplay(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function truncateUrl(url, max = 72) {
  if (!url || url.length <= max) return url
  return `${url.slice(0, max)}…`
}

export default function HistoryPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [shareGenId, setShareGenId] = useState(null)
  const [contactsForShare, setContactsForShare] = useState([])
  const [contactsForShareLoading, setContactsForShareLoading] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState('')
  const [shareBusy, setShareBusy] = useState(false)
  const [shareError, setShareError] = useState(null)
  const [shareInfo, setShareInfo] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_BASE}/api/pdf/generations`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data?.error || `Erreur ${res.status}`)
          return
        }
        if (!cancelled && data?.ok && Array.isArray(data?.generations)) {
          setGenerations(data.generations)
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Erreur de chargement')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchHistory()
    return () => { cancelled = true }
  }, [])

  async function openShareModal(genId) {
    setShareGenId(genId)
    setSelectedContactId('')
    setShareError(null)
    setShareInfo(null)
    setContactsForShareLoading(true)
    setContactsForShare([])
    try {
      const res = await fetch(`${API_BASE}/api/contacts`, { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setShareError(data?.error || 'Impossible de charger les contacts')
        return
      }
      setContactsForShare(Array.isArray(data.contacts) ? data.contacts : [])
    } catch {
      setShareError('Erreur réseau')
    } finally {
      setContactsForShareLoading(false)
    }
  }

  function closeShareModal() {
    setShareGenId(null)
    setShareError(null)
    setSelectedContactId('')
  }

  async function submitShare(e) {
    e.preventDefault()
    if (!shareGenId || !selectedContactId) return
    setShareBusy(true)
    setShareError(null)
    try {
      const res = await fetch(`${API_BASE}/api/pdf/generations/${shareGenId}/share`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userContactId: Number(selectedContactId) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setShareError(data?.error || 'Partage impossible')
        return
      }
      setShareInfo('Conversion envoyée. Le contact verra la demande dans sa page Contacts.')
      closeShareModal()
    } catch {
      setShareError('Erreur réseau')
    } finally {
      setShareBusy(false)
    }
  }

  return (
    <div className="history-page">
      <div className="home-bg" aria-hidden>
        <Grainient
          className="home-bg-canvas"
          color1={theme === 'dark' ? '#031f3a' : '#bbf7d0'}
          color2={user?.couleurPref || '#036C17'}
          color3={theme === 'dark' ? '#9f1239' : '#fecaca'}
        />
        <div className="home-bg-noise" />
      </div>

      <header className="history-header">
        <Link to="/dashboard" className="back-home" aria-label="Retour au tableau de bord">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1 className="history-title">Historique de conversions</h1>
      </header>

      <main className="history-main">
        <section className="history-content home-glass home-glass--card">
          {shareInfo && <p className="history-share-info" role="status">{shareInfo}</p>}
          {loading && <p className="history-placeholder">Chargement…</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && generations.length === 0 && (
            <p className="history-placeholder">Aucune conversion pour le moment.</p>
          )}
          {!loading && !error && generations.length > 0 && (
            <ul className="history-list">
              {generations.map((g) => (
                <li key={g.id} className="history-list-item">
                  <div className="history-list-item-main">
                    <span className="history-list-date">{formatDateDisplay(g.createdAt)}</span>
                    <span className="history-list-url" title={g.url}>{truncateUrl(g.url)}</span>
                  </div>
                  <button
                    type="button"
                    className="history-share-btn"
                    onClick={() => openShareModal(g.id)}
                  >
                    Partager
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {shareGenId != null && (
        <div className="history-modal-backdrop" role="presentation" onClick={closeShareModal}>
          <div
            className="history-modal home-glass home-glass--card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-share-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h2 id="history-share-title" className="history-modal-title">Envoyer à un contact</h2>
            <p className="history-modal-hint">
              Choisissez un contact : il recevra une demande sur sa page Contacts (à accepter ou refuser).
            </p>
            {contactsForShareLoading && <p className="history-placeholder">Chargement des contacts…</p>}
            {!contactsForShareLoading && shareError && (
              <p className="contacts-error" role="alert">{shareError}</p>
            )}
            {!contactsForShareLoading && !shareError && contactsForShare.length === 0 && (
              <p className="history-placeholder">
                Aucun contact. Ajoutez-en depuis la page Contacts.
              </p>
            )}
            {!contactsForShareLoading && contactsForShare.length > 0 && (
              <form onSubmit={submitShare} className="history-share-form">
                <label htmlFor="share-contact" className="history-modal-label">Contact</label>
                <select
                  id="share-contact"
                  className="history-share-select login-input"
                  value={selectedContactId}
                  onChange={(ev) => setSelectedContactId(ev.target.value)}
                  required
                >
                  <option value="">— Choisir —</option>
                  {contactsForShare.map((c) => (
                    <option key={c.id} value={c.id}>
                      {[c.prenom, c.nom].filter(Boolean).join(' ').trim() || c.email}
                      {c.email ? ` (${c.email})` : ''}
                    </option>
                  ))}
                </select>
                <div className="history-modal-actions">
                  <button type="button" className="history-modal-cancel" onClick={closeShareModal}>
                    Annuler
                  </button>
                  <button type="submit" className="contacts-add-btn" disabled={shareBusy || !selectedContactId}>
                    {shareBusy ? '…' : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}
            {!contactsForShareLoading && contactsForShare.length === 0 && !shareError && (
              <div className="history-modal-actions">
                <button type="button" className="history-modal-cancel" onClick={closeShareModal}>
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
