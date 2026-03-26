// =============================================
// GitBrowser - Analyze Routes
// POST /api/analyze/:owner/:repo → Analyze repo
// GET  /api/analyze/providers → List AI providers
// POST /api/analyze/providers/test → Test AI provider
// =============================================

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { analyzeRepository, analyzeWithAI } = require('../services/aiAnalyzer');
const { listProviders, testProvider } = require('../services/aiProviders');
const { getModelsForProvider, listAllProvidersWithModels } = require('../services/aiModels');

const router = express.Router();
router.use(requireAuth);

// Stockage temporaire des tokens
const getUserToken = (req) => {
  return req.headers['x-github-token'];
};

// ── POST /api/analyze/:owner/:repo ────────────
router.post('/:owner/:repo', async (req, res, next) => {
  try {
    const token = getUserToken(req);
    if (!token) {
      return res.status(400).json({ error: 'Token GitHub manquant.' });
    }

    const { owner, repo } = req.params;
    const { aiProvider, aiModel, aiApiKey, aiBaseUrl } = req.body;

    console.log(`🔍 Analyzing repo: ${owner}/${repo}${aiProvider ? ` with AI: ${aiProvider}` : ''}`);

    // Analyse de base
    const analysis = await analyzeRepository(token, owner, repo);

    // Analyse IA optionnelle
    let aiAnalysis = null;
    if (aiProvider) {
      const aiOptions = {
        model: aiModel,
        apiKey: aiApiKey,
        baseUrl: aiBaseUrl,
      };
      aiAnalysis = await analyzeWithAI(token, owner, repo, aiProvider, aiOptions);
      analysis.ai = aiAnalysis;
    }

    res.json({ analysis });
  } catch (err) {
    console.error('Analysis error:', err);
    next(err);
  }
});

// ── GET /api/analyze/providers ────────────────
router.get('/providers', async (req, res, next) => {
  try {
    const providers = listProviders();
    res.json({ providers });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/analyze/providers/test ──────────
router.post('/providers/test', async (req, res, next) => {
  try {
    const { provider, apiKey, baseUrl, model } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider requis.' });
    }

    const options = { apiKey, baseUrl, model };
    const result = await testProvider(provider, options);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/analyze/providers/:provider/models ──
router.get('/providers/:provider/models', async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { baseUrl } = req.query;

    const options = { baseUrl };
    const models = await getModelsForProvider(provider, options);

    res.json({ models });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/analyze/providers/models/all ──────
router.get('/providers/models/all', async (req, res, next) => {
  try {
    const { baseUrl } = req.query;

    const options = { baseUrl };
    const providers = await listAllProvidersWithModels(options);

    res.json({ providers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
