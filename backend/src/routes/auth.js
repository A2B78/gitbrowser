// =============================================
// GitBrowser - Auth Routes
// GET  /api/auth/github          → OAuth redirect
// GET  /api/auth/github/callback → OAuth callback
// GET  /api/auth/me              → Current user
// POST /api/auth/logout
// =============================================

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { generateToken, requireAuth } = require('../middleware/auth');
const { getGitHubUser } = require('../services/github');

const router = express.Router();

// Stockage temporaire des utilisateurs (en production, utiliser une base de données)
const users = new Map();

// ── GET /api/auth/github ──────────────────────
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GitHub OAuth non configuré.' });
  }

  const scope = 'user:email,repo,read:org';
  const state = require('crypto').randomBytes(16).toString('hex');
  const redirectUri = process.env.GITHUB_CALLBACK_URL;

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
});

// ── GET /api/auth/github/callback ─────────────
router.get('/github/callback', async (req, res, next) => {
  try {
    const { code, error: oauthError } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (oauthError) {
      return res.redirect(`${frontendUrl}/auth/error?reason=${oauthError}`);
    }
    if (!code) {
      return res.redirect(`${frontendUrl}/auth/error?reason=no_code`);
    }

    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${frontendUrl}/auth/error?reason=token_exchange_failed`);
    }

    const githubToken = tokenData.access_token;

    // Get GitHub user info
    const githubUser = await getGitHubUser(githubToken);

    // Create or update user
    let user = users.get(githubUser.id.toString());

    if (user) {
      // Update existing user
      user.githubToken = githubToken;
      user.name = githubUser.name || githubUser.login;
      user.avatarUrl = githubUser.avatarUrl;
      user.updatedAt = new Date().toISOString();
    } else {
      // Create new user
      const id = uuidv4();
      user = {
        id,
        githubId: githubUser.id.toString(),
        githubToken,
        login: githubUser.login,
        name: githubUser.name || githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatarUrl,
        bio: githubUser.bio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.set(githubUser.id.toString(), user);
    }

    const jwtToken = generateToken(user.id);
    res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}&github_token=${githubToken}`);
  } catch (err) { next(err); }
});

// ── GET /api/auth/me ─────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    // Trouver l'utilisateur par son ID
    let user = null;
    for (const u of users.values()) {
      if (u.id === req.userId) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    // Renvoyer le token GitHub pour que le frontend puisse l'utiliser
    res.json({ user });
  } catch (err) { next(err); }
});

// ── POST /api/auth/logout ─────────────────────
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

module.exports = router;