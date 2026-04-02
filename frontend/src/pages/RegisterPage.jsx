import { useState } from 'react'
import { Link, useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { getPlanLabel } from '../utils/plans'
import { useAuth } from '../context/AuthContext'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan') || ''
  const planLabel = getPlanLabel(planId)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [photo, setPhoto] = useState(null)
  const [dob, setDob] = useState('')
  const [favColor, setFavColor] = useState('#036C17')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { theme } = useTheme()
  const userColor = favColor || '#036C17'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères')
      return
    }
    setSubmitting(true)
    const result = await register({
      nom,
      prenom,
      photo,
      dateNaissance: dob,
      couleurPref: favColor,
      email,
      telephone,
      password,
      planId: planId || 'free',
    })
    setSubmitting(false)
    if (result.ok) {
      const selected = (planId || 'free').trim()
      if (selected !== 'free') {
        window.location.href = `/payment/checkout/${encodeURIComponent(selected)}`
      } else {
        navigate('/dashboard', { replace: true })
      }
    } else {
      setError(result.error)
    }
  }

  /**
   * Réduit la photo avant envoi (évite JSON énorme → 413 / échec PHP).
   */
  function compressImageFile(file, maxWidth = 800, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas indisponible'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Image invalide'))
      }
      img.src = url
    })
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      setPhoto(null)
      return
    }
    try {
      const dataUrl = await compressImageFile(file)
      setPhoto(dataUrl)
    } catch {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="register-page">
      <div className="home-bg" aria-hidden>
        <Grainient
          className="home-bg-canvas"
          color1={theme === 'dark' ? '#031f3a' : '#bbf7d0'}
          color2={userColor}
          color3={theme === 'dark' ? '#9f1239' : '#fecaca'}
        />
        <div className="home-bg-noise" />
      </div>

      <main className="register-main">
        <div className="register-layout home-glass home-glass--card">
          <div className="register-form-col">
            <Link to="/" className="register-back" aria-label="Retour à l'accueil">
              <span className="register-back-arrow" aria-hidden>←</span>
              Accueil
            </Link>
            <h1 className="register-title">Créer un compte</h1>
          <div className="register-hero">
            <div className="register-plan-badge">
              <span className="register-plan-label">Plan sélectionné</span>
              <span className="register-plan-value">{planLabel || 'Aucun plan'}</span>
            </div>
            <label className="register-photo-zone" htmlFor="reg-photo">
              <input
                id="reg-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                aria-label="Photo de profil"
              />
              {photo ? (
                <img src={photo} alt="" className="register-photo-img" />
              ) : (
                <span className="register-photo-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Photo de profil</span>
                </span>
              )}
            </label>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {error && <p className="register-error" role="alert">{error}</p>}

            <section className="register-section">
              <h2 className="register-section-title">Identité</h2>
              <div className="register-grid register-grid--2">
                <div className="register-field">
                  <label htmlFor="reg-nom" className="register-label">Nom</label>
                  <input
                    id="reg-nom"
                    type="text"
                    className="register-input"
                    placeholder="Votre nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
                <div className="register-field">
                  <label htmlFor="reg-prenom" className="register-label">Prénom</label>
                  <input
                    id="reg-prenom"
                    type="text"
                    className="register-input"
                    placeholder="Votre prénom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="register-field">
                  <label htmlFor="reg-dob" className="register-label">Date de naissance</label>
                  <input
                    id="reg-dob"
                    type="date"
                    className="register-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    autoComplete="bday"
                  />
                </div>
                <div className="register-field register-field--color">
                  <label htmlFor="reg-color" className="register-label">Couleur préférée</label>
                  <div className="register-color-row">
                    <input
                      id="reg-color"
                      type="color"
                      className="register-color-input"
                      value={favColor}
                      onChange={(e) => setFavColor(e.target.value)}
                      title="Couleur préférée"
                    />
                    <span className="register-color-value">{favColor}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="register-section">
              <h2 className="register-section-title">Contact</h2>
              <div className="register-grid register-grid--1">
                <div className="register-field register-field--full">
                  <label htmlFor="reg-email" className="register-label">Adresse email</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="register-input"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="register-field register-field--full">
                  <label htmlFor="reg-telephone" className="register-label">Téléphone</label>
                  <input
                    id="reg-telephone"
                    type="tel"
                    className="register-input"
                    placeholder="06 12 34 56 78"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </section>

            <section className="register-section">
              <h2 className="register-section-title">Sécurité</h2>
              <div className="register-grid register-grid--1">
                <div className="register-field register-field--full">
                  <label htmlFor="reg-password" className="register-label">Mot de passe</label>
                  <input
                    id="reg-password"
                    type="password"
                    className="register-input"
                    placeholder="Minimum 4 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="register-field register-field--full">
                  <label htmlFor="reg-confirm" className="register-label">Confirmer le mot de passe</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    className="register-input"
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </section>

            <div className="register-footer">
              <button type="submit" className="register-btn register-btn--submit" disabled={submitting}>
                {submitting ? 'Inscription en cours…' : "Créer mon compte"}
              </button>
              <p className="register-login-prompt">
                Vous avez déjà un compte ?{' '}
                <Link to={planId ? `/login?plan=${planId}` : '/login'} className="register-login-link">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
          </div>
          <div className="register-content-col" aria-hidden>
            <div className="register-content-grid" />
            <span className="register-placeholder-text">Espace réservé au contenu</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
