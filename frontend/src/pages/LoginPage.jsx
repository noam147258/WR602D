import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [emailOrName, setEmailOrName] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: appel API connexion
  }

  return (
    <div className="login-page">
      <div className="home-bg" aria-hidden>
        <div className="home-bg-layer home-bg-layer--1" />
        <div className="home-bg-layer home-bg-layer--2" />
        <div className="home-bg-layer home-bg-layer--3" />
        <div className="home-bg-layer home-bg-layer--4" />
        <div className="home-bg-noise" />
      </div>

      <header className="login-header">
        <Link to="/" className="back-home" aria-label="Retour à l'accueil">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1 className="login-title">Connexion</h1>
      </header>

      <main className="login-main">
        <section className="login-form-wrap home-glass home-glass--card">
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email" className="login-label">
              Email ou nom
            </label>
            <input
              id="login-email"
              type="text"
              className="login-input"
              placeholder="email or name"
              value={emailOrName}
              onChange={(e) => setEmailOrName(e.target.value)}
              autoComplete="username"
            />
            <label htmlFor="login-password" className="login-label">
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder="MDP"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="submit" className="login-btn">
              CONNEXION
            </button>
          </form>
        </section>

        <div className="login-right" aria-hidden />
      </main>

      <footer className="home-footer home-glass" />
    </div>
  )
}
