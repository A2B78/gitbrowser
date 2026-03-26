# 📋 Changelog

Tous les changements notables de GitBrowser sont documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versionnement Sémantique](https://semver.org/lang/fr/).

## [1.0.0] - 2026-03-26

### ✨ Ajouté
- **Authentification GitHub OAuth** : Connexion sécurisée via GitHub
- **Liste des repos** : Affichage de tous les repos (publics et privés)
- **Navigation dans les fichiers** : Exploration des dossiers et fichiers
- **Visualisation du code** : Affichage du contenu des fichiers
- **Informations Git** : Branches et commits récents
- **Analyse IA** : Analyse automatique de la qualité du code
- **Support multi-providers IA** :
  - OpenAI (GPT-4, GPT-4 Turbo, GPT-3.5 Turbo)
  - Anthropic (Claude 3 Opus, Sonnet, Haiku)
  - Ollama (modèles locaux)
  - API compatible OpenAI
- **Sélection dynamique des modèles** : Liste déroulante des modèles par provider
- **Configuration IA** : Modal de configuration des providers et modèles
- **Design sombre** : Interface style PipelineAI
- **Responsive** : Compatible mobile et desktop
- **Docker** : Configuration Docker Compose complète
- **Documentation** : README complet avec guide d'installation

### 🔧 Technique
- **Backend** : Node.js 20 + Express + Octokit
- **Frontend** : React 18 + Vite + React Router
- **Auth** : JWT + GitHub OAuth 2.0
- **API REST** : Routes pour repos, analyse, providers IA
- **Services** : github.js, aiAnalyzer.js, aiProviders.js, aiModels.js

### 🐳 Infrastructure
- **Docker** : Dockerfiles optimisés pour backend et frontend
- **Nginx** : Reverse proxy pour le frontend
- **Docker Compose** : Orchestration des services
- **Réseau** : Configuration réseau pour accès à Ollama

---

## [0.1.0] - 2026-03-26 (Développement initial)

### ✨ Ajouté
- Structure initiale du projet
- Configuration de base
- Premiers fichiers source

---

## 📝 Notes

### Versions futures planifiées

#### [1.1.0] - Planifié
- [ ] Support de GitLab et Bitbucket
- [ ] Export des analyses en PDF
- [ ] Historique des analyses
- [ ] Comparaison entre branches
- [ ] Notifications en temps réel

#### [1.2.0] - Planifié
- [ ] Collaboration en équipe
- [ ] Partage d'analyses
- [ ] Commentaires sur le code
- [ ] Intégration Slack/Discord
- [ ] API publique

#### [2.0.0] - Planifié
- [ ] Support multi-comptes GitHub
- [ ] Analyse de méta-projets
- [ ] Dashboard avancé avec métriques
- [ ] Intégration CI/CD
- [ ] Auto-fix des problèmes détectés

---

## 🔗 Liens

- [Repository GitHub](https://github.com/A2B78/gitbrowser)
- [Documentation](./README.md)
- [Issues](https://github.com/A2B78/gitbrowser/issues)
- [Releases](https://github.com/A2B78/gitbrowser/releases)

---

**Fait avec ❤️ pour les développeurs**