import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import api from './lib/api'

// Pages
import LoginPage from './pages/Login'
import AuthCallbackPage from './pages/AuthCallback'
import DashboardPage from './pages/Dashboard'
import RepoDetailPage from './pages/RepoDetail'
import RepoAnalysisPage from './pages/RepoAnalysis'

// Auth Context
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    if (token) {
      api.auth.me()
        .then(({ user }) => {
          setUser(user)
          // Stocker le token GitHub si disponible
          if (user.githubToken) {
            api.setGitHubToken(user.githubToken)
          }
        })
        .catch(() => api.clearToken())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const logout = () => {
    api.clearToken()
    api.clearGitHubToken()
    setUser(null)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0a', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ color: '#c8ff00', fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
          Chargement...
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/error" element={<div style={{color:'white',padding:'2rem'}}>Erreur d'authentification GitHub</div>} />

          {/* Private */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/repos/:owner/:repo" element={<PrivateRoute><RepoDetailPage /></PrivateRoute>} />
          <Route path="/repos/:owner/:repo/analyze" element={<PrivateRoute><RepoAnalysisPage /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}