import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function PdfGeneratePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setPdfBlobUrl(null)
    if (!url.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/pdf/generate-from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      setPdfBlobUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page pdf-page page--with-footer">
      <div className="page-main">
        <Link to="/" className="back-home" aria-label="Retour à l'accueil">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1>Générer un PDF depuis une URL</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="url">URL de la page à convertir en PDF</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Génération…' : 'Générer le PDF'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {pdfBlobUrl && (
          <div className="pdf-preview">
            <iframe src={pdfBlobUrl} title="Aperçu PDF" />
            <a href={pdfBlobUrl} download="document.pdf">
              Télécharger le PDF
            </a>
          </div>
        )}
      </div>
      <footer className="home-footer home-glass" />
    </div>
  )
}
