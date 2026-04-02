import { useAuth } from '../context/AuthContext'

const DEFAULT_COLOR = '#036C17'

function isValidColor(value) {
  if (!value || typeof value !== 'string') return false
  const v = value.trim()
  if (v.startsWith('#')) return /^#[0-9A-Fa-f]{3,8}$/.test(v)
  return v.length > 0
}

export default function Footer() {
  const { user } = useAuth()
  const color = user?.couleurPref && isValidColor(user.couleurPref)
    ? user.couleurPref
    : DEFAULT_COLOR

  const borderColor = color.startsWith('#') && color.length === 7 ? `${color}80` : color

  return (
    <footer
      className="home-footer home-glass"
      style={{
        background: color,
        borderTopColor: borderColor,
      }}
    />
  )
}
