import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
    >
      {isDark ? '☾' : '☀︎'}
    </button>
  )
}

