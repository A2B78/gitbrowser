import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Brain, CheckCircle, AlertTriangle, XCircle, TrendingUp, Shield, Zap, Code, GitBranch, Star, GitFork, Settings } from 'lucide-react'
import api from '../lib/api'

const SCORE_COLORS = {
  excellent: '#22c55e',
  good: '#84cc16',
  average: '#f59e0b',
  poor: '#ef4444',
}

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
}

const STACK_EMOJI = {
  node: '🟨',
  python: '🐍',
  go: '🐹',
  php: '🐘',
  rust: '🦀',
  java: '☕',
  static: '📄',
  unknown: '📁',
}

export default function RepoAnalysisPage() {
  const { owner, repo } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAiConfig, setShowAiConfig] = useState(false)
  const [providers, setProviders] = useState([])
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [aiConfig, setAiConfig] = useState({
    provider: '',
    model: '',
    apiKey: '',
    baseUrl: '',
  })

  useEffect(() => {
    loadAnalysis()
    loadProviders()
  }, [owner, repo])

  const loadProviders = async () => {
    try {
      const { providers: data } = await api.analyze.providers()
      setProviders(data)
    } catch (err) {
      console.error('Erreur chargement providers:', err)
    }
  }

  const loadModels = async (provider) => {
    if (!provider) {
      setModels([])
      return
    }

    setLoadingModels(true)
    try {
      const { models: data } = await api.analyze.models(provider, aiConfig.baseUrl)
      setModels(data)
    } catch (err) {
      console.error('Erreur chargement modèles:', err)
      setModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  const handleProviderChange = (provider) => {
    setAiConfig(p => ({ ...p, provider, model: '' }))
    loadModels(provider)
  }

  const loadAnalysis = async (withAi = false) => {
    setLoading(true)
    setError(null)
    try {
      const aiOptions = withAi && aiConfig.provider ? {
        aiProvider: aiConfig.provider,
        aiModel: aiConfig.model,
        aiApiKey: aiConfig.apiKey,
        aiBaseUrl: aiConfig.baseUrl,
      } : {}
      
      const { analysis: data } = await api.analyze.run(owner, repo, aiOptions)
      setAnalysis(data)
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeWithAi = () => {
    if (!aiConfig.provider) {
      setShowAiConfig(true)
      return
    }
    loadAnalysis(true)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return SCORE_COLORS.excellent
    if (score >= 60) return SCORE_COLORS.good
    if (score >= 40) return SCORE_COLORS.average
    return SCORE_COLORS.poor
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Bon'
    if (score >= 40) return 'Moyen'
    return 'À améliorer'
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <Brain size={32} color="#c8ff00" />
        <div style={styles.loadingText}>
          <div style={styles.spinner} />
          Analyse IA en cours...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.error}>
        <XCircle size={48} color="#ef4444" />
        <h2>Erreur d'analyse</h2>
        <p>{error}</p>
        <button onClick={loadAnalysis} style={styles.retryBtn}>
          Réessayer
        </button>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to={`/repos/${owner}/${repo}`} style={styles.backBtn}>
            <ArrowLeft size={16} />
          </Link>
          <Brain size={20} color="#c8ff00" />
          <span style={styles.headerTitle}>Analyse IA</span>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => setShowAiConfig(true)} style={styles.configBtn}>
            <Settings size={14} />
            Configurer IA
          </button>
          <button onClick={handleAnalyzeWithAi} style={styles.aiBtn}>
            <Brain size={14} />
            Analyser avec IA
          </button>
        </div>
      </header>

      {/* AI Config Modal */}
      {showAiConfig && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Configuration IA</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Provider</label>
              <select
                value={aiConfig.provider}
                onChange={e => handleProviderChange(e.target.value)}
                style={styles.select}
              >
                <option value="">Sélectionner un provider</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Modèle</label>
              {loadingModels ? (
                <div style={styles.loadingModels}>
                  <div style={styles.spinner} />
                  Chargement des modèles...
                </div>
              ) : models.length > 0 ? (
                <select
                  value={aiConfig.model}
                  onChange={e => setAiConfig(p => ({ ...p, model: e.target.value }))}
                  style={styles.select}
                >
                  <option value="">Sélectionner un modèle</option>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.description ? `- ${m.description}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={aiConfig.model}
                  onChange={e => setAiConfig(p => ({ ...p, model: e.target.value }))}
                  placeholder={providers.find(p => p.id === aiConfig.provider)?.defaultModel || 'gpt-4'}
                  style={styles.input}
                />
              )}
            </div>

            {aiConfig.provider !== 'ollama' && aiConfig.provider !== 'openai_compatible' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Clé API</label>
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={e => setAiConfig(p => ({ ...p, apiKey: e.target.value }))}
                  placeholder="sk-..."
                  style={styles.input}
                />
              </div>
            )}

            {(aiConfig.provider === 'ollama' || aiConfig.provider === 'openai_compatible') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>URL de l'API</label>
                <input
                  type="text"
                  value={aiConfig.baseUrl}
                  onChange={e => setAiConfig(p => ({ ...p, baseUrl: e.target.value }))}
                  placeholder={providers.find(p => p.id === aiConfig.provider)?.baseUrl || 'http://localhost:11434'}
                  style={styles.input}
                />
              </div>
            )}

            <div style={styles.modalActions}>
              <button onClick={() => setShowAiConfig(false)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button onClick={() => { setShowAiConfig(false); loadAnalysis(true); }} style={styles.saveBtn}>
                Sauvegarder et analyser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {/* Repo info */}
        <div style={styles.repoInfo}>
          <div style={styles.repoHeader}>
            <span style={styles.repoEmoji}>
              {STACK_EMOJI[analysis.stack?.type] || '📁'}
            </span>
            <div>
              <h1 style={styles.repoTitle}>{analysis.repo.name}</h1>
              <p style={styles.repoDesc}>{analysis.repo.description || 'Pas de description'}</p>
            </div>
          </div>
          <div style={styles.repoMeta}>
            <span style={styles.metaItem}>
              <Star size={12} /> {analysis.repo.stars || 0}
            </span>
            <span style={styles.metaItem}>
              <GitFork size={12} /> {analysis.repo.forks || 0}
            </span>
            <span style={styles.metaItem}>
              <GitBranch size={12} /> {analysis.repo.defaultBranch}
            </span>
            {analysis.repo.language && (
              <span style={styles.metaItem}>
                <Code size={12} /> {analysis.repo.language}
              </span>
            )}
          </div>
        </div>

        {/* Scores */}
        <div style={styles.scoresGrid}>
          <div style={styles.scoreCard}>
            <div style={styles.scoreHeader}>
              <Code size={16} color="#c8ff00" />
              <span style={styles.scoreLabel}>Qualité</span>
            </div>
            <div style={{
              ...styles.scoreValue,
              color: getScoreColor(analysis.quality.score)
            }}>
              {analysis.quality.score}/100
            </div>
            <div style={styles.scoreStatus}>
              {getScoreLabel(analysis.quality.score)}
            </div>
          </div>

          <div style={styles.scoreCard}>
            <div style={styles.scoreHeader}>
              <Shield size={16} color="#c8ff00" />
              <span style={styles.scoreLabel}>Sécurité</span>
            </div>
            <div style={{
              ...styles.scoreValue,
              color: getScoreColor(analysis.security.score)
            }}>
              {analysis.security.score}/100
            </div>
            <div style={styles.scoreStatus}>
              {getScoreLabel(analysis.security.score)}
            </div>
          </div>

          <div style={styles.scoreCard}>
            <div style={styles.scoreHeader}>
              <Zap size={16} color="#c8ff00" />
              <span style={styles.scoreLabel}>Performance</span>
            </div>
            <div style={{
              ...styles.scoreValue,
              color: getScoreColor(analysis.performance.score)
            }}>
              {analysis.performance.score}/100
            </div>
            <div style={styles.scoreStatus}>
              {getScoreLabel(analysis.performance.score)}
            </div>
          </div>
        </div>

        {/* Stack info */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Code size={16} color="#c8ff00" />
            Stack technique
          </h2>
          <div style={styles.stackInfo}>
            <div style={styles.stackItem}>
              <span style={styles.stackLabel}>Framework:</span>
              <span style={styles.stackValue}>{analysis.stack.framework}</span>
            </div>
            {analysis.stack.version && (
              <div style={styles.stackItem}>
                <span style={styles.stackLabel}>Version:</span>
                <span style={styles.stackValue}>{analysis.stack.version}</span>
              </div>
            )}
            <div style={styles.stackItem}>
              <span style={styles.stackLabel}>TypeScript:</span>
              <span style={styles.stackValue}>
                {analysis.stack.hasTypeScript ? '✅ Oui' : '❌ Non'}
              </span>
            </div>
            <div style={styles.stackItem}>
              <span style={styles.stackLabel}>Tests:</span>
              <span style={styles.stackValue}>
                {analysis.stack.hasTests ? '✅ Oui' : '❌ Non'}
              </span>
            </div>
            {analysis.stack.packageManager && (
              <div style={styles.stackItem}>
                <span style={styles.stackLabel}>Package Manager:</span>
                <span style={styles.stackValue}>{analysis.stack.packageManager}</span>
              </div>
            )}
          </div>
        </div>

        {/* Issues */}
        {(analysis.quality.issues.length > 0 || analysis.security.vulnerabilities.length > 0) && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <AlertTriangle size={16} color="#f59e0b" />
              Problèmes détectés
            </h2>
            <div style={styles.issuesList}>
              {analysis.quality.issues.map((issue, i) => (
                <div key={i} style={styles.issueItem}>
                  <AlertTriangle size={14} color="#f59e0b" />
                  <span>{issue}</span>
                </div>
              ))}
              {analysis.security.vulnerabilities.map((vuln, i) => (
                <div key={i} style={styles.issueItem}>
                  <XCircle size={14} color="#ef4444" />
                  <span>{vuln.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <TrendingUp size={16} color="#c8ff00" />
              Recommandations
            </h2>
            <div style={styles.recommendationsList}>
              {analysis.recommendations.map((rec, i) => (
                <div key={i} style={styles.recommendationItem}>
                  <div style={styles.recHeader}>
                    <span style={{
                      ...styles.recPriority,
                      color: PRIORITY_COLORS[rec.priority]
                    }}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span style={styles.recCategory}>{rec.category}</span>
                  </div>
                  <h3 style={styles.recTitle}>{rec.title}</h3>
                  <p style={styles.recDesc}>{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {(analysis.quality.suggestions.length > 0 || analysis.security.recommendations.length > 0 || analysis.performance.suggestions.length > 0) && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <CheckCircle size={16} color="#22c55e" />
              Suggestions d'amélioration
            </h2>
            <div style={styles.suggestionsList}>
              {analysis.quality.suggestions.map((sug, i) => (
                <div key={i} style={styles.suggestionItem}>
                  <CheckCircle size={14} color="#22c55e" />
                  <span>{sug}</span>
                </div>
              ))}
              {analysis.security.recommendations.map((rec, i) => (
                <div key={i} style={styles.suggestionItem}>
                  <Shield size={14} color="#3b82f6" />
                  <span>{rec}</span>
                </div>
              ))}
              {analysis.performance.suggestions.map((sug, i) => (
                <div key={i} style={styles.suggestionItem}>
                  <Zap size={14} color="#f59e0b" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files analyzed */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Code size={16} color="#c8ff00" />
            Fichiers analysés ({analysis.files.length})
          </h2>
          <div style={styles.filesList}>
            {analysis.files.slice(0, 20).map((file, i) => (
              <div key={i} style={styles.fileItem}>
                <span style={styles.fileName}>{file.name}</span>
                <span style={styles.filePath}>{file.path}</span>
              </div>
            ))}
            {analysis.files.length > 20 && (
              <div style={styles.fileItem}>
                <span style={styles.fileName}>... et {analysis.files.length - 20} autres fichiers</span>
              </div>
            )}
          </div>
        </div>
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
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.9rem',
    color: '#c8ff00',
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
    textAlign: 'center',
    padding: '2rem',
  },
  retryBtn: {
    background: '#c8ff00',
    color: '#0a0a0a',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
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
  headerTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  content: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '2rem',
  },
  repoInfo: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
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
    color: '#555',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  scoreCard: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  scoreHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  scoreLabel: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    marginBottom: '0.25rem',
  },
  scoreStatus: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.65rem',
    color: '#555',
  },
  section: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    marginBottom: '1rem',
    letterSpacing: '-0.02em',
  },
  stackInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  stackItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
  },
  stackLabel: {
    color: '#555',
  },
  stackValue: {
    color: '#e8e6e0',
    fontWeight: 700,
  },
  issuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  issueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    padding: '0.5rem',
    background: '#1a1a1a',
    borderRadius: '4px',
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  recommendationItem: {
    padding: '1rem',
    background: '#1a1a1a',
    borderRadius: '6px',
    borderLeft: '3px solid #c8ff00',
  },
  recHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  recPriority: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.1)',
  },
  recCategory: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.65rem',
    color: '#555',
  },
  recTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  recDesc: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.72rem',
    color: '#888',
    lineHeight: 1.5,
  },
  suggestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    padding: '0.5rem',
    background: '#1a1a1a',
    borderRadius: '4px',
  },
  filesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    background: '#1a1a1a',
    borderRadius: '4px',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.72rem',
  },
  fileName: {
    fontWeight: 700,
  },
  filePath: {
    color: '#555',
    fontSize: '0.65rem',
  },
  headerRight: {
    display: 'flex',
    gap: '0.75rem',
  },
  configBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: '#1a1a1a',
    color: '#e8e6e0',
    border: '1px solid #333',
    padding: '0.4rem 0.75rem',
    borderRadius: '4px',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  aiBtn: {
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
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1rem',
  },
  modalContent: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '2rem',
    maxWidth: 500,
    width: '100%',
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: 900,
    marginBottom: '1.5rem',
    letterSpacing: '-0.02em',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.7rem',
    color: '#555',
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
  },
  select: {
    background: '#1a1a1a',
    border: '1px solid #222',
    color: '#e8e6e0',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.8rem',
    padding: '0.6rem 0.875rem',
    borderRadius: '4px',
    width: '100%',
    outline: 'none',
  },
  input: {
    background: '#1a1a1a',
    border: '1px solid #222',
    color: '#e8e6e0',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.8rem',
    padding: '0.6rem 0.875rem',
    borderRadius: '4px',
    width: '100%',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    background: '#1a1a1a',
    color: '#e8e6e0',
    border: '1px solid #333',
    padding: '0.6rem 1.25rem',
    borderRadius: '4px',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  saveBtn: {
    background: '#c8ff00',
    color: '#0a0a0a',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '4px',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  loadingModels: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    color: '#555',
    padding: '0.6rem 0.875rem',
    background: '#1a1a1a',
    border: '1px solid #222',
    borderRadius: '4px',
  },
}
