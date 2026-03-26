# 🔍 GitBrowser — Browse your GitHub repositories

> Connecte-toi à GitHub et navigue dans tes repos en toute simplicité.

---

## ✨ Fonctionnalités

### 🔐 Authentification
- ✅ Connexion via GitHub OAuth
- ✅ Gestion sécurisée des tokens
- ✅ Session persistante

### 📁 Navigation des repos
- ✅ Liste de tous tes repos (publics et privés)
- ✅ Recherche et filtrage
- ✅ Pagination pour les gros comptes
- ✅ Affichage des métadonnées (étoiles, forks, langage)

### 📂 Exploration des fichiers
- ✅ Navigation dans les dossiers
- ✅ Visualisation du contenu des fichiers
- ✅ Breadcrumb pour la navigation
- ✅ Affichage de la taille des fichiers

### 🌿 Informations Git
- ✅ Liste des branches
- ✅ Historique des commits
- ✅ Liens vers GitHub

### 🤖 Analyse IA
- ✅ Analyse automatique de la qualité du code
- ✅ Détection des problèmes de sécurité
- ✅ Évaluation des performances
- ✅ Recommandations personnalisées
- ✅ Support multi-providers IA (OpenAI, Anthropic, Ollama, API compatible)
- ✅ Sélection dynamique des modèles

### 🎨 Interface
- ✅ Design sombre style PipelineAI
- ✅ Responsive (mobile + desktop)
- ✅ Interface intuitive
- ✅ Animations fluides

---

## 🏗️ Architecture

```
gitbrowser/
├── backend/                          # API Node.js/Express
│   ├── src/
│   │   ├── server.js                 # Point d'entrée
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js               # GitHub OAuth
│   │   │   ├── repos.js              # API repos
│   │   │   └── analyze.js            # API analyse IA
│   │   └── services/
│   │       ├── github.js             # GitHub API (Octokit)
│   │       ├── aiAnalyzer.js         # Moteur d'analyse
│   │       ├── aiProviders.js        # Gestion providers IA
│   │       └── aiModels.js           # Gestion modèles IA
│   ├── Dockerfile
│   └── package.json
├── frontend/                         # React + Vite
│   ├── src/
│   │   ├── App.jsx                   # Routes + Auth context
│   │   ├── lib/api.js                # Client API
│   │   └── pages/
│   │       ├── Login.jsx             # Page de connexion
│   │       ├── AuthCallback.jsx      # Callback OAuth
│   │       ├── Dashboard.jsx         # Liste des repos
│   │       ├── RepoDetail.jsx        # Détail d'un repo
│   │       └── RepoAnalysis.jsx      # Analyse IA
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml                # Orchestration Docker
├── .env.example                      # Configuration
└── README.md                         # Documentation
```

---

## 🚀 Installation rapide

### Option 1 : Docker (Recommandé)

#### Prérequis
- Docker Desktop installé
- Git

#### Étapes

**1. Clone le projet**
```bash
git clone https://github.com/A2B78/gitbrowser.git
cd gitbrowser
```

**2. Configure l'environnement**
```bash
cp .env.example .env
```

**3. Configure GitHub OAuth**

1. Va sur https://github.com/settings/applications/new
2. Remplis les champs :
   - **Application name**: `GitBrowser`
   - **Homepage URL**: `http://localhost`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
3. Clique sur "Register application"
4. Copie le **Client ID** et génère un **Client Secret**
5. Mets à jour le fichier `.env` :
```bash
GITHUB_CLIENT_ID=ton_client_id
GITHUB_CLIENT_SECRET=ton_client_secret
```

**4. Lance l'application**
```bash
docker compose up -d
```

**5. Accède à l'application**
- Ouvre http://localhost dans ton navigateur
- Clique sur "Continuer avec GitHub"
- Autorise l'application

---

### Option 2 : Installation manuelle

#### Prérequis
- Node.js 20+
- npm ou yarn
- Git

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Édite .env avec tes valeurs
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur http://localhost:5173

---

## ⚙️ Configuration

### Variables d'environnement (.env)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du backend | `3001` |
| `NODE_ENV` | Environnement | `development` |
| `BASE_URL` | URL du backend | `http://localhost:3001` |
| `FRONTEND_URL` | URL du frontend | `http://localhost` |
| `JWT_SECRET` | Secret JWT (64+ chars) | `openssl rand -base64 64` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `Ov23li...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | `aab756...` |
| `GITHUB_CALLBACK_URL` | Callback URL OAuth | `http://localhost:3001/api/auth/github/callback` |

### Configuration IA (Optionnel)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `AI_PROVIDER` | Provider IA par défaut | `openai` |
| `AI_API_KEY` | Clé API du provider | `sk-...` |
| `AI_MODEL` | Modèle par défaut | `gpt-4` |
| `OLLAMA_URL` | URL d'Ollama | `http://localhost:11434` |
| `AI_API_URL` | URL API compatible OpenAI | `http://localhost:8080/v1` |

---

## 🤖 Configuration de l'IA

