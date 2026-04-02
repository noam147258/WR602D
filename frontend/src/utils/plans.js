/**
 * Libellé affiché pour un plan à partir de son id (partagé login / register / home).
 */
export function getPlanLabel(planId) {
  if (!planId || typeof planId !== 'string') return ''
  const name = planId.trim()
  if (!name) return ''
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function formatPrice(price) {
  const n = Number(price)
  const int = Math.floor(n)
  const dec = (n - int).toFixed(2).replace('.', ',')
  if (int === 0) return `0,${dec.slice(2)} €`
  const intStr = int.toLocaleString('fr-FR')
  return `${intStr},${dec.slice(2)} €`
}

export function formatLimit(limit) {
  if (limit == null) return 'Illimité'
  return `${limit} PDF${limit > 1 ? 's' : ''} / jour`
}

const COLORS = ['saile', 'mango', 'fire', 'alien']
const ICONS = ['⚡', '📄', '🚀', '⭐', '💎', '🔥', '🌟', '🏆', '👑', '💫', '✨', '🎯', '🔮', '👑']

// Basic config used on the dashboard to display the current plan
const PLAN_CONFIG = {
  free: {
    limit: 1,
    price: 0,
    description: "Option d'entrée pour tester la plateforme en douceur. 1 PDF par jour pour explorer sans pression.",
  },
  basic: {
    limit: 3,
    price: 19.99,
    description: "Le minimum syndical pour éviter l'humiliation du plan gratuit. 3 PDFs par jour pour les projets sans ambition.",
  },
  'basic+': {
    limit: 5,
    price: 49.99,
    description: "Vous essayez, et c'est mignon. 5 PDFs pour se donner l'illusion d'une croissance contrôlée.",
  },
  advanced: {
    limit: 8,
    price: 99.99,
    description: "Enfin un début de pertinence. 8 PDFs pour les freelances qui veulent arrêter de faire amateur.",
  },
  pro: {
    limit: 15,
    price: 199.99,
    description: "Vous commencez à exister. 15 PDFs et un support prioritaire pour ceux qui paient le prix d'un café par jour.",
  },
  ultra: {
    limit: 25,
    price: 349.99,
    description: "On quitte la zone de confort. 25 PDFs pour les équipes qui ont compris comment investir.",
  },
  'ultra deluxe': {
    limit: 40,
    price: 549.99,
    description: "Le plaisir de l'excès. 40 PDFs pour ceux qui aiment les badges brillants sur la facture.",
  },
  premium: {
    limit: 75,
    price: 799.99,
    description: "Un choix pragmatique pour les leaders. 75 PDFs par jour pour devenir un vrai partenaire.",
  },
  'premium pro': {
    limit: 125,
    price: 1099.99,
    description: "L'excellence opérationnelle. 125 PDFs pour les entreprises qui vivent au rythme des zéros sur le bon de commande.",
  },
  'ultra premium pro': {
    limit: 200,
    price: 1499.99,
    description: "200 PDFs. Vous écrasez la concurrence sous le poids de vos documents.",
  },
  'ultra premium pro +': {
    limit: 350,
    price: 1899.99,
    description: "Le prestige sans compromis. 350 PDFs pour les décideurs qui exigent le meilleur.",
  },
  gold: {
    limit: 500,
    price: 2149.99,
    description: "L'élite financière. 500 PDFs. Vous ne faites pas la queue, vous possédez presque la plateforme.",
  },
  platinium: {
    limit: 750,
    price: 2349.99,
    description: "Un standard à part. 750 PDFs. Le luxe de ne plus avoir à compter.",
  },
  legendary: {
    limit: 1000,
    price: 2499.99,
    description: "Le territoire des GOAT. 1000 PDFs par jour pour ceux qui ne connaissent pas la limite.",
  },
  pigeon: {
    limit: null,
    price: 49999.99,
    description: "Illimité. Vous ne payez pas pour un service, mais pour exister au sommet de la chaîne alimentaire.",
  },
}

export function getPlanConfig(planId) {
  if (!planId) return null
  return PLAN_CONFIG[planId] || null
}

export function getAllPlans() {
  const entries = Object.entries(PLAN_CONFIG)
  return entries.map(([id, cfg], index) => ({
    id,
    label: getPlanLabel(id),
    limitLabel: formatLimit(cfg.limit),
    priceLabel: formatPrice(cfg.price),
    color: COLORS[index % COLORS.length],
    icon: ICONS[index % ICONS.length],
    description: cfg.description || '',
  }))
}

