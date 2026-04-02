import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPlanLabel, formatPrice, formatLimit, getPlanConfig } from '../utils/plans'
import { contactDisplayName } from '../utils/contacts'
import { useAuth } from '../context/AuthContext'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'

const Sparkle = ({ className = '' }) => (
  <span className={className} aria-hidden>
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  </span>
)

const DEFAULT_PLAN_ICON = '⭐'

function formatDateDisplay(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function capitalizeWords(value) {
  if (!value || typeof value !== 'string') return ''
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase('fr-FR') + w.slice(1).toLocaleLowerCase('fr-FR'))
    .join(' ')
}

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { theme } = useTheme()
  const displayUser = user || { nom: '', prenom: '', dateNaissance: '', couleurPref: '#036C17', email: '' }
  const userColor = displayUser.couleurPref || '#036C17'
  const userName = `${capitalizeWords(displayUser.prenom || '')} ${capitalizeWords(displayUser.nom || '')}`.trim() || 'Utilisateur'
  const [conversionsPercent, setConversionsPercent] = useState(0)
  const [conversionsCount, setConversionsCount] = useState(0)
  const [conversionsLimit, setConversionsLimit] = useState(null)
  const [recentGenerations, setRecentGenerations] = useState([])
  const [recentContacts, setRecentContacts] = useState([])
  const currentPlanId = user?.planId || 'free'
  const isPigeonPlan = currentPlanId === 'pigeon'
  const planConfig = getPlanConfig(currentPlanId)
  const planLabel = getPlanLabel(currentPlanId) || 'Aucun plan'
  const planPrice = planConfig ? formatPrice(planConfig.price) : '—'
  const planLimit = planConfig ? formatLimit(planConfig.limit) : '—'

  useEffect(() => {
    if (searchParams.get('payment') !== 'success') return
    let cancelled = false
    refreshUser().then(() => {
      if (!cancelled) setSearchParams({}, { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [searchParams, refreshUser, setSearchParams])

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const res = await fetch('/api/pdf/stats-today', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.ok) return
        if (cancelled) return
        setConversionsPercent(typeof data.percent === 'number' ? data.percent : 0)
        setConversionsCount(typeof data.countToday === 'number' ? data.countToday : 0)
        setConversionsLimit(data.limit ?? null)
      } catch {
        // ignore errors, keep defaults
      }
    }
    if (user) {
      fetchStats()
    }
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    async function fetchRecentGenerations() {
      try {
        const res = await fetch('/api/pdf/generations', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.ok || !Array.isArray(data.generations)) return
        if (cancelled) return
        setRecentGenerations(data.generations.slice(0, 3))
      } catch {
        // ignore
      }
    }
    if (user) {
      fetchRecentGenerations()
    }
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    async function fetchRecentContacts() {
      try {
        const res = await fetch('/api/contacts', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.ok || !Array.isArray(data.contacts)) return
        if (cancelled) return
        setRecentContacts(data.contacts.slice(0, 3))
      } catch {
        // ignore
      }
    }
    if (user) {
      fetchRecentContacts()
    }
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="dashboard-page">
      <div className="home-bg" aria-hidden>
        <Grainient
          className="home-bg-canvas"
          color1={theme === 'dark' ? '#065f46' : '#bbf7d0'} // vert un peu plus présent
          color2={userColor}
          color3={theme === 'dark' ? '#9f1239' : '#fecaca'} // rose un peu plus présent
        />
        <div className="home-bg-noise" />
      </div>

      <header className="dashboard-header">
        <div className="dashboard-title-bar home-glass">
          <Link to="/" className="back-home" aria-label="Retour à l'accueil">
            <span className="back-home-arrow" aria-hidden>←</span>
          </Link>
          <h1 className="dashboard-site-title">
            ZOO-FILE <Sparkle className="dashboard-site-title-sparkle" />
          </h1>
        </div>
        <div className="dashboard-header-inner">
          <nav className="dashboard-nav">
            <Link to="/conversion" className="dashboard-nav-btn dashboard-nav-btn--primary">
              Conversion
            </Link>
            <Link to="/contacts" className="dashboard-nav-btn dashboard-nav-btn--primary">
              Contacts
            </Link>
            <Link to="/historique" className="dashboard-nav-btn dashboard-nav-btn--secondary">
              Historique
            </Link>
          </nav>
          <button
            type="button"
            className="dashboard-nav-btn dashboard-nav-btn--secondary"
            onClick={logout}
            style={{ marginLeft: 'auto' }}
          >
            Déconnexion
          </button>
          <div className="dashboard-user">
            <p className="dashboard-name">{userName}</p>
            <div className="dashboard-avatar" aria-hidden />
          </div>
          <div className="dashboard-conversions">
            <div className={`dashboard-conversions-bar-wrap ${isPigeonPlan ? 'dashboard-conversions-bar-wrap--pigeon' : ''}`}>
              <div
                className={`dashboard-conversions-bar-fill ${isPigeonPlan ? 'dashboard-conversions-bar-fill--pigeon' : ''}`}
                style={{ width: isPigeonPlan ? '400%' : `${conversionsPercent}%` }}
                role="progressbar"
                aria-valuenow={isPigeonPlan ? 100 : conversionsPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Conversions"
              />
            </div>
            <span className="dashboard-conversions-label">
              {isPigeonPlan
                ? 'Illimité'
                : conversionsLimit == null
                  ? `${conversionsCount} conversions`
                  : `${conversionsCount}/${conversionsLimit} conversions`}
            </span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-block home-glass home-glass--card">
          <h2 className="dashboard-block-title">Votre abonnement</h2>
          <div className="dashboard-block-content dashboard-block-content--plan">
            <div className="dashboard-plan-card dashboard-plan-card--mango">
              <span className="dashboard-plan-icon" aria-hidden>{DEFAULT_PLAN_ICON}</span>
              <span className="dashboard-plan-name">{planLabel}</span>
              <span className="dashboard-plan-price">{planPrice}</span>
              <span className="dashboard-plan-limit">{planLimit}</span>
            </div>
            <div className="dashboard-plan-change">
              <Link to="/plans" className="dashboard-nav-btn dashboard-nav-btn--secondary">
                Changer de plan
              </Link>
            </div>
          </div>
        </section>

        <section className="dashboard-block home-glass home-glass--card">
          <h2 className="dashboard-block-title">Vos informations</h2>
          <div className="dashboard-block-content dashboard-block-content--info">
            <div className="dashboard-info-actions">
              <Link to="/compte" className="dashboard-nav-btn dashboard-nav-btn--secondary">
                Modifier mes infos
              </Link>
            </div>
            <dl className="dashboard-info-list">
              <div className="dashboard-info-row">
                <dt>Nom</dt>
                <dd>{displayUser.nom || '—'}</dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Prénom</dt>
                <dd>{displayUser.prenom || '—'}</dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Date de naissance</dt>
                <dd>{formatDateDisplay(displayUser.dateNaissance)}</dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Couleur préférée</dt>
                <dd className="dashboard-info-color">
                  <span className="dashboard-info-color-swatch" style={{ background: displayUser.couleurPref }} aria-hidden />
                  {displayUser.couleurPref || '—'}
                </dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Email</dt>
                <dd>{displayUser.email || '—'}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="dashboard-block home-glass home-glass--card">
          <h2 className="dashboard-block-title">Contacts récents</h2>
          <div className="dashboard-block-content dashboard-block-content--list">
            <ul className="dashboard-list">
              {recentContacts.length === 0 && (
                <li className="dashboard-list-item">
                  <span className="dashboard-list-item-libelle">Aucun contact pour le moment.</span>
                </li>
              )}
              {recentContacts.map((c) => (
                <li key={c.id} className="dashboard-list-item">
                  <span className="dashboard-list-item-name">{contactDisplayName(c)}</span>
                  <span className="dashboard-list-item-email">{c.email}</span>
                </li>
              ))}
            </ul>
            <Link to="/contacts" className="dashboard-block-link">
              Voir tous les contacts →
            </Link>
          </div>
        </section>

        <section className="dashboard-block home-glass home-glass--card">
          <h2 className="dashboard-block-title">Conversions récentes</h2>
          <div className="dashboard-block-content dashboard-block-content--list">
            <ul className="dashboard-list">
              {recentGenerations.length === 0 && (
                <li className="dashboard-list-item">
                  <span className="dashboard-list-item-libelle">Aucune conversion récente.</span>
                </li>
              )}
              {recentGenerations.map((g) => (
                <li key={g.id} className="dashboard-list-item">
                  <span className="dashboard-list-item-date">{formatDateDisplay(g.createdAt)}</span>
                  <span className="dashboard-list-item-libelle">PDF généré depuis une URL</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
