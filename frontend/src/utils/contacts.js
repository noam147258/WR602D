/** Libellé d’affichage pour un contact renvoyé par GET /api/contacts */
export function contactDisplayName(c) {
  const full = [c.prenom, c.nom].filter(Boolean).join(' ').trim()
  return full || c.email || ''
}
