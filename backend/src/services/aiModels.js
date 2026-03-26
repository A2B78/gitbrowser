// =============================================
// GitBrowser - AI Models Service
// Liste les modèles disponibles pour chaque provider
// =============================================

const { sendAIRequest } = require('./aiProviders');

/**
 * Liste des modèles par provider
 */
const AI_MODELS = {
  openai: [
    { id: 'gpt-4', name: 'GPT-4', description: 'Modèle le plus avancé' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'GPT-4 plus rapide' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Rapide et économique' },
  ],
  anthropic: [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Le plus puissant' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Équilibré' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Rapide et léger' },
  ],
  ollama: [], // Sera rempli dynamiquement
  openai_compatible: [], // Sera rempli dynamiquement
};

/**
 * Récupère les modèles disponibles pour un provider
 */
async function getModelsForProvider(providerName, options = {}) {
  // Pour OpenAI et Anthropic, retourne la liste statique
  if (providerName === 'openai' || providerName === 'anthropic') {
    return AI_MODELS[providerName] || [];
  }

  // Pour Ollama, récupère les modèles installés
  if (providerName === 'ollama') {
    try {
      const baseUrl = options.baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      return (data.models || []).map(model => ({
        id: model.name,
        name: model.name,
        description: `Taille: ${formatSize(model.size)}`,
        size: model.size,
        modified: model.modified_at,
      }));
    } catch (err) {
      console.error('Erreur récupération modèles Ollama:', err.message);
      return [];
    }
  }

  // Pour les APIs compatibles OpenAI, retourne une liste par défaut
  if (providerName === 'openai_compatible') {
    return [
      { id: 'default', name: 'Modèle par défaut', description: 'Modèle configuré sur le serveur' },
    ];
  }

  return [];
}

/**
 * Formate la taille en octets
 */
function formatSize(bytes) {
  if (!bytes) return 'Inconnu';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

/**
 * Liste tous les providers avec leurs modèles
 */
async function listAllProvidersWithModels(options = {}) {
  const providers = [
    { id: 'openai', name: 'OpenAI', models: AI_MODELS.openai },
    { id: 'anthropic', name: 'Anthropic', models: AI_MODELS.anthropic },
    { id: 'ollama', name: 'Ollama', models: await getModelsForProvider('ollama', options) },
    { id: 'openai_compatible', name: 'OpenAI Compatible', models: AI_MODELS.openai_compatible },
  ];

  return providers;
}

module.exports = {
  AI_MODELS,
  getModelsForProvider,
  listAllProvidersWithModels,
};