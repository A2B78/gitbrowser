// =============================================
// GitBrowser - AI Providers Service
// Supporte OpenAI, Anthropic, Ollama, et APIs compatibles
// =============================================

/**
 * Configuration des providers IA
 */
const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    formatRequest: (prompt, model) => ({
      model: model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    }),
    parseResponse: (data) => data.choices[0].message.content,
  },

  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-sonnet-20240229',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    }),
    formatRequest: (prompt, model) => ({
      model: model || 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: (data) => data.content[0].text,
  },

  ollama: {
    name: 'Ollama',
    baseUrl: process.env.OLLAMA_URL || 'http://192.168.1.57:11434',
    defaultModel: 'llama2',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    formatRequest: (prompt, model) => ({
      model: model || 'llama3.2:latest',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
    parseResponse: (data) => data.message?.content || data.response,
    endpoint: '/api/chat',
  },

  // API compatible OpenAI (pour les alternatives comme LocalAI, vLLM, etc.)
  openai_compatible: {
    name: 'OpenAI Compatible',
    baseUrl: process.env.AI_API_URL || 'http://localhost:8080/v1',
    defaultModel: process.env.AI_MODEL || 'default',
    headers: (apiKey) => ({
      'Authorization': apiKey ? `Bearer ${apiKey}` : '',
      'Content-Type': 'application/json',
    }),
    formatRequest: (prompt, model) => ({
      model: model || process.env.AI_MODEL || 'default',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    }),
    parseResponse: (data) => data.choices[0].message.content,
  },
};

/**
 * Récupère la configuration du provider
 */
function getProviderConfig(providerName) {
  const provider = AI_PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`Provider IA inconnu: ${providerName}. Providers disponibles: ${Object.keys(AI_PROVIDERS).join(', ')}`);
  }
  return provider;
}

/**
 * Envoie une requête à l'API IA
 */
async function sendAIRequest(providerName, prompt, options = {}) {
  const provider = getProviderConfig(providerName);
  const apiKey = options.apiKey || process.env.AI_API_KEY;
  const model = options.model || provider.defaultModel;
  const baseUrl = options.baseUrl || provider.baseUrl;

  // Vérifie la clé API (sauf pour Ollama et APIs compatibles sans auth)
  if (providerName !== 'ollama' && providerName !== 'openai_compatible' && !apiKey) {
    throw new Error(`Clé API requise pour ${provider.name}. Configurez AI_API_KEY ou passez apiKey en option.`);
  }

  // Utilise l'endpoint spécifique au provider ou /chat/completions par défaut
  const endpoint = provider.endpoint || '/chat/completions';
  const url = `${baseUrl}${endpoint}`;
  const headers = provider.headers(apiKey);
  const body = provider.formatRequest(prompt, model);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API ${provider.name} (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return provider.parseResponse(data);
  } catch (err) {
    if (err.message.includes('fetch failed')) {
      throw new Error(`Impossible de se connecter à ${provider.name} (${url}). Vérifiez que le service est accessible.`);
    }
    throw err;
  }
}

/**
 * Liste les providers disponibles
 */
function listProviders() {
  return Object.entries(AI_PROVIDERS).map(([key, value]) => ({
    id: key,
    name: value.name,
    baseUrl: value.baseUrl,
    defaultModel: value.defaultModel,
  }));
}

/**
 * Teste la connexion à un provider
 */
async function testProvider(providerName, options = {}) {
  try {
    const result = await sendAIRequest(providerName, 'Dis "Bonjour" en un mot.', options);
    return {
      success: true,
      provider: providerName,
      response: result,
    };
  } catch (err) {
    return {
      success: false,
      provider: providerName,
      error: err.message,
    };
  }
}

module.exports = {
  AI_PROVIDERS,
  getProviderConfig,
  sendAIRequest,
  listProviders,
  testProvider,
};