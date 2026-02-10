import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPlanLabel } from '../utils/plans'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan') || ''
  const planLabel = getPlanLabel(planId)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dob, setDob] = useState('')
  const [favColor, setFavColor] = useState('#036C17')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: appel API inscription
  }

  return (
    <div className="register-page">
      <div className="home-bg" aria-hidden>
        <div className="home-bg-layer home-bg-layer--1" />
        <div className="home-bg-layer home-bg-layer--2" />
        <div className="home-bg-layer home-bg-layer--3" />
        <div className="home-bg-layer home-bg-layer--4" />
        <div className="home-bg-noise" />
      </div>

      <header className="register-header">
        <Link to="/" className="back-home" aria-label="Retour à l'accueil">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1 className="register-title">Vous êtes nouveau ?</h1>
      </header>

      <main className="register-main">
        <div className="register-side register-side--left" aria-hidden />
        <section className="register-form-wrap home-glass home-glass--card">
          <h2 className="register-subtitle">Inscription</h2>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-field">
              <label htmlFor="reg-plan" className="register-label">Plan choisi</label>
              <input
                id="reg-plan"
                type="text"
                className="register-input register-input--readonly"
                value={planLabel || 'Aucun plan sélectionné'}
                readOnly
                aria-readonly="true"
              />
            </div>
            <div className="register-row">
              <div className="register-field">
                <label htmlFor="reg-nom" className="register-label">Nom</label>
                <input
                  id="reg-nom"
                  type="text"
                  className="register-input"
                  placeholder="nom"
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
                  placeholder="prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div className="register-row">
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
                <div className="register-color-wrap">
                  <input
                    id="reg-color"
                    type="color"
                    className="register-color-input"
                    value={favColor}
                    onChange={(e) => setFavColor(e.target.value)}
                    title="Couleur préférée"
                  />
                  <span className="register-color-value" aria-hidden>{favColor}</span>
                </div>
              </div>
            </div>
            <div className="register-field">
              <label htmlFor="reg-email" className="register-label">Email</label>
              <input
                id="reg-email"
                type="email"
                className="register-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="register-field">
              <label htmlFor="reg-password" className="register-label">Mot de passe</label>
              <input
                id="reg-password"
                type="password"
                className="register-input"
                placeholder="mdp"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="register-field">
              <label htmlFor="reg-confirm" className="register-label">Confirmer le mot de passe</label>
              <input
                id="reg-confirm"
                type="password"
                className="register-input"
                placeholder="confirmer mdp"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="register-btn register-btn--submit">
              S'inscrire
            </button>
            <div className="register-actions">
              <span className="register-link-text">j'ai déjà un compte</span>
              <Link to={planId ? `/login?plan=${planId}` : '/login'} className="register-btn">CONNEXION</Link>
            </div>
          </form>
        </section>
        <div className="register-side register-side--right" aria-hidden />
      </main>

      <footer className="home-footer home-glass" />
    </div>
  )
}
