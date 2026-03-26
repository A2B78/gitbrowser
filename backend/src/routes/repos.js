// =============================================
// GitBrowser - Repos Routes
// GET  /api/repos                    → List repos
// GET  /api/repos/:owner/:repo       → Get repo details
// GET  /api/repos/:owner/:repo/contents → List contents
// GET  /api/repos/:owner/:repo/file  → Get file content
// GET  /api/repos/:owner/:repo/branches → List branches
// GET  /api/repos/:owner/:repo/commits  → Get recent commits
// =============================================

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  listUserRepositories,
  getRepository,
  listRepositoryContents,
  getFileContent,
  listBranches,
  getRecentCommits,
} = require('../services/github');

const router = express.Router();
router.use(requireAuth);

// Stockage temporaire des tokens (en production, utiliser une base de données)
// Partagé avec auth.js via un module séparé en production
const getUserToken = (req) => {
  // En production, récupérer le token depuis la base de données
  // Pour l'instant, on utilise un stockage temporaire
  return req.headers['x-github-token'];
};

// ── GET /api/repos ────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const token = getUserToken(req);
    if (!token) {
      return res.status(400).json({ error: 'Token GitHub manquant. Connecte-toi d\'abord.' });
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 30;

    const repos = await listUserRepositories(token, page, perPage);
    res.json({ repos, page });
  } catch (err) { next(err); }
});

// ── GET /api/repos/:owner/:repo ───────────────
router.get('/:owner/:repo', async (req, res, next) => {
  try {
    const token = getUserToken(req);
    if (!token) {
      return res.status(400).json({ error: 'Token GitHub manquant.' });
    }

    const { owner, repo } = req.params;
    const repoData = await getRepository(token, owner, repo);
    res.json({ repo: repoData });
  } catch (err) { next(err); }
});

// ── GET /api/repos/:owner/:repo/contents ──────
router.get('/:owner/:repo/contents', async (req, res, next) => {
  try {
    const token = getUserToken(req);
    if (!token) {
      return res.status(400).json({ error: 'Token GitHub manquant.' });
    }

    const { owner, repo } = req.params;
    const path = req.query.path || '';

    const contents = await listRepositoryContents(token, owner, repo, path);
    res.json({ contents, path });
  } catch (err) { next(err); }
});

// ── GET /api/repos/:owner/:repo/file ──────────
router.get('/:owner/:repo/file', async (req, res, next) => {
  try {
    const token = getUserToken(req);
    if (!token) {
      return res.status(400).json({ error: 'Token GitHub manquant.' });
    }

    const { owner, repo } = req.params;
    const filePath = req.query.path;

    if (!filePath) {
      return res.status(400).json({ error: 'Le paramètre "path" est requis.' });
    }

    const file = await getFileContent(token, owner, repo, filePath);
    res.json({ file });
  } catch (err) { next(err); }
});

// ── GET /api/repos/:owner/:repo/branches ──────
router.get('/:owner/:repo/branches', async (req, res, next) => {
  try {
    const token = getUserToken(req);
    if (!token) {
      return res.status(400).json({ error: 'Token GitHub manquant.' });
    }

    const { owner, repo } = req.params;
    const branches = await listBranches(token, owner, repo);
    res.json({ branches });
  } catch (err) { next(err); }
});

// ── GET /api/repos/:owner/:repo/commits ───────
router.get('/:owner/:repo/commits', async (req, res, next) => {
  try {
    const token = getUserToken(req);
    if (!token) {
      return res.status(400).json({ error: 'Token GitHub manquant.' });
    }

    const { owner, repo } = req.params;
    const branch = req.query.branch || 'main';
    const limit = parseInt(req.query.limit) || 10;

    const commits = await getRecentCommits(token, owner, repo, branch, limit);
    res.json({ commits });
  } catch (err) { next(err); }
});

module.exports = router;