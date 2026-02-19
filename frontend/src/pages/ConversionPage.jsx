import { Link } from 'react-router-dom'

export default function ConversionPage() {
  const currentStep = 1

  return (
    <div className="conversion-page">
      <div className="home-bg" aria-hidden>
        <div className="home-bg-layer home-bg-layer--1" />
        <div className="home-bg-layer home-bg-layer--2" />
        <div className="home-bg-layer home-bg-layer--3" />
        <div className="home-bg-layer home-bg-layer--4" />
        <div className="home-bg-noise" />
      </div>

      <header className="conversion-header">
        <Link to="/" className="back-home" aria-label="Retour à l'accueil">
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
            <div className="conversion-block-content">
              <p className="conversion-placeholder">URL ou document à convertir…</p>
            </div>
          </section>
          <div className="conversion-arrow" aria-hidden>
            <span className="conversion-arrow-icon">→</span>
          </div>
          <section className="conversion-block home-glass home-glass--card">
            <h2 className="conversion-block-title">Résultat</h2>
            <div className="conversion-block-content">
              <p className="conversion-placeholder">PDF généré…</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="home-footer home-glass" />
    </div>
  )
}
