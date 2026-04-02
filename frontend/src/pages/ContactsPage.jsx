import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { contactDisplayName } from '../utils/contacts'

const API_CONTACTS = '/api/contacts'

function fetchWithTimeout(url, opts = {}, ms = 8000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id))
}

export default function ContactsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const userColor = user?.couleurPref || '#036C17'

  const [contacts, setContacts] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingPending, setOutgoingPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [requestActionId, setRequestActionId] = useState(null)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [email, setEmail] = useState('')

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetchWithTimeout(API_CONTACTS, { credentials: 'include', method: 'GET' })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        setError('Session expirée. Reconnectez-vous.')
        setContacts([])
        setIncomingRequests([])
        setOutgoingPending([])
        return
      }
      if (!res.ok) {
        setError(data?.error || 'Impossible de charger les contacts')
        setContacts([])
        setIncomingRequests([])
        setOutgoingPending([])
        return
      }
      setContacts(Array.isArray(data.contacts) ? data.contacts : [])
      setIncomingRequests(Array.isArray(data.incomingRequests) ? data.incomingRequests : [])
      setOutgoingPending(Array.isArray(data.outgoingPending) ? data.outgoingPending : [])
    } catch {
      setError('Erreur réseau ou délai dépassé.')
      setContacts([])
      setIncomingRequests([])
      setOutgoingPending([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSendRequest(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    setInfo(null)
    try {
      const res = await fetchWithTimeout(API_CONTACTS, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Envoi impossible')
        return
      }
      setEmail('')
      if (data.matched && data.message) {
        setInfo(data.message)
      } else {
        setInfo('Demande envoyée. En attente de réponse.')
      }
      await load()
    } catch {
      setError('Erreur réseau ou délai dépassé.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAccept(requestId) {
    setRequestActionId(requestId)
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_CONTACTS}/requests/${requestId}/accept`, {
        credentials: 'include',
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Acceptation impossible')
        return
      }
      setInfo('Contact ajouté.')
      await load()
    } catch {
      setError('Erreur réseau ou délai dépassé.')
    } finally {
      setRequestActionId(null)
    }
  }

  async function handleReject(requestId) {
    setRequestActionId(requestId)
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_CONTACTS}/requests/${requestId}/reject`, {
        credentials: 'include',
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Refus impossible')
        return
      }
      await load()
    } catch {
      setError('Erreur réseau ou délai dépassé.')
    } finally {
      setRequestActionId(null)
    }
  }

  async function handleCancelOutgoing(requestId) {
    setRequestActionId(requestId)
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_CONTACTS}/requests/${requestId}`, {
        credentials: 'include',
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Annulation impossible')
        return
      }
      await load()
    } catch {
      setError('Erreur réseau ou délai dépassé.')
    } finally {
      setRequestActionId(null)
    }
  }

  async function handleDeleteContact(id) {
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_CONTACTS}/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Suppression impossible')
        return
      }
      setContacts((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError('Erreur réseau ou délai dépassé.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="contacts-page">
      <div className="home-bg" aria-hidden>
        <Grainient
          className="home-bg-canvas"
          color1={theme === 'dark' ? '#031f3a' : '#bbf7d0'}
          color2={userColor}
          color3={theme === 'dark' ? '#9f1239' : '#fecaca'}
        />
        <div className="home-bg-noise" />
      </div>

      <header className="contacts-header">
        <Link to="/dashboard" className="back-home" aria-label="Retour au tableau de bord">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1 className="contacts-title">Contacts</h1>
      </header>

      <main className="contacts-main">
        <section className="contacts-content home-glass home-glass--card">
          <p className="contacts-intro">
            Envoyez une demande par e-mail : la personne devra l’accepter pour apparaître dans vos contacts.
            Si elle vous avait déjà envoyé une demande, la connexion est créée automatiquement.
          </p>

          <form className="contacts-add-form" onSubmit={handleSendRequest}>
            <label htmlFor="contact-email" className="contacts-add-label">
              E-mail du membre
            </label>
            <div className="contacts-add-row">
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                className="contacts-add-input login-input"
                placeholder="exemple@domaine.fr"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={saving}
              />
              <button type="submit" className="contacts-add-btn" disabled={saving || !email.trim()}>
                {saving ? '…' : 'Envoyer la demande'}
              </button>
            </div>
          </form>

          {error && <p className="contacts-error" role="alert">{error}</p>}
          {info && <p className="contacts-info" role="status">{info}</p>}

          {loading ? (
            <p className="contacts-placeholder">Chargement…</p>
          ) : (
            <>
              {incomingRequests.length > 0 && (
                <div className="contacts-section">
                  <h2 className="contacts-section-title">Demandes reçues</h2>
                  <ul className="contacts-list contacts-list--requests">
                    {incomingRequests.map((row) => {
                      const u = row.requester
                      return (
                        <li key={row.id} className="contacts-list-item contacts-list-item--request">
                          <div className="contacts-list-item-body">
                            {u?.photo && (u.photo.startsWith('data:') || u.photo.startsWith('http')) ? (
                              <img src={u.photo} alt="" className="contacts-list-avatar" />
                            ) : (
                              <span className="contacts-list-avatar contacts-list-avatar--placeholder" aria-hidden>
                                {(contactDisplayName(u) || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div className="contacts-list-item-text">
                              <span className="contacts-list-item-name">{contactDisplayName(u)}</span>
                              <span className="contacts-list-item-email">{u?.email}</span>
                            </div>
                          </div>
                          <div className="contacts-request-actions">
                            <button
                              type="button"
                              className="contacts-accept-btn"
                              onClick={() => handleAccept(row.id)}
                              disabled={requestActionId === row.id}
                            >
                              {requestActionId === row.id ? '…' : 'Accepter'}
                            </button>
                            <button
                              type="button"
                              className="contacts-reject-btn"
                              onClick={() => handleReject(row.id)}
                              disabled={requestActionId === row.id}
                            >
                              Refuser
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {outgoingPending.length > 0 && (
                <div className="contacts-section">
                  <h2 className="contacts-section-title">En attente de réponse</h2>
                  <ul className="contacts-list">
                    {outgoingPending.map((row) => {
                      const u = row.recipient
                      return (
                        <li key={row.id} className="contacts-list-item contacts-list-item--request">
                          <div className="contacts-list-item-body">
                            {u?.photo && (u.photo.startsWith('data:') || u.photo.startsWith('http')) ? (
                              <img src={u.photo} alt="" className="contacts-list-avatar" />
                            ) : (
                              <span className="contacts-list-avatar contacts-list-avatar--placeholder" aria-hidden>
                                {(contactDisplayName(u) || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div className="contacts-list-item-text">
                              <span className="contacts-list-item-name">{contactDisplayName(u)}</span>
                              <span className="contacts-list-item-email">{u?.email}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="contacts-cancel-btn"
                            onClick={() => handleCancelOutgoing(row.id)}
                            disabled={requestActionId === row.id}
                          >
                            {requestActionId === row.id ? '…' : 'Annuler'}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <div className="contacts-section">
                <h2 className="contacts-section-title">Mes contacts</h2>
                {contacts.length === 0 ? (
                  <p className="contacts-placeholder contacts-placeholder--inline">Aucun contact pour le moment.</p>
                ) : (
                  <ul className="contacts-list">
                    {contacts.map((c) => (
                      <li key={c.id} className="contacts-list-item">
                        <div className="contacts-list-item-body">
                          {c.photo && (c.photo.startsWith('data:') || c.photo.startsWith('http')) ? (
                            <img src={c.photo} alt="" className="contacts-list-avatar" />
                          ) : (
                            <span className="contacts-list-avatar contacts-list-avatar--placeholder" aria-hidden>
                              {(contactDisplayName(c) || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div className="contacts-list-item-text">
                            <span className="contacts-list-item-name">{contactDisplayName(c)}</span>
                            <span className="contacts-list-item-email">{c.email}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="contacts-delete-btn"
                          onClick={() => handleDeleteContact(c.id)}
                          disabled={deletingId === c.id}
                          aria-label={`Retirer ${contactDisplayName(c)}`}
                        >
                          {deletingId === c.id ? '…' : 'Retirer'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
