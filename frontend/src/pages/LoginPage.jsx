import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [emailOrName, setEmailOrName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const userColor = '#036C17' // couleur par défaut sur l'écran de login

  if (isAuthenticated) return <Navigate to={from} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(emailOrName, password)
    setSubmitting(false)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="login-page">
      <div className="home-bg" aria-hidden>
        <Grainient
          className="home-bg-canvas"
          color1={theme === 'dark' ? '#031f3a' : '#bbf7d0'}
          color2={userColor}
          color3={theme === 'dark' ? '#9f1239' : '#fecaca'}
        />
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
            {error && <p className="error" role="alert">{error}</p>}
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
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Connexion…' : 'CONNEXION'}
            </button>
          </form>
        </section>

        <div className="login-right" aria-hidden />
      </main>

      <Footer />
    </div>
  )
}
