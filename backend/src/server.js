// =============================================
// GitBrowser - Main Server
// =============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const reposRoutes = require('./routes/repos');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
  ],
  credentials: true,
}));

// ── Body parsing ─────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/repos', reposRoutes);
app.use('/api/analyze', analyzeRoutes);

// ── Health check ─────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

// ── Error handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erreur interne du serveur.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start ────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║         GitBrowser v1.0.0            ║
║   Browse your GitHub repositories    ║
╠══════════════════════════════════════╣
║  API     → http://localhost:${PORT}     ║
║  Health  → /health                   ║
╚══════════════════════════════════════╝
  `);
});

module.exports = app;