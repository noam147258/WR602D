import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, Navigation, Pagination, Autoplay } from 'swiper/modules'
import { getAllPlans } from '../utils/plans'
import { useAuth } from '../context/AuthContext'
import Grainient from '../components/Grainient'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'
import 'swiper/css'
import 'swiper/css/effect-cards'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const Sparkle = ({ className = '' }) => (
  <span className={className} aria-hidden>
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  </span>
)

const ALL_PLANS = getAllPlans()
const PAID_PLANS = ALL_PLANS.filter((p) => p.id !== 'free')

export default function PlansPage() {
  const { user, changePlan } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPlanId = user?.planId || 'free'
  const [swiperInstance, setSwiperInstance] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId)
  const { theme } = useTheme()
  const [error, setError] = useState('')
  const userColor = user?.couleurPref || '#036C17'

  useEffect(() => {
    const paymentError = searchParams.get('payment_error')
    if (paymentError) {
      setError(decodeURIComponent(paymentError))
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  async function handleChoose(planId) {
    if (!planId) return
    setError('')
    setSelectedPlanId(planId)
  }

  async function handleConfirm() {
    setError('')
    if (!selectedPlanId) return
    // Plan gratuit : mise à jour directe via l’API
    if (selectedPlanId === 'free') {
      const result = await changePlan(selectedPlanId)
      if (result.ok) {
        navigate('/dashboard')
      } else if (result.error) {
        setError(result.error)
      }
      return
    }
    // Plan payant : redirection vers le checkout Stripe (backend crée la session et redirige)
    window.location.href = `/payment/checkout/${selectedPlanId}`
  }

  return (
    <div className="home-page plans-page">
      <div className="home-bg" aria-hidden>
        <Grainient
          className="home-bg-canvas"
          color1={theme === 'dark' ? '#031f3a' : '#bbf7d0'}
          color2={userColor}
          color3={theme === 'dark' ? '#9f1239' : '#fecaca'}
        />
        <div className="home-bg-noise" />
      </div>

      <header className="home-header home-glass">
        <Link to="/dashboard" className="back-home" aria-label="Retour au tableau de bord">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1 className="home-title">
          Changer d’abonnement <Sparkle className="home-sparkle home-sparkle--title" />
        </h1>
      </header>

      <main className="home-main">
        <section className="home-plans">
          <h2 className="home-plans-title">
            Tous les plans disponibles <Sparkle className="home-sparkle home-sparkle--sub" />
          </h2>

          <div className="home-carousel-wrap">
            <button
              type="button"
              className="home-carousel-btn home-carousel-btn--prev"
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Plan précédent"
            >
              <span aria-hidden>‹</span>
            </button>

            <Swiper
              onSwiper={setSwiperInstance}
              onSlideChange={(sw) => {
                const idx = typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex
                const plan = PAID_PLANS[idx]
                if (plan) setSelectedPlanId(plan.id)
              }}
              effect="cards"
              grabCursor
              modules={[EffectCards, Navigation, Pagination, Autoplay]}
              className="home-swiper"
              cardsEffect={{ perSlideOffset: 12, perSlideRotate: 2, slideShadows: true }}
              pagination={{ clickable: true, el: '.home-carousel-pagination' }}
              autoplay={{ delay: 8000, disableOnInteraction: false }}
              loop
              speed={600}
            >
              {PAID_PLANS.map((plan) => (
                <SwiperSlide key={plan.id}>
                  <button
                    type="button"
                    className={`home-plan-card home-plan-card--${plan.color} ${plan.id === 'pigeon' ? 'home-plan-card--pigeon' : ''} ${plan.id === currentPlanId ? 'home-plan-card--selected' : ''} ${plan.id === selectedPlanId && plan.id !== currentPlanId ? 'home-plan-card--pending' : ''}`}
                    onClick={() => handleChoose(plan.id)}
                  >
                    <span className="home-plan-icon" aria-hidden>{plan.icon}</span>
                    <span className="home-plan-name">{plan.label}</span>
                    <span className="home-plan-price">{plan.priceLabel}</span>
                    <span className="home-plan-limit">{plan.limitLabel}</span>
                    {plan.description && (
                      <p className="home-plan-description">{plan.description}</p>
                    )}
                    {plan.id === currentPlanId && (
                      <span className="home-plan-current">Plan actuel</span>
                    )}
                    {plan.id === selectedPlanId && plan.id !== currentPlanId && (
                      <span className="home-plan-selected">Plan sélectionné</span>
                    )}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              type="button"
              className="home-carousel-btn home-carousel-btn--next"
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Plan suivant"
            >
              <span aria-hidden>›</span>
            </button>

            <div className="home-carousel-pagination" />
          </div>

          <div className="home-plans-cta">
            <button
              type="button"
              className="home-btn home-btn-connexion"
              onClick={handleConfirm}
              disabled={!selectedPlanId}
            >
              Confirmer ce plan
            </button>
            {error && <p className="error" style={{ marginTop: '0.75rem' }}>{error}</p>}
          </div>
        </section>
      </main>

      <Link
        to="/dashboard"
        className="home-option-gratuite-wrap"
        aria-label="Passer au plan gratuit"
        onClick={(e) => {
          e.preventDefault()
          handleChoose('free')
          handleConfirm()
        }}
      >
        <p className="home-option-gratuite">
          <span className="home-dot" aria-hidden /> option gratuite
        </p>
      </Link>

      <Footer />
    </div>
  )
}


