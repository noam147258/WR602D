import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API_BASE = '/api/auth'

const defaultFetchOpts = { credentials: 'include' }

/** fetch with timeout so we don't hang if backend is down */
function fetchWithTimeout(url, opts = {}, ms = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id))
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/me`, { ...defaultFetchOpts, method: 'GET' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok && data?.user) {
        setUser(data.user)
        return data.user
      }
    } catch {
      // Backend down or network error: stay unauthenticated
    }
    setUser(null)
    return null
  }, [])

  useEffect(() => {
    fetchMe().finally(() => setLoading(false))
  }, [fetchMe])

  async function login(identifier, password) {
    const res = await fetch(`${API_BASE}/login`, {
      ...defaultFetchOpts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data?.ok && data?.user) {
      setUser(data.user)
      return { ok: true }
    }
    return { ok: false, error: data?.error ?? 'Connexion impossible' }
  }

  function logout() {
    setUser(null)
    fetch(`${API_BASE}/logout`, { ...defaultFetchOpts, method: 'POST' }).catch(() => {})
  }

  async function register(userData) {
    const body = {
      email: String(userData.email ?? '').trim(),
      password: userData.password,
      nom: userData.nom,
      prenom: userData.prenom,
      dateNaissance: userData.dateNaissance || null,
      photo: userData.photo || null,
      couleurPref: userData.couleurPref || null,
      telephone: userData.telephone || null,
      planId: userData.planId || 'free',
    }
    try {
      // Inscription : payload parfois lourd (photo) — timeout plus long que /me
      const res = await fetchWithTimeout(
        `${API_BASE}/register`,
        {
          ...defaultFetchOpts,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        60000
      )
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok && data?.user) {
        setUser(data.user)
        return { ok: true }
      }
      if (res.status === 413) {
        return { ok: false, error: 'Données trop volumineuses (réduisez la taille de la photo).' }
      }
      if (res.status >= 500) {
        return {
          ok: false,
          error: data?.error ?? 'Erreur serveur. Consultez les logs Symfony ou réessayez plus tard.',
        }
      }
      return { ok: false, error: data?.error ?? `Inscription impossible (${res.status})` }
    } catch (e) {
      if (e?.name === 'AbortError') {
        return { ok: false, error: 'Délai dépassé : le serveur ne répond pas ou la connexion est trop lente.' }
      }
      return { ok: false, error: 'Impossible de contacter le serveur (réseau ou proxy).' }
    }
  }

  async function changePlan(planId) {
    const res = await fetch(`${API_BASE}/plan`, {
      ...defaultFetchOpts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data?.ok && data?.user) {
      setUser(data.user)
      return { ok: true }
    }
    return { ok: false, error: data?.error ?? 'Impossible de changer de plan' }
  }

  async function updateProfile(profileData) {
    const body = {
      nom: profileData.nom ?? '',
      prenom: profileData.prenom ?? '',
      email: profileData.email ?? '',
      dateNaissance: profileData.dateNaissance || null,
      couleurPref: profileData.couleurPref || null,
      telephone: profileData.telephone || null,
      photo: profileData.photo || null,
    }
    if (profileData.password && profileData.password.length >= 4) {
      body.password = profileData.password
    }
    const res = await fetch(`${API_BASE}/profile`, {
      ...defaultFetchOpts,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data?.ok && data?.user) {
      setUser(data.user)
      return { ok: true }
    }
    return { ok: false, error: data?.error ?? 'Impossible de modifier les informations' }
  }

  async function deleteAccount() {
    const res = await fetch(`${API_BASE}/account`, {
      ...defaultFetchOpts,
      method: 'DELETE',
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data?.ok) {
      setUser(null)
      fetch(`${API_BASE}/logout`, { ...defaultFetchOpts, method: 'POST' }).catch(() => {})
      return { ok: true }
    }
    return { ok: false, error: data?.error ?? 'Impossible de supprimer le compte' }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        changePlan,
        updateProfile,
        deleteAccount,
        refreshUser: fetchMe,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
