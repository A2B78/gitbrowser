import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../lib/api'

export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const githubToken = params.get('github_token')
    if (!token) { navigate('/login'); return; }

    api.setToken(token)
    if (githubToken) {
      api.setGitHubToken(githubToken)
    }
    
    api.auth.me()
      .then(({ user }) => {
        setUser(user)
        navigate('/dashboard')
      })
      .catch(() => navigate('/login'))
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#c8ff00',fontFamily:'Space Mono,monospace',fontSize:'0.8rem'}}>
        Connexion GitHub...
      </div>
    </div>
  )
}