# 🔧 Guide de Dépannage - GitBrowser

Ce guide vous aide à résoudre les problèmes courants rencontrés avec GitBrowser.

---

## 📋 Table des matières

- [Problèmes de connexion](#-problèmes-de-connexion)
- [Problèmes d'authentification](#-problèmes-dauthentification)
- [Problèmes d'analyse IA](#-problèmes-danalyse-ia)
- [Problèmes Docker](#-problèmes-docker)
- [Erreurs courantes](#-erreurs-courantes)
- [Questions fréquentes](#-questions-fréquentes)

---

## 🔌 Problèmes de connexion

### Le frontend ne se connecte pas au backend

**Symptômes :**
- Page blanche ou erreur de chargement
- "Failed to fetch" dans la console
- Erreur réseau

**Solutions :**

1. **Vérifiez que les conteneurs sont en cours d'exécution :**
```bash
docker compose ps
```

2. **Vérifiez les logs du frontend :**
```bash
docker compose logs frontend
```

3. **Redémarrez les conteneurs :**
```bash
docker compose down
docker compose up -d
```

---

### Le backend ne démarre pas

**Symptômes :**
- Erreur "Connection refused"
- Le conteneur backend redémarre en boucle

**Solutions :**

1. **Vérifiez les logs du backend :**
```bash
docker compose logs backend
```

2. **Vérifiez les variables d'environnement :**
```bash
cat .env | grep -E "^(GITHUB|JWT)"
```

3. **Vérifiez que le port n'est pas utilisé :**
```bash
lsof -i :3001
```

---

## 🔐 Problèmes d'authentification

### Erreur "Token GitHub manquant"

**Symptômes :**
- Impossible de voir les repos
- Erreur 400 lors de l'accès aux repos

**Solutions :**

1. **Déconnectez-vous et reconnectez-vous**
2. **Vérifiez les permissions GitHub**
3. **Vérifiez les logs d'authentification :**
```bash
docker compose logs backend | grep -i auth
```

---

### GitHub OAuth ne fonctionne pas

**Symptômes :**
- Erreur "redirect_uri_mismatch"
- Page d'erreur GitHub

**Solutions :**

1. **Vérifiez l'URL de callback dans GitHub**
2. **Vérifiez les variables d'environnement :**
```bash
echo $GITHUB_CLIENT_ID
echo $GITHUB_CALLBACK_URL
```

---

## 🤖 Problèmes d'analyse IA

### Les scores sont toujours identiques

**Solutions :**

1. **Configurez un provider IA** via le modal de configuration
2. **Vérifiez que l'IA est configurée** dans les logs

---

### Ollama ne se connecte pas

**Solutions :**

1. **Vérifiez qu'Ollama est en cours d'exécution**
2. **Configurez Ollama pour accepter les connexions réseau**
3. **Vérifiez le pare-feu**

---

## 🐳 Problèmes Docker

### Les conteneurs ne démarrent pas

**Solutions :**

1. **Vérifiez l'espace disque et la mémoire**
2. **Nettoyez Docker :**
```bash
docker system prune -a
```

3. **Reconstruisez les images :**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## ❌ Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| 401 | Token invalide | Reconnectez-vous |
| 403 | Permissions insuffisantes | Vérifiez les permissions GitHub |
| 404 | Route introuvable | Vérifiez l'URL |
| 429 | Trop de requêtes | Attendez 15 minutes |
| 500 | Erreur interne | Consultez les logs |

---

## ❓ Questions fréquentes

### Comment obtenir une clé API OpenAI ?

1. Allez sur https://platform.openai.com/api-keys
2. Cliquez sur "Create new secret key"
3. Copiez la clé

---

### Comment installer Ollama ?

**Windows :**
```powershell
winget install Ollama.Ollama
```

**Linux :**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

### Comment mettre à jour GitBrowser ?

```bash
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 🆘 Besoin d'aide ?

1. Consultez les logs : `docker compose logs -f`
2. Ouvrez une issue sur GitHub

---

**Guide de dépannage GitBrowser v1.0.0**