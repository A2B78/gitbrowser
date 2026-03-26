import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { GitBranch, File, Folder, ChevronRight, Star, GitFork, Lock, Unlock, ArrowLeft, Brain } from 'lucide-react'
import api from '../lib/api'

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

export default function RepoDetailPage() {
  const { owner, repo } = useParams()
  const [repoData, setRepoData] = useState(null)
  const [contents, setContents] = useState([])
  const [branches, setBranches] = useState([])
  const [commits, setCommits] = useState([])
  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('files')

  useEffect(() => {
    loadData()
  }, [owner, repo])

  useEffect(() => {
    if (currentPath !== undefined) {
      loadContents()
    }
  }, [currentPath])

  const loadData = async () => {
    setLoading(true)
    try {
      const [repoRes, branchesRes, commitsRes] = await Promise.all([
        api.repos.get(owner, repo),
        api.repos.branches(owner, repo),
        api.repos.commits(owner, repo),
      ])
      setRepoData(repoRes.repo)
      setBranches(branchesRes.branches)
      setCommits(commitsRes.commits)
      await loadContents()
    } catch (err) {
      console.error('Erreur chargement repo:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadContents = async () => {
    try {
      const { contents: data } = await api.repos.contents(owner, repo, currentPath)
      setContents(data)
    } catch (err) {
      console.error('Erreur chargement contents:', err)
    }
  }

  const openFolder = (path) => {
    setCurrentPath(path)
    setSelectedFile(null)
  }

  const openFile = async (path) => {
    try {
      const { file } = await api.repos.file(owner, repo, path)
      setSelectedFile(file)
    } catch (err) {
      console.error('Erreur chargement fichier:', err)
    }
  }

  const goBack = () => {
    if (currentPath) {
      const parts = currentPath.split('/')
      parts.pop()
      setCurrentPath(parts.join('/'))
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        Chargement...
      </div>
    )
  }

  if (!repoData) {
    return (
      <div style={styles.error}>
        <h2>Repo introuvable</h2>
        <Link to="/dashboard" style={styles.backLink}>← Retour au dashboard</Link>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/dashboard" style={styles.backBtn}>
            <ArrowLeft size={16} />
          </Link>
          <GitBranch size={20} color="#c8ff00" />
          <span style={styles.repoName}>{repoData.fullName}</span>
        </div>
        <div style={styles.headerRight}>
          <Link to={`/repos/${owner}/${repo}/analyze`} style={styles.analyzeBtn}>
            <Brain size={14} />
            Analyser
          </Link>
          {repoData.private ? <Lock size={14} color="#555" /> : <Unlock size={14} color="#555" />}
          <span style={styles.stat}>
            <Star size={12} /> {repoData.stars || 0}
          </span>
          <span style={styles.stat}>
            <GitFork size={12} /> {repoData.forks || 0}
          </span>
        </div>
      </header>

      {/* Repo info */}
      <div style={styles.repoInfo}>
        <div style={styles.repoHeader}>
          <span style={styles.repoEmoji}>
            {STACK_EMOJI[repoData.language] || '📁'}
          </span>
          <div>
            <h1 style={styles.repoTitle}>{repoData.name}</h1>
            <p style={styles.repoDesc}>{repoData.description || 'Pas de description'}</p>
          </div>
        </div>
        <div style={styles.repoMeta}>
          {repoData.language && (
            <span style={styles.language}>{repoData.language}</span>
          )}
          <span style={styles.branch}>
            <GitBranch size={10} /> {repoData.defaultBranch}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('files')}
          style={{
            ...styles.tab,
            ...(activeTab === 'files' ? styles.tabActive : {}),
          }}
        >
          Fichiers
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          style={{
            ...styles.tab,
            ...(activeTab === 'branches' ? styles.tabActive : {}),
          }}
        >
          Branches ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab('commits')}
          style={{
            ...styles.tab,
            ...(activeTab === 'commits' ? styles.tabActive : {}),
          }}
        >
          Commits ({commits.length})
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'files' && (
          <div style={styles.filesContainer}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
              <button onClick={() => openFolder('')} style={styles.breadcrumbItem}>
                {repoData.name}
              </button>
              {currentPath && currentPath.split('/').map((part, i, arr) => (
                <span key={i}>
                  <ChevronRight size={12} color="#555" />
                  <button
                    onClick={() => openFolder(arr.slice(0, i + 1).join('/'))}
                    style={styles.breadcrumbItem}
                  >
                    {part}
                  </button>
                </span>
              ))}
            </div>

            {/* File list */}
            <div style={styles.fileList}>
              {currentPath && (
                <button onClick={goBack} style={styles.fileItem}>
                  <Folder size={14} color="#555" />
                  <span style={styles.fileName}>..</span>
                </button>
              )}
              {contents.map(item => (
                <button
                  key={item.path}
                  onClick={() => item.type === 'dir' ? openFolder(item.path) : openFile(item.path)}
                  style={styles.fileItem}
                >
                  {item.type === 'dir' ? (
                    <Folder size={14} color="#c8ff00" />
                  ) : (
                    <File size={14} color="#555" />
                  )}
                  <span style={styles.fileName}>{item.name}</span>
                  {item.type === 'file' && item.size && (
                    <span style={styles.fileSize}>{formatSize(item.size)}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Selected file */}
            {selectedFile && (
              <div style={styles.fileViewer}>
                <div style={styles.fileHeader}>
                  <File size={14} color="#c8ff00" />
                  <span style={styles.filePath}>{selectedFile.path}</span>
                </div>
                <pre style={styles.fileContent}>
                  {selectedFile.content}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'branches' && (
          <div style={styles.branchList}>
            {branches.map(branch => (
              <div key={branch.name} style={styles.branchItem}>
                <GitBranch size={14} color="#c8ff00" />
                <span style={styles.branchName}>{branch.name}</span>
                <code style={styles.branchCommit}>{branch.commit}</code>
                {branch.protected && (
                  <span style={styles.protected}>Protégée</span>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'commits' && (
          <div style={styles.commitList}>
            {commits.map(commit => (
              <a
                key={commit.fullSha}
                href={commit.url}
                target="_blank"
                rel="noreferrer"
                style={styles.commitItem}
              >
                <code style={styles.commitSha}>{commit.sha}</code>
                <div style={styles.commitInfo}>
                  <div style={styles.commitMessage}>{commit.message}</div>
                  <div style={styles.commitMeta}>
                    <span>{commit.author}</span>
                    <span>{new Date(commit.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#e8e6e0',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '100vh',
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
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  backLink: {
    color: '#c8ff00',
    textDecoration: 'none',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.8rem',
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
    gap: '0.75rem',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#555',
    padding: '0.4rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  repoName: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
    color: '#555',
  },
  analyzeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: '#c8ff00',
    color: '#0a0a0a',
    border: 'none',
    padding: '0.4rem 0.75rem',
    borderRadius: '4px',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform 0.15s',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  repoInfo: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #222',
  },
  repoHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
  },
  repoEmoji: {
    fontSize: '2rem',
  },
  repoTitle: {
    fontSize: '1.5rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    marginBottom: '0.25rem',
  },
  repoDesc: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    color: '#555',
  },
  repoMeta: {
    display: 'flex',
    gap: '1rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
  },
  language: {
    background: '#1a1a1a',
    padding: '2px 8px',
    borderRadius: '3px',
    color: '#888',
  },
  branch: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    color: '#555',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #222',
    background: '#111',
  },
  tab: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    color: '#555',
    padding: '0.75rem 1.5rem',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#c8ff00',
    borderBottomColor: '#c8ff00',
  },
  content: {
    padding: '1.5rem 2rem',
  },
  filesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
  },
  breadcrumbItem: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#c8ff00',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '2px 4px',
  },
  fileList: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 1rem',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #1a1a1a',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    color: 'inherit',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    transition: 'background 0.15s',
  },
  fileName: {
    flex: 1,
  },
  fileSize: {
    color: '#555',
    fontSize: '0.65rem',
  },
  fileViewer: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  fileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #222',
    background: 'rgba(200,255,0,0.05)',
  },
  filePath: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.72rem',
    color: '#c8ff00',
  },
  fileContent: {
    padding: '1rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
    color: '#9a9a9a',
    overflow: 'auto',
    maxHeight: 400,
    lineHeight: 1.7,
    margin: 0,
  },
  branchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  branchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: '#111',
    border: '1px solid #222',
    borderRadius: '6px',
  },
  branchName: {
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  branchCommit: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.65rem',
    color: '#555',
    background: '#1a1a1a',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  protected: {
    marginLeft: 'auto',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.6rem',
    color: '#f59e0b',
    background: 'rgba(245,158,11,0.1)',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  commitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  commitItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: '#111',
    border: '1px solid #222',
    borderRadius: '6px',
    textDecoration: 'none',
    color: 'inherit',
  },
  commitSha: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.65rem',
    color: '#c8ff00',
    background: 'rgba(200,255,0,0.08)',
    padding: '2px 6px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  commitInfo: {
    flex: 1,
    minWidth: 0,
  },
  commitMessage: {
    fontSize: '0.82rem',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  commitMeta: {
    display: 'flex',
    gap: '1rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.62rem',
    color: '#555',
  },
}