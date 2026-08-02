import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, tokenStore } from '../api/client'
import type { User } from '../types'

interface AuthValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (!tokenStore.get()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      setUser(await api.me())
    } catch {
      tokenStore.clear()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    tokenStore.set(response.access_token)
    setUser(await api.me())
  }

  const logout = () => {
    tokenStore.clear()
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
