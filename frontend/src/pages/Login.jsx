import { Github, GitBranch } from 'lucide-react'
import api from '../lib/api'

export default function LoginPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <GitBranch size={24} color="#c8ff00" />
          <span style={styles.logoText}>GitBrowser</span>
        </div>

        <h1 style={styles.title}>Connexion</h1>
        <p style={styles.sub}>Accède à tes repos GitHub</p>

        <a href={api.auth.githubUrl()} style={styles.githubBtn}>
          <Github size={16} />
          Continuer avec GitHub
        </a>

        <p style={styles.footer}>
          En te connectant, tu autorises GitBrowser à accéder à tes repos GitHub.
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', background: '#0a0a0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    background: '#111', border: '1px solid #222',
    borderRadius: '8px', padding: '2.5rem',
    width: '100%', maxWidth: '400px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    marginBottom: '2rem',
  },
  logoText: {
    fontFamily: 'Space Mono, monospace', fontSize: '1.2rem',
    fontWeight: 700, color: '#e8e6e0',
  },
  title: { fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.25rem' },
  sub: { fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', color: '#555', marginBottom: '1.75rem' },
  githubBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    background: '#1a1a1a', border: '1px solid #333',
    color: '#e8e6e0', textDecoration: 'none',
    fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', fontWeight: 700,
    padding: '0.7rem', borderRadius: '4px', width: '100%',
    marginBottom: '1.25rem', transition: 'border-color 0.15s',
    cursor: 'pointer',
  },
  footer: { fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#555', textAlign: 'center' },
}