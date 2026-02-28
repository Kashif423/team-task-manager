import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch CSRF token first, then check if logged in
    api.get('/auth/csrf/')
      .then(() => api.get('/auth/me/'))
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    await api.get('/auth/csrf/')
    const res = await api.post('/auth/login/', { username, password })
    setUser(res.data.user)
    return res.data
  }

  const register = async (username, email, password) => {
    await api.get('/auth/csrf/')
    const res = await api.post('/auth/register/', { username, email, password })
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout/')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}