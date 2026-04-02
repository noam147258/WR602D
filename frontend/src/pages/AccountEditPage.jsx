import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'

/** Nombre de confirmations selon le plan : plus c'est cher, plus on en demande (effet comique). */
function getDeleteConfirmCount(planId) {
  const counts = {
    free: 2,
    basic: 3,
    'basic+': 4,
    advanced: 5,
    pro: 6,
    ultra: 7,
    'ultra deluxe': 8,
    premium: 9,
    'premium pro': 10,
    'ultra premium pro': 11,
    'ultra premium pro +': 12,
    gold: 13,
    platinium: 14,
    legendary: 15,
    pigeon: 20,
  }
  return counts[planId] ?? 3
}

const DELETE_CONFIRM_MESSAGES = [
  'Êtes-vous sûr ?',
  'Vraiment sûr ?',
  'Sérieusement ?',
  'Dernière chance…',
  'Non mais vraiment.',
  'Réfléchissez bien.',
  "C'est irréversible.",
  "On ne revient pas en arrière.",
  'Dernier avertissement.',
  'Bon, vous l\'aurez voulu.',
  'Votre historique partira en fumée.',
  'Les PDFs ne pleureront pas.',
  'Une dernière fois : vous confirmez ?',
  'Nous ne pourrons pas vous ressusciter.',
  'Même le plan Pigeon ne vous sauvera pas.',
  'Dernière confirmation. La vraie.',
  'C\'est la 17e. Vous tenez vraiment à partir ?',
  'Presque fini. Encore une.',
  'Avant-dernière. Promis.',
  'D\'accord. C\'est parti. Adieu.',
]

/** Positions pour les modales de confirmation (un peu partout à l'écran). */
const DELETE_CONFIRM_POSITIONS = [
  { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  { top: '18%', left: '12%' },
  { top: '22%', right: '10%', left: 'auto' },
  { bottom: '30%', left: '8%', top: 'auto' },
  { bottom: '25%', right: '15%', top: 'auto' },
  { top: '12%', left: '50%', transform: 'translateX(-50%)' },
  { bottom: '15%', left: '50%', transform: 'translateX(-50%)', top: 'auto' },
  { top: '50%', left: '8%', transform: 'translateY(-50%)' },
  { top: '50%', right: '8%', transform: 'translateY(-50%)', left: 'auto' },
  { top: '35%', left: '25%' },
  { top: '40%', right: '20%', left: 'auto' },
  { bottom: '35%', right: '25%', top: 'auto' },
  { bottom: '40%', left: '30%', top: 'auto' },
  { top: '28%', left: '60%' },
  { bottom: '28%', left: '55%', top: 'auto' },
  { top: '60%', right: '30%' },
  { top: '65%', left: '18%' },
  { bottom: '50%', right: '8%', top: 'auto' },
  { top: '8%', right: '35%' },
  { bottom: '8%', left: '40%', top: 'auto' },
]

export default function AccountEditPage() {
  const { user, updateProfile, deleteAccount, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()

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
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(null)
  const [deleteConfirmTotal, setDeleteConfirmTotal] = useState(0)
  const userColor = user?.couleurPref || '#036C17'

  useEffect(() => {
    if (user) {
      setNom(user.nom || '')
      setPrenom(user.prenom || '')
      setPhoto(user.photo || null)
      setDob(user.dateNaissance || '')
      setFavColor(user.couleurPref || '#036C17')
      setEmail(user.email || '')
      setTelephone(user.telephone || '')
    }
  }, [user])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password && password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères')
      return
    }
    setSubmitting(true)
    const result = await updateProfile({
      nom,
      prenom,
      photo,
      dateNaissance: dob || null,
      couleurPref: favColor,
      email,
      telephone,
      password: password || undefined,
    })
    setSubmitting(false)
    if (result.ok) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result)
      reader.readAsDataURL(file)
    } else {
      setPhoto(null)
    }
  }

  function startDeleteConfirm() {
    const count = getDeleteConfirmCount(user?.planId || 'free')
    setDeleteConfirmTotal(count)
    setDeleteConfirmStep(0)
    setError('')
  }

  function cancelDeleteConfirm() {
    setDeleteConfirmStep(null)
    setError('Suppression annulée.')
  }

  async function confirmDeleteStep() {
    const total = deleteConfirmTotal
    const next = deleteConfirmStep + 1
    if (next >= total) {
      setDeleteConfirmStep(null)
      const result = await deleteAccount()
      if (result.ok) {
        navigate('/', { replace: true })
      } else {
        setError(result.error || 'Erreur lors de la suppression.')
      }
    } else {
      setDeleteConfirmStep(next)
    }
  }

  const isDeleteConfirmOpen = deleteConfirmStep !== null
  const confirmMessage = isDeleteConfirmOpen
    ? DELETE_CONFIRM_MESSAGES[deleteConfirmStep % DELETE_CONFIRM_MESSAGES.length]
    : ''
  const confirmPosition = isDeleteConfirmOpen
    ? DELETE_CONFIRM_POSITIONS[deleteConfirmStep % DELETE_CONFIRM_POSITIONS.length]
    : {}
  const confirmStepLabel = isDeleteConfirmOpen
    ? `Confirmation ${deleteConfirmStep + 1} / ${deleteConfirmTotal}`
    : ''

  return (
    <div className="register-page">
      {isDeleteConfirmOpen && (
        <div className="delete-confirm-overlay" aria-modal="true" role="dialog" aria-labelledby="delete-confirm-title">
          <div
            className="delete-confirm-card home-glass"
            style={{
              position: 'fixed',
              ...confirmPosition,
              zIndex: 10001,
            }}
          >
            <p id="delete-confirm-title" className="delete-confirm-step">{confirmStepLabel}</p>
            <p className="delete-confirm-message">{confirmMessage}</p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-confirm-btn delete-confirm-btn--cancel" onClick={cancelDeleteConfirm}>
                Annuler
              </button>
              <button type="button" className="delete-confirm-btn delete-confirm-btn--confirm" onClick={confirmDeleteStep}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

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
            <Link to="/dashboard" className="register-back" aria-label="Retour au tableau de bord">
              <span className="register-back-arrow" aria-hidden>←</span>
              Tableau de bord
            </Link>
            <h1 className="register-title">Modifier mes informations</h1>
            <div className="register-hero">
              <label className="register-photo-zone" htmlFor="edit-photo">
                <input
                  id="edit-photo"
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
                    <label htmlFor="edit-nom" className="register-label">Nom</label>
                    <input
                      id="edit-nom"
                      type="text"
                      className="register-input"
                      placeholder="Votre nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                  <div className="register-field">
                    <label htmlFor="edit-prenom" className="register-label">Prénom</label>
                    <input
                      id="edit-prenom"
                      type="text"
                      className="register-input"
                      placeholder="Votre prénom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="register-field">
                    <label htmlFor="edit-dob" className="register-label">Date de naissance</label>
                    <input
                      id="edit-dob"
                      type="date"
                      className="register-input"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      autoComplete="bday"
                    />
                  </div>
                  <div className="register-field register-field--color">
                    <label htmlFor="edit-color" className="register-label">Couleur préférée</label>
                    <div className="register-color-row">
                      <input
                        id="edit-color"
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
                    <label htmlFor="edit-email" className="register-label">Adresse email</label>
                    <input
                      id="edit-email"
                      type="email"
                      className="register-input"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="register-field register-field--full">
                    <label htmlFor="edit-telephone" className="register-label">Téléphone</label>
                    <input
                      id="edit-telephone"
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
                <h2 className="register-section-title">Changer le mot de passe (optionnel)</h2>
                <div className="register-grid register-grid--1">
                  <div className="register-field register-field--full">
                    <label htmlFor="edit-password" className="register-label">Nouveau mot de passe</label>
                    <input
                      id="edit-password"
                      type="password"
                      className="register-input"
                      placeholder="Laisser vide pour ne pas modifier"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="register-field register-field--full">
                    <label htmlFor="edit-confirm" className="register-label">Confirmer le mot de passe</label>
                    <input
                      id="edit-confirm"
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
                  {submitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
              </div>

              <section className="register-section register-section--danger">
                <h2 className="register-section-title register-section-title--danger">Zone de danger</h2>
                <p className="register-danger-text">
                  Supprimer votre compte efface toutes vos données (profil, historique, conversions). Cette action est irréversible.
                </p>
                <button
                  type="button"
                  className="register-btn register-btn--danger"
                  onClick={startDeleteConfirm}
                  disabled={submitting}
                  aria-label="Supprimer définitivement mon compte"
                >
                  Supprimer mon compte
                </button>
              </section>
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