### Providers supportés

#### 1. OpenAI
```bash
AI_PROVIDER=openai
AI_API_KEY=sk-ton_cle_openai
AI_MODEL=gpt-4
```

**Modèles disponibles :**
- GPT-4 (recommandé)
- GPT-4 Turbo
- GPT-3.5 Turbo

#### 2. Anthropic
```bash
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-ton_cle_anthropic
AI_MODEL=claude-3-sonnet-20240229
```

**Modèles disponibles :**
- Claude 3 Opus (le plus puissant)
- Claude 3 Sonnet (équilibré)
- Claude 3 Haiku (rapide)

#### 3. Ollama (Local, Gratuit)
```bash
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
AI_MODEL=codellama:latest
```

**Installation d'Ollama :**
```bash
# Sur la machine distante
curl -fsSL https://ollama.com/install.sh | sh
ollama pull codellama
ollama serve
```

**Configuration réseau :**
```powershell
# Sur Windows (machine Ollama)
[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0:11434", "Machine")
```

#### 4. API Compatible OpenAI
```bash
AI_PROVIDER=openai_compatible
AI_API_URL=http://localhost:8080/v1
AI_MODEL=default
```

Pour LocalAI, vLLM, ou autres alternatives.

---

## 📡 API Reference

### Authentication

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/auth/github` | Redirection OAuth GitHub |
| `GET` | `/api/auth/github/callback` | Callback OAuth |
| `GET` | `/api/auth/me` | Profil utilisateur |
| `POST` | `/api/auth/logout` | Déconnexion |

### Repositories

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/repos` | Lister les repos |
| `GET` | `/api/repos/:owner/:repo` | Détails d'un repo |
| `GET` | `/api/repos/:owner/:repo/contents` | Lister les fichiers |
| `GET` | `/api/repos/:owner/:repo/file` | Contenu d'un fichier |
| `GET` | `/api/repos/:owner/:repo/branches` | Lister les branches |
| `GET` | `/api/repos/:owner/:repo/commits` | Derniers commits |

### Analysis

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/analyze/:owner/:repo` | Analyser un repo |
| `GET` | `/api/analyze/providers` | Lister les providers IA |
| `GET` | `/api/analyze/providers/:provider/models` | Lister les modèles d'un provider |
| `GET` | `/api/analyze/providers/models/all` | Tous les providers avec modèles |
| `POST` | `/api/analyze/providers/test` | Tester un provider |

### Health

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/health` | Health check |

---

## 🐳 Docker

### docker compose.yml

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    env_file: .env
    extra_hosts:
      - "host.docker.internal:host-gateway"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Commandes utiles

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Reconstruire
docker compose up -d --build

# Voir les logs
docker compose logs -f

# Logs backend
docker compose logs backend

# Logs frontend
docker compose logs frontend
```

---

## 🔧 Développement

### Structure du code

**Backend :**
- `server.js` : Point d'entrée Express
- `middleware/auth.js` : JWT authentication
- `routes/` : Routes API
- `services/` : Logique métier

**Frontend :**
- `App.jsx` : Routes et contexte auth
- `lib/api.js` : Client API centralisé
- `pages/` : Pages React

### Scripts npm

**Backend :**
```bash
npm start      # Production
npm run dev    # Développement (avec --watch)
```

**Frontend :**
```bash
npm run dev    # Serveur de développement
npm run build  # Build production
npm run preview # Preview du build
```

---

## 🐛 Troubleshooting

### Erreur "Assignment to constant variable"
**Solution :** Cette erreur est corrigée dans la version actuelle.

### Ollama ne se connecte pas
**Causes possibles :**
1. Ollama n'est pas démarré
2. Ollama écoute seulement sur localhost
3. Pare-feu bloque le port 11434

**Solutions :**
```bash
# 1. Démarrer Ollama
ollama serve

# 2. Configurer pour écouter sur toutes les interfaces
[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0:11434", "Machine")

# 3. Ouvrir le port dans le pare-feu
New-NetFirewallRule -DisplayName "Ollama" -Direction Inbound -Protocol TCP -LocalPort 11434 -Action Allow
```

### Frontend ne se connecte pas au backend
**Solution :** Vérifie que les deux conteneurs sont dans le même réseau Docker.

### Token GitHub expiré
**Solution :** Déconnecte-toi et reconnecte-toi via GitHub OAuth.

---

## 📊 Technologies

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Node.js 20 · Express · Octokit |
| **Frontend** | React 18 · Vite · React Router |
| **Auth** | GitHub OAuth 2.0 · JWT |
| **IA** | OpenAI · Anthropic · Ollama |
| **Styling** | CSS-in-JS · Lucide Icons |
| **DevOps** | Docker · Docker Compose · Nginx |

---

## 📝 Licence

MIT — Utilise librement pour tes projets.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Crée une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## 📧 Support

Pour toute question ou problème :
- Ouvre une issue sur GitHub
- Consulte la section Troubleshooting

---

**Fait avec ❤️ pour les développeurs**