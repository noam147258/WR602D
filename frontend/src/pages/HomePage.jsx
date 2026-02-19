import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, Navigation, Pagination, Autoplay } from 'swiper/modules'
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

const COLORS = ['saile', 'mango', 'fire', 'alien']
const ICONS = ['⚡', '📄', '🚀', '⭐', '💎', '🔥', '🌟', '🏆', '👑', '💫', '✨', '🎯', '🔮', '👑']

function formatPrice(price) {
  const n = Number(price)
  const int = Math.floor(n)
  const dec = (n - int).toFixed(2).replace('.', ',')
  if (int === 0) return `0,${dec.slice(2)} €`
  const intStr = int.toLocaleString('fr-FR')
  return `${intStr},${dec.slice(2)} €`
}

function formatLimit(limit) {
  if (limit == null) return 'Illimité'
  return `${limit} PDF${limit > 1 ? 's' : ''} / jour`
}

function displayName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const PLANS = [
  { id: 'basic', name: 'basic', description: 'Le minimum syndical pour éviter l\'humiliation du plan gratuit. 3 PDFs par jour : pour les projets sans ambition et les budgets qui ont peur de l\'avenir.', limit: 3, price: 19.99 },
  { id: 'basic+', name: 'basic+', description: 'Vous essayez, et c\'est mignon. 5 PDFs pour ceux qui veulent se donner l\'illusion d\'une croissance sans jamais vraiment prendre de risques financiers.', limit: 5, price: 49.99 },
  { id: 'advanced', name: 'advanced', description: 'Enfin un début de pertinence. 8 PDFs pour les freelances qui ne veulent plus passer pour des amateurs, mais qui ne sont pas encore tout à fait des professionnels.', limit: 8, price: 99.99 },
  { id: 'pro', name: 'pro', description: 'Vous commencez à exister à nos yeux. 15 PDFs et un support prioritaire, parce qu\'on ne fait pas attendre quelqu\'un qui paie enfin le prix d\'un café par jour.', limit: 15, price: 199.99 },
  { id: 'ultra', name: 'ultra', description: 'On quitte la zone de confort. 25 PDFs pour les équipes qui ont compris que pour gagner de l\'argent, il fallait d\'abord accepter de nous en donner.', limit: 25, price: 349.99 },
  { id: 'ultra deluxe', name: 'ultra deluxe', description: 'Le plaisir de l\'excès. 40 PDFs. C\'est l\'abonnement de ceux qui aiment les badges brillants sur leur facture et les quotas qu\'ils ne rempliront jamais.', limit: 40, price: 549.99 },
  { id: 'premium', name: 'premium', description: 'Un choix pragmatique pour les leaders. 75 PDFs par jour. Vous n\'êtes plus un utilisateur, vous êtes un partenaire (tant que le virement passe).', limit: 75, price: 799.99 },
  { id: 'premium pro', name: 'premium pro', description: 'L\'excellence opérationnelle. 125 PDFs. Pour les entreprises qui ont compris que la productivité se mesure au nombre de zéros sur le bon de commande.', limit: 125, price: 1099.99 },
  { id: 'ultra premium pro', name: 'ultra premium pro', description: '200 PDFs. La modération est un concept qui ne vous concerne plus. Vous écrasez la concurrence sous le poids de vos documents.', limit: 200, price: 1499.99 },
  { id: 'ultra premium pro +', name: 'ultra premium pro +', description: 'Le prestige sans compromis. 350 PDFs. Pour les décideurs qui exigent le meilleur, parce qu\'ils savent qu\'ils le valent bien (et qu\'ils ont le budget pour le prouver).', limit: 350, price: 1899.99 },
  { id: 'gold', name: 'gold', description: 'L\'élite financière. 500 PDFs par jour. Vous ne faites pas la queue, vous ne posez pas de questions. Vous possédez la plateforme, ou presque.', limit: 500, price: 2149.99 },
  { id: 'platinium', name: 'platinium', description: 'Un standard à part. 750 PDFs. On vous répond avant même que vous n\'ayez formulé votre problème. Le luxe, c\'est de ne plus avoir à compter.', limit: 750, price: 2349.99 },
  { id: 'legendary', name: 'legendary', description: 'Le territoire des GOAT. 1000 PDFs par jour. Vous n\'utilisez pas le service, vous le dominez. Réservé à ceux qui ne connaissent aucune limite, sauf celle de leur propre génie.', limit: 1000, price: 2499.99 },
  { id: 'pigeon', name: 'pigeon', description: 'L\'Olympe de la consommation. Illimité. Pour les visionnaires qui ont transcendé la notion de valeur marchande. Vous ne payez pas pour un service, vous payez pour le privilège d\'exister au sommet de notre chaîne alimentaire.', limit: null, price: 49999.99 },
].map((p, i) => ({
  ...p,
  color: COLORS[i % COLORS.length],
  icon: ICONS[i % ICONS.length],
  priceFormatted: formatPrice(p.price),
  limitFormatted: formatLimit(p.limit),
  nameDisplay: displayName(p.name),
}))

export default function HomePage() {
  const [swiperInstance, setSwiperInstance] = useState(null)
  const [activePlanIndex, setActivePlanIndex] = useState(0)
  const [isGridView, setIsGridView] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-bg" aria-hidden>
        <div className="home-bg-layer home-bg-layer--1" />
        <div className="home-bg-layer home-bg-layer--2" />
        <div className="home-bg-layer home-bg-layer--3" />
        <div className="home-bg-layer home-bg-layer--4" />
        <div className="home-bg-noise" />
      </div>

      <header className="home-header home-glass">
        <div className="home-logo" aria-hidden>
          <img src="/toucan.png" alt="" />
        </div>
        <h1 className="home-title">
          ZOO-FILE <Sparkle className="home-sparkle home-sparkle--title" />
        </h1>
        <Link to="/dashboard" className="home-dashboard-link" aria-label="Accéder au tableau de bord (temporaire)">
          Dashboard
        </Link>
      </header>

      <main className="home-main">
        <section className="home-card home-glass home-glass--card">
          <p className="home-question">Vous avez déjà un compte ?</p>
          <Link to="/login" className="home-btn home-btn-connexion">
            CONNEXION
          </Link>
          <p className="home-question">Vous n'en avez pas ?</p>
          <p className="home-arrow-hint">Choisir un plan ci-dessous pour s'inscrire</p>
          <div className="home-arrow" aria-hidden />
        </section>

        <section className={`home-plans ${isGridView ? 'home-plans--grid' : ''}`}>
          <h2 className="home-plans-title">
            Subscription plan <Sparkle className="home-sparkle home-sparkle--sub" />
          </h2>

          {isGridView ? (
            <div className="home-plans-grid">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={`home-plan-card home-plan-card--${plan.color} ${plan.id === 'pigeon' ? 'home-plan-card--pigeon' : ''}`}
                  onClick={() => navigate(`/register?plan=${plan.id}`)}
                >
                  <span className="home-plan-icon" aria-hidden>{plan.icon}</span>
                  <span className="home-plan-name">{plan.nameDisplay}</span>
                  <span className="home-plan-price">{plan.priceFormatted}</span>
                  <span className="home-plan-limit">{plan.limitFormatted}</span>
                  <p className="home-plan-description">{plan.description}</p>
                </button>
              ))}
            </div>
          ) : (
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
                onSlideChange={(swiper) => setActivePlanIndex(swiper.realIndex)}
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
                {PLANS.map((plan) => (
                  <SwiperSlide key={plan.id}>
                    <button
                      type="button"
                      className={`home-plan-card home-plan-card--${plan.color} ${plan.id === 'pigeon' ? 'home-plan-card--pigeon' : ''}`}
                      onClick={() => navigate(`/register?plan=${plan.id}`)}
                    >
                      <span className="home-plan-icon" aria-hidden>{plan.icon}</span>
                      <span className="home-plan-name">{plan.nameDisplay}</span>
                      <span className="home-plan-price">{plan.priceFormatted}</span>
                      <span className="home-plan-limit">{plan.limitFormatted}</span>
                      <p className="home-plan-description">{plan.description}</p>
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
          )}

          <button
            type="button"
            className="home-display-toggle"
            onClick={() => setIsGridView(!isGridView)}
            aria-label={isGridView ? 'Afficher en carousel' : 'Afficher en grille'}
          >
            {isGridView ? 'Afficher en carousel' : 'Changer affichage'}
          </button>
        </section>
      </main>

      <Link to="/register?plan=free" className="home-option-gratuite-wrap" aria-label="S'inscrire avec l'option gratuite">
        <p className="home-option-gratuite">
          <span className="home-dot" aria-hidden /> option gratuite
        </p>
      </Link>

      <footer className="home-footer home-glass" />
    </div>
  )
}
