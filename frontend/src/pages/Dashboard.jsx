import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GitBranch, Lock, Unlock, Star, GitFork, LogOut, Search } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../App'

const STACK_EMOJI = {
  JavaScript: '🟨',
  TypeScript: '🔷',
  Python: '🐍',
  Go: '🐹',
  PHP: '🐘',
  Rust: '🦀',
  Java: '☕',
  Ruby: '💎',
  'C++': '⚙️',
  C: '⚙️',
  Shell: '🐚',
  HTML: '📄',
  CSS: '🎨',
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [repos, setRepos] = useState([])
  const [filteredRepos, setFilteredRepos] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadRepos()
  }, [page])

  useEffect(() => {
    const q = search.toLowerCase()
    setFilteredRepos(repos.filter(r =>
      r.fullName.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    ))
  }, [search, repos])

  const loadRepos = async () => {
    setLoading(true)
    try {
      const { repos: data } = await api.repos.list(page, 50)
      setRepos(data)
      setFilteredRepos(data)
    } catch (err) {
      console.error('Erreur chargement repos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <GitBranch size={20} color="#c8ff00" />
          <span style={styles.logo}>GitBrowser</span>
        </div>
        <div style={styles.headerRight}>
          {user?.avatarUrl && (
            <img src={user.avatarUrl} alt="" style={styles.avatar} />
          )}
          <span style={styles.userName}>{user?.name || user?.login}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Tes repos GitHub</h1>
          <span style={styles.count}>{repos.length} repos</span>
        </div>

        {/* Search */}
        <div style={styles.searchBox}>
          <Search size={14} style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Rechercher un repo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Repo list */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            Chargement des repos...
          </div>
        ) : filteredRepos.length > 0 ? (
          <div style={styles.repoList}>
            {filteredRepos.map(repo => (
              <Link
                key={repo.id}
                to={`/repos/${repo.owner}/${repo.name}`}
                style={styles.repoCard}
              >
                <div style={styles.repoHeader}>
                  <span style={styles.repoEmoji}>
                    {STACK_EMOJI[repo.language] || '📁'}
                  </span>
                  <div style={styles.repoInfo}>
                    <div style={styles.repoName}>{repo.fullName}</div>
                    <div style={styles.repoDesc}>
                      {repo.description || 'Pas de description'}
                    </div>
                  </div>
                  <div style={styles.repoMeta}>
                    {repo.private ? (
                      <Lock size={12} color="#555" />
                    ) : (
                      <Unlock size={12} color="#555" />
                    )}
                    {repo.language && (
                      <span style={styles.language}>{repo.language}</span>
                    )}
                  </div>
                </div>
                <div style={styles.repoStats}>
                  <span style={styles.stat}>
                    <Star size={10} /> {repo.stars || 0}
                  </span>
                  <span style={styles.stat}>
                    <GitFork size={10} /> {repo.forks || 0}
                  </span>
                  <span style={styles.stat}>
                    <GitBranch size={10} /> {repo.defaultBranch}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={styles.empty}>
            <GitBranch size={40} color="#333" />
            <h3 style={styles.emptyTitle}>Aucun repo trouvé</h3>
            <p style={styles.emptyText}>
              {search ? 'Essayez un autre terme de recherche' : 'Connectez vos repos GitHub pour commencer'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {repos.length >= 50 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.pageBtn}
            >
              ← Précédent
            </button>
            <span style={styles.pageInfo}>Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              style={styles.pageBtn}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#e8e6e0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid #222',
    background: '#111',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logo: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#e8e6e0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
  },
  userName: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    color: '#888',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#555',
    padding: '0.4rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  content: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '2rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
  },
  count: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    color: '#555',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#555',
  },
  searchInput: {
    background: '#1a1a1a',
    border: '1px solid #222',
    color: '#e8e6e0',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.8rem',
    padding: '0.6rem 0.875rem 0.6rem 2.25rem',
    borderRadius: '4px',
    width: '100%',
    outline: 'none',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '3rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.8rem',
    color: '#555',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid #222',
    borderTopColor: '#c8ff00',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  repoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  repoCard: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '6px',
    padding: '1rem 1.25rem',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.15s',
    display: 'block',
  },
  repoHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  repoEmoji: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  repoInfo: {
    flex: 1,
    minWidth: 0,
  },
  repoName: {
    fontWeight: 700,
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
  },
  repoDesc: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
    color: '#555',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  repoMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  language: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.65rem',
    color: '#888',
    background: '#1a1a1a',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  repoStats: {
    display: 'flex',
    gap: '1rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.65rem',
    color: '#555',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyTitle: {
    fontSize: '1rem',
    color: '#e8e6e0',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    color: '#555',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
  },
  pageBtn: {
    background: '#1a1a1a',
    border: '1px solid #333',
    color: '#e8e6e0',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    color: '#555',
  },
}