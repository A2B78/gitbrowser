# 📡 API Reference - GitBrowser

Documentation complète de l'API REST de GitBrowser.

---

## 📋 Table des matières

- [Authentication](#-authentication)
- [Repositories](#-repositories)
- [Analysis](#-analysis)
- [Providers IA](#-providers-ia)
- [Health](#-health)
- [Erreurs](#-erreurs)
- [Rate Limiting](#-rate-limiting)

---

## 🔐 Authentication

Toutes les routes (sauf `/health`) nécessitent un token JWT dans le header `Authorization`.

### Headers requis

```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>  # Pour les routes qui accèdent à GitHub
```

### Obtenir un token

1. **Via GitHub OAuth** : Redirige l'utilisateur vers `/api/auth/github`
2. **Callback** : L'utilisateur est redirigé avec un token JWT
3. **Utilisation** : Stocke le token dans `localStorage`

---

## 🔐 Auth Routes

### `GET /api/auth/github`

Redirige vers GitHub pour l'authentification OAuth.

**Paramètres de requête :** Aucun

**Réponse :** Redirection vers GitHub

**Exemple :**
```javascript
window.location.href = '/api/auth/github';
```

---

### `GET /api/auth/github/callback`

Callback après l'authentification GitHub.

**Paramètres de requête :**
- `code` (string, requis) : Code d'autorisation GitHub
- `error` (string, optionnel) : Erreur OAuth

**Réponse :** Redirection vers le frontend avec token JWT

**Exemple de redirection :**
```
http://localhost/auth/callback?token=<jwt_token>&github_token=<github_token>
```

---

### `GET /api/auth/me`

Récupère le profil de l'utilisateur connecté.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
```

**Réponse :**
```json
{
  "user": {
    "id": "uuid",
    "githubId": "123456",
    "login": "username",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "https://avatars.githubusercontent.com/u/123456",
    "bio": "Software Developer",
    "createdAt": "2026-03-26T20:00:00.000Z",
    "updatedAt": "2026-03-26T20:00:00.000Z"
  }
}
```

**Codes d'erreur :**
- `401` : Token invalide ou expiré
- `404` : Utilisateur introuvable

---

### `POST /api/auth/logout`

Déconnecte l'utilisateur.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
```

**Réponse :**
```json
{
  "success": true,
  "message": "Déconnexion réussie."
}
```

---

## 📁 Repos Routes

### `GET /api/repos`

Liste tous les repos accessibles par l'utilisateur.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>
```

**Paramètres de requête :**
- `page` (number, optionnel) : Numéro de page (défaut: 1)
- `per_page` (number, optionnel) : Nombre de repos par page (défaut: 30, max: 100)

**Réponse :**
```json
{
  "repos": [
    {
      "id": 123456,
      "fullName": "owner/repo",
      "name": "repo",
      "owner": "owner",
      "private": false,
      "language": "JavaScript",
      "defaultBranch": "main",
      "updatedAt": "2026-03-26T20:00:00.000Z",
      "url": "https://github.com/owner/repo",
      "description": "Description du repo",
      "stars": 100,
      "forks": 20
    }
  ],
  "page": 1
}
```

**Codes d'erreur :**
- `400` : Token GitHub manquant
- `401` : Token JWT invalide
- `403` : Accès refusé par GitHub

---

### `GET /api/repos/:owner/:repo`

Récupère les détails d'un repo spécifique.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>
```

**Paramètres de chemin :**
- `owner` (string, requis) : Propriétaire du repo
- `repo` (string, requis) : Nom du repo

**Réponse :**
```json
{
  "repo": {
    "id": 123456,
    "fullName": "owner/repo",
    "name": "repo",
    "owner": "owner",
    "private": false,
    "language": "JavaScript",
    "defaultBranch": "main",
    "description": "Description du repo",
    "stars": 100,
    "forks": 20,
    "openIssues": 5,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-26T20:00:00.000Z",
    "url": "https://github.com/owner/repo"
  }
}
```

**Codes d'erreur :**
- `400` : Token GitHub manquant
- `404` : Repo introuvable

---

### `GET /api/repos/:owner/:repo/contents`

Liste le contenu d'un répertoire dans le repo.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>
```

**Paramètres de chemin :**
- `owner` (string, requis) : Propriétaire du repo
- `repo` (string, requis) : Nom du repo

**Paramètres de requête :**
- `path` (string, optionnel) : Chemin du répertoire (défaut: racine)

**Réponse :**
```json
{
  "contents": [
    {
      "name": "src",
      "path": "src",
      "type": "dir",
      "size": null,
      "url": "https://github.com/owner/repo/tree/main/src",
      "downloadUrl": null
    },
    {
      "name": "package.json",
      "path": "package.json",
      "type": "file",
      "size": 1234,
      "url": "https://github.com/owner/repo/blob/main/package.json",
      "downloadUrl": "https://raw.githubusercontent.com/owner/repo/main/package.json"
    }
  ],
  "path": ""
}
```

**Codes d'erreur :**
- `400` : Token GitHub manquant
- `404` : Chemin introuvable

---

### `GET /api/repos/:owner/:repo/file`

Récupère le contenu d'un fichier spécifique.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>
```

**Paramètres de chemin :**
- `owner` (string, requis) : Propriétaire du repo
- `repo` (string, requis) : Nom du repo

**Paramètres de requête :**
- `path` (string, requis) : Chemin du fichier

**Réponse :**
```json
{
  "file": {
    "name": "index.js",
    "path": "src/index.js",
    "size": 5678,
    "content": "// Contenu du fichier\nconsole.log('Hello');",
    "url": "https://github.com/owner/repo/blob/main/src/index.js",
    "sha": "abc123..."
  }
}
```

**Codes d'erreur :**
- `400` : Token GitHub manquant ou chemin manquant
- `404` : Fichier introuvable

---

### `GET /api/repos/:owner/:repo/branches`

Liste toutes les branches du repo.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>
```

**Paramètres de chemin :**
- `owner` (string, requis) : Propriétaire du repo
- `repo` (string, requis) : Nom du repo

**Réponse :**
```json
{
  "branches": [
    {
      "name": "main",
      "commit": "abc1234",
      "protected": true
    },
    {
      "name": "develop",
      "commit": "def5678",
      "protected": false
    }
  ]
}
```

---

### `GET /api/repos/:owner/:repo/commits`

Récupère les commits récents d'une branche.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>
```

**Paramètres de chemin :**
- `owner` (string, requis) : Propriétaire du repo
- `repo` (string, requis) : Nom du repo

**Paramètres de requête :**
- `branch` (string, optionnel) : Nom de la branche (défaut: main)
- `limit` (number, optionnel) : Nombre de commits (défaut: 10, max: 100)

**Réponse :**
```json
{
  "commits": [
    {
      "sha": "abc1234",
      "fullSha": "abc1234567890abcdef",
      "message": "feat: Ajoute une nouvelle fonctionnalité",
      "author": "John Doe",
      "date": "2026-03-26T20:00:00.000Z",
      "url": "https://github.com/owner/repo/commit/abc1234567890abcdef"
    }
  ]
}
```

---

## 🤖 Analysis Routes

### `POST /api/analyze/:owner/:repo`

Analyse un repo avec l'IA (optionnel).

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
X-GitHub-Token: <github_token>
```

**Paramètres de chemin :**
- `owner` (string, requis) : Propriétaire du repo
- `repo` (string, requis) : Nom du repo

**Body (optionnel) :**
```json
{
  "aiProvider": "openai",
  "aiModel": "gpt-4",
  "aiApiKey": "sk-...",
  "aiBaseUrl": "http://localhost:11434"
}
```

**Réponse :**
```json
{
  "analysis": {
    "repo": {
      "name": "repo",
      "fullName": "owner/repo",
      "description": "Description",
      "language": "JavaScript",
      "stars": 100,
      "forks": 20,
      "defaultBranch": "main"
    },
    "stack": {
      "type": "node",
      "framework": "React",
      "version": "20",
      "hasTypeScript": true,
      "hasTests": true,
      "packageManager": "npm"
    },
    "quality": {
      "score": 85,
      "issues": [],
      "suggestions": ["Ajoutez des tests unitaires"],
      "hasReadme": true,
      "hasTests": true,
      "hasCI": false,
      "hasDocs": false
    },
    "security": {
      "score": 100,
      "vulnerabilities": [],
      "recommendations": [],
      "hasSecurityConfig": false
    },
    "performance": {
      "score": 90,
      "suggestions": ["Envisagez d'implémenter un cache"],
      "hasCache": false,
      "hasMonitoring": false
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "Qualité",
        "title": "Ajouter des tests",
        "description": "Les tests sont essentiels pour la fiabilité du code."
      }
    ],
    "files": [
      {
        "name": "package.json",
        "type": "file",
        "path": "package.json"
      }
    ],
    "ai": {
      "summary": "Ce projet est une application React...",
      "strengths": ["Code bien structuré", "Bonne documentation"],
      "weaknesses": ["Manque de tests", "Pas de CI/CD"],
      "recommendations": ["Ajouter Jest pour les tests", "Configurer GitHub Actions"],
      "architecture": {
        "score": 8,
        "comment": "Architecture modulaire et claire"
      },
      "maintainability": {
        "score": 7,
        "comment": "Code lisible mais manque de tests"
      }
    }
  }
}
```

**Codes d'erreur :**
- `400` : Token GitHub manquant
- `500` : Erreur lors de l'analyse

---

### `GET /api/analyze/providers`

Liste tous les providers IA disponibles.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
```

**Réponse :**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "baseUrl": "https://api.openai.com/v1",
      "defaultModel": "gpt-4"
    },
    {
      "id": "anthropic",
      "name": "Anthropic",
      "baseUrl": "https://api.anthropic.com/v1",
      "defaultModel": "claude-3-sonnet-20240229"
    },
    {
      "id": "ollama",
      "name": "Ollama",
      "baseUrl": "http://localhost:11434",
      "defaultModel": "llama2"
    },
    {
      "id": "openai_compatible",
      "name": "OpenAI Compatible",
      "baseUrl": "http://localhost:8080/v1",
      "defaultModel": "default"
    }
  ]
}
```

---

### `GET /api/analyze/providers/:provider/models`

Liste les modèles disponibles pour un provider spécifique.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
```

**Paramètres de chemin :**
- `provider` (string, requis) : ID du provider (openai, anthropic, ollama, openai_compatible)

**Paramètres de requête :**
- `baseUrl` (string, optionnel) : URL de l'API (pour Ollama ou API compatible)

**Réponse :**
```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "description": "Modèle le plus avancé"
    },
    {
      "id": "gpt-4-turbo",
      "name": "GPT-4 Turbo",
      "description": "GPT-4 plus rapide"
    }
  ]
}
```

**Pour Ollama :**
```json
{
  "models": [
    {
      "id": "codellama:latest",
      "name": "codellama:latest",
      "description": "Taille: 3.8 GB",
      "size": 3825910662,
      "modified": "2026-03-25T12:20:19.109916199Z"
    }
  ]
}
```

---

### `GET /api/analyze/providers/models/all`

Liste tous les providers avec leurs modèles.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
```

**Paramètres de requête :**
- `baseUrl` (string, optionnel) : URL de l'API Ollama

**Réponse :**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "models": [
        {
          "id": "gpt-4",
          "name": "GPT-4",
          "description": "Modèle le plus avancé"
        }
      ]
    },
    {
      "id": "ollama",
      "name": "Ollama",
      "models": [
        {
          "id": "codellama:latest",
          "name": "codellama:latest",
          "description": "Taille: 3.8 GB"
        }
      ]
    }
  ]
}
```

---

### `POST /api/analyze/providers/test`

Teste la connexion à un provider IA.

**Headers requis :**
```http
Authorization: Bearer <jwt_token>
```

**Body :**
```json
{
  "provider": "ollama",
  "apiKey": "",
  "baseUrl": "http://192.168.1.57:11434",
  "model": "codellama:latest"
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "provider": "ollama",
  "response": "Bonjour"
}
```

**Réponse (échec) :**
```json
{
  "success": false,
  "provider": "ollama",
  "error": "Impossible de se connecter à Ollama (http://localhost:11434/api/chat). Vérifiez que le service est accessible."
}
```

---

## 🏥 Health

### `GET /health`

Vérifie que le serveur fonctionne.

**Headers requis :** Aucun

**Réponse :**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-03-26T20:00:00.000Z"
}
```

---

## ❌ Erreurs

### Format des erreurs

```json
{
  "error": "Message d'erreur",
  "code": "ERROR_CODE"
}
```

### Codes d'erreur courants

| Code | HTTP | Description |
|------|------|-------------|
| `TOKEN_MISSING` | 401 | Token JWT manquant |
| `TOKEN_INVALID` | 401 | Token JWT invalide ou expiré |
| `GITHUB_TOKEN_MISSING` | 400 | Token GitHub manquant |
| `NOT_FOUND` | 404 | Ressource introuvable |
| `FORBIDDEN` | 403 | Accès refusé |
| `VALIDATION_ERROR` | 400 | Paramètres invalides |
| `INTERNAL_ERROR` | 500 | Erreur interne du serveur |

---

## ⏱️ Rate Limiting

### Limites

- **100 requêtes** par fenêtre de 15 minutes
- **20 requêtes** par fenêtre de 15 minutes pour `/api/auth`

### Headers de réponse

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### En cas de dépassement

```json
{
  "error": "Trop de requêtes, réessaie dans 15 minutes."
}
```

**HTTP Status :** `429 Too Many Requests`

---

## 🔧 Exemples d'utilisation

### JavaScript (fetch)

```javascript
// Récupérer les repos
const response = await fetch('/api/repos?page=1&per_page=30', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Token': githubToken
  }
});
const { repos } = await response.json();

// Analyser un repo
const analysis = await fetch('/api/analyze/owner/repo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Token': githubToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    aiProvider: 'ollama',
    aiModel: 'codellama:latest',
    aiBaseUrl: 'http://192.168.1.57:11434'
  })
});
```

### cURL

```bash
# Lister les repos
curl -H "Authorization: Bearer <token>" \
     -H "X-GitHub-Token: <github_token>" \
     http://localhost:3001/api/repos

# Analyser un repo
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "X-GitHub-Token: <github_token>" \
     -H "Content-Type: application/json" \
     -d '{"aiProvider":"ollama","aiModel":"codellama:latest"}' \
     http://localhost:3001/api/analyze/owner/repo
```

---

## 📝 Notes

- Toutes les dates sont au format ISO 8601
- Les tokens JWT expirent après 30 jours
- Les tokens GitHub sont stockés de manière sécurisée
- L'analyse IA est optionnelle mais recommandée
- Les modèles Ollama sont récupérés dynamiquement

---

**Documentation API GitBrowser v1.0.0**