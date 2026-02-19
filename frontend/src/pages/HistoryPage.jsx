import { Link } from 'react-router-dom'

export default function HistoryPage() {
  return (
    <div className="history-page">
      <div className="home-bg" aria-hidden>
        <div className="home-bg-layer home-bg-layer--1" />
        <div className="home-bg-layer home-bg-layer--2" />
        <div className="home-bg-layer home-bg-layer--3" />
        <div className="home-bg-layer home-bg-layer--4" />
        <div className="home-bg-noise" />
      </div>

      <header className="history-header">
        <Link to="/" className="back-home" aria-label="Retour à l'accueil">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1 className="history-title">Historique de conversions</h1>
      </header>

      <main className="history-main">
        <section className="history-content home-glass home-glass--card">
          <p className="history-placeholder">Liste des conversions…</p>
        </section>
      </main>

      <footer className="home-footer home-glass" />
    </div>
  )
}
