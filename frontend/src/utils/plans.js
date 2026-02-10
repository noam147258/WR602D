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
