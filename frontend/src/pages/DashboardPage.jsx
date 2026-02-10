import { Link } from 'react-router-dom'
import { getPlanLabel, formatPrice, formatLimit } from '../utils/plans'

const Sparkle = ({ className = '' }) => (
  <span className={className} aria-hidden>
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  </span>
)

// Données factices (à remplacer par contexte / API plus tard)
const MOCK_PLAN = {
  id: 'premium',
  name: 'premium',
  limit: 75,
  price: 799.99,
  icon: '⭐',
}
const MOCK_USER = {
  nom: 'Dupont',
  prenom: 'Jean',
  dateNaissance: '1990-05-15',
  couleurPref: '#036C17',
  email: 'jean.dupont@exemple.fr',
}
const MOCK_CONTACTS = [
  { id: 1, nom: 'Marie Martin', email: 'marie.martin@exemple.fr' },
  { id: 2, nom: 'Paul Bernard', email: 'paul.bernard@exemple.fr' },
  { id: 3, nom: 'Sophie Petit', email: 'sophie.petit@exemple.fr' },
]
const MOCK_CONVERSIONS = [
  { id: 1, date: '08/02/2025', libelle: 'PDF généré depuis une URL' },
  { id: 2, date: '07/02/2025', libelle: 'PDF généré depuis une URL' },
  { id: 3, date: '06/02/2025', libelle: 'PDF généré depuis une URL' },
]

function formatDateDisplay(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function DashboardPage() {
  const userName = `${MOCK_USER.prenom} ${MOCK_USER.nom}`
  const conversionsPercent = 65
  const planLabel = getPlanLabel(MOCK_PLAN.name)
  const planPrice = formatPrice(MOCK_PLAN.price)
  const planLimit = formatLimit(MOCK_PLAN.limit)

  return (
    <div className="dashboard-page">
      <div className="home-bg" aria-hidden>
        <div className="home-bg-layer home-bg-layer--1" />
        <div className="home-bg-layer home-bg-layer--2" />
        <div className="home-bg-layer home-bg-layer--3" />
        <div className="home-bg-layer home-bg-layer--4" />
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
          <div className="dashboard-avatar" aria-hidden />
          <div className="dashboard-conversions">
            <div className="dashboard-conversions-bar-wrap">
              <div
                className="dashboard-conversions-bar-fill"
                style={{ width: `${conversionsPercent}%` }}
                role="progressbar"
                aria-valuenow={conversionsPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Conversions"
              />
            </div>
            <span className="dashboard-conversions-label">conversions</span>
          </div>
        </div>
        <p className="dashboard-name">{userName}</p>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-block home-glass home-glass--card">
          <h2 className="dashboard-block-title">Votre abonnement</h2>
          <div className="dashboard-block-content dashboard-block-content--plan">
            <div className="dashboard-plan-card dashboard-plan-card--mango">
              <span className="dashboard-plan-icon" aria-hidden>{MOCK_PLAN.icon}</span>
              <span className="dashboard-plan-name">{planLabel}</span>
              <span className="dashboard-plan-price">{planPrice}</span>
              <span className="dashboard-plan-limit">{planLimit}</span>
            </div>
          </div>
        </section>

        <section className="dashboard-block home-glass home-glass--card">
          <h2 className="dashboard-block-title">Vos informations</h2>
          <div className="dashboard-block-content dashboard-block-content--info">
            <dl className="dashboard-info-list">
              <div className="dashboard-info-row">
                <dt>Nom</dt>
                <dd>{MOCK_USER.nom}</dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Prénom</dt>
                <dd>{MOCK_USER.prenom}</dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Date de naissance</dt>
                <dd>{formatDateDisplay(MOCK_USER.dateNaissance)}</dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Couleur préférée</dt>
                <dd className="dashboard-info-color">
                  <span className="dashboard-info-color-swatch" style={{ background: MOCK_USER.couleurPref }} aria-hidden />
                  {MOCK_USER.couleurPref}
                </dd>
              </div>
              <div className="dashboard-info-row">
                <dt>Email</dt>
                <dd>{MOCK_USER.email}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="dashboard-block home-glass home-glass--card">
          <h2 className="dashboard-block-title">Contacts récents</h2>
          <div className="dashboard-block-content dashboard-block-content--list">
            <ul className="dashboard-list">
              {MOCK_CONTACTS.map((c) => (
                <li key={c.id} className="dashboard-list-item">
                  <span className="dashboard-list-item-name">{c.nom}</span>
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
              {MOCK_CONVERSIONS.map((conv) => (
                <li key={conv.id} className="dashboard-list-item">
                  <span className="dashboard-list-item-date">{conv.date}</span>
                  <span className="dashboard-list-item-libelle">{conv.libelle}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="home-footer home-glass" />
    </div>
  )
}
