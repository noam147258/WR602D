import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { contactDisplayName } from '../utils/contacts'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function truncateUrl(url, max = 56) {
  if (!url || url.length <= max) return url
  return `${url.slice(0, max)}…`
}

export default function ConversionPage() {
  const currentStep = 1
  const [sourceMode, setSourceMode] = useState('url')
  const [url, setUrl] = useState('')
  const [importedList, setImportedList] = useState([])
  const [importedLoading, setImportedLoading] = useState(false)
  const [selectedImportedId, setSelectedImportedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)
  const { theme } = useTheme()
  const { user } = useAuth()
  const userColor = user?.couleurPref || '#036C17'

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
    }
  }, [pdfBlobUrl])

  const clearPreview = useCallback(() => {
    setPdfBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const loadImported = useCallback(async () => {
    setImportedLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/pdf/generations/imported`, { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Impossible de charger les conversions importées')
        setImportedList([])
        return
      }
      setImportedList(Array.isArray(data.generations) ? data.generations : [])
    } catch {
      setError('Erreur réseau')
      setImportedList([])
    } finally {
      setImportedLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sourceMode === 'imported') {
      loadImported()
    }
  }, [sourceMode, loadImported])

  function handleModeChange(mode) {
    setSourceMode(mode)
    setError(null)
    clearPreview()
    if (mode === 'url') {
      setSelectedImportedId('')
    }
  }

  async function handleConvertUrl(e) {
    e.preventDefault()
    setError(null)

    const nextUrl = url.trim()
    if (!nextUrl) return

    clearPreview()

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/pdf/generate-from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: nextUrl }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      setPdfBlobUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err?.message || 'Erreur lors de la conversion')
    } finally {
      setLoading(false)
    }
  }

  async function handleOpenImported(e) {
    e.preventDefault()
    setError(null)
    if (!selectedImportedId) return

    clearPreview()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/pdf/generations/${selectedImportedId}/open`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      setPdfBlobUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err?.message || 'Erreur lors de l’ouverture')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="conversion-page">
      <div className="home-bg" aria-hidden>
        <Grainient
          className="home-bg-canvas"
          color1={theme === 'dark' ? '#031f3a' : '#bbf7d0'}
          color2={userColor}
          color3={theme === 'dark' ? '#9f1239' : '#fecaca'}
        />
        <div className="home-bg-noise" />
      </div>

      <header className="conversion-header">
        <Link to="/dashboard" className="back-home" aria-label="Retour au tableau de bord">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <div className="conversion-header-inner">
          <h1 className="conversion-title">Conversion</h1>
          <div className="conversion-steps" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3} aria-label="Étapes">
            <span className={`conversion-step ${currentStep >= 1 ? 'conversion-step--done' : ''}`} />
            <span className={`conversion-step ${currentStep >= 2 ? 'conversion-step--done' : ''}`} />
            <span className={`conversion-step ${currentStep >= 3 ? 'conversion-step--done' : ''}`} />
          </div>
        </div>
      </header>

      <main className="conversion-main">
        <div className="conversion-flow">
          <section className="conversion-block home-glass home-glass--card">
            <h2 className="conversion-block-title">Source</h2>
            <div className="conversion-block-content conversion-block-content--stack">
              <div className="conversion-source-toggle" role="group" aria-label="Mode de source">
                <button
                  type="button"
                  className={`conversion-source-btn ${sourceMode === 'url' ? 'conversion-source-btn--active' : ''}`}
                  onClick={() => handleModeChange('url')}
                  disabled={loading}
                >
                  URL
                </button>
                <button
                  type="button"
                  className={`conversion-source-btn ${sourceMode === 'imported' ? 'conversion-source-btn--active' : ''}`}
                  onClick={() => handleModeChange('imported')}
                  disabled={loading}
                >
                  Conversion importée
                </button>
              </div>

              {sourceMode === 'url' && (
                <form onSubmit={handleConvertUrl} style={{ width: '100%' }}>
                  <label htmlFor="convert-url">URL à convertir</label>
                  <input
                    id="convert-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? 'Conversion…' : 'Convertir en PDF'}
                  </button>
                  {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
                </form>
              )}

              {sourceMode === 'imported' && (
                <form onSubmit={handleOpenImported} style={{ width: '100%' }}>
                  <p className="conversion-import-hint">
                    Conversions qu’un contact vous a partagées et que vous avez acceptées (page Contacts).
                  </p>
                  {importedLoading && <p className="conversion-placeholder">Chargement…</p>}
                  {!importedLoading && importedList.length === 0 && (
                    <p className="conversion-placeholder">
                      Aucune conversion importée. Acceptez un partage depuis la page Contacts, puis revenez ici.
                    </p>
                  )}
                  {!importedLoading && importedList.length > 0 && (
                    <>
                      <label htmlFor="convert-imported">Choisir une conversion</label>
                      <select
                        id="convert-imported"
                        className="conversion-import-select"
                        value={selectedImportedId}
                        onChange={(e) => setSelectedImportedId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">— Sélectionner —</option>
                        {importedList.map((row) => (
                          <option key={row.id} value={row.id}>
                            {contactDisplayName(row.sharedBy) || 'Contact'}
                            {row.createdAt ? ` — ${new Date(row.createdAt).toLocaleDateString('fr-FR')}` : ''}
                            {' — '}
                            {truncateUrl(row.url, 40)}
                          </option>
                        ))}
                      </select>
                      <button type="submit" disabled={loading || !selectedImportedId}>
                        {loading ? 'Ouverture…' : 'Ouvrir le PDF'}
                      </button>
                    </>
                  )}
                  {error && <p className="error" style={{ margin: '0.75rem 0 0' }}>{error}</p>}
                </form>
              )}
            </div>
          </section>
          <div className="conversion-arrow" aria-hidden>
            <span className="conversion-arrow-icon">→</span>
          </div>
          <section className="conversion-block home-glass home-glass--card">
            <h2 className="conversion-block-title">Résultat</h2>
            <div className="conversion-block-content">
              {!pdfBlobUrl ? (
                <p className="conversion-placeholder">Le PDF s’affichera ici.</p>
              ) : (
                <div className="pdf-preview" style={{ width: '100%', marginTop: 0 }}>
                  <iframe src={pdfBlobUrl} title="Aperçu PDF" />
                  <a href={pdfBlobUrl} download="document.pdf">
                    Télécharger le PDF
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
