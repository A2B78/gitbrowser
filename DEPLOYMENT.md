# 🚀 Guide de Déploiement - GitBrowser

Documentation complète pour déployer GitBrowser en production.

---

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Déploiement Docker](#-déploiement-docker)
- [Déploiement Manuel](#-déploiement-manuel)
- [Configuration HTTPS](#-configuration-https)
- [Variables d'environnement](#-variables-denvironnement)
- [Monitoring](#-monitoring)
- [Sauvegarde](#-sauvegarde)
- [Mise à jour](#-mise-à-jour)

---

## 📦 Prérequis

### Serveur

- **OS** : Ubuntu 22.04 LTS (recommandé) ou toute distribution Linux
- **RAM** : Minimum 2 GB (4 GB recommandé)
- **CPU** : 2 cœurs minimum
- **Stockage** : 20 GB minimum
- **Réseau** : Accès internet pour GitHub API

### Logiciels

- **Docker** : 24.0+
- **Docker Compose** : 2.20+
- **Git** : 2.30+
- **Node.js** : 20+ (si déploiement manuel)

### Comptes requis

- **GitHub** : Compte avec OAuth App configurée
- **Domaine** : (Optionnel) Nom de domaine pointant vers le serveur

---

## 🐳 Déploiement Docker

### Installation rapide

**1. Clone le repository**
```bash
git clone https://github.com/ton-user/gitbrowser.git
cd gitbrowser
```

**2. Configure l'environnement**
```bash
cp .env.example .env
nano .env
```

**3. Configure GitHub OAuth**
```bash
# Va sur https://github.com/settings/applications/new
# Crée une nouvelle OAuth App avec :
# - Homepage URL: https://ton-domaine.com
# - Callback URL: https://ton-domaine.com/api/auth/github/callback

# Copie Client ID et Client Secret dans .env
```

**4. Lance les services**
```bash
docker-compose up -d
```

**5. Vérifie le déploiement**
```bash
# Vérifie les conteneurs
docker-compose ps

# Vérifie les logs
docker-compose logs -f

# Teste l'API
curl http://localhost:3001/health
```

### Configuration Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: gitbrowser-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file: .env
    environment:
      - NODE_ENV=production
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - gitbrowser-net

  frontend:
    build: ./frontend
    container_name: gitbrowser-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - gitbrowser-net

networks:
  gitbrowser-net:
    driver: bridge
```

---

## 💻 Déploiement Manuel

### Backend

**1. Installation**
```bash
cd backend
npm install --production
```

**2. Configuration**
```bash
cp .env.example .env
nano .env
```

**3. Démarrage**
```bash
# Avec PM2 (recommandé pour la production)
npm install -g pm2
pm2 start src/server.js --name gitbrowser-backend
pm2 save
pm2 startup

# Ou directement
NODE_ENV=production node src/server.js
```

### Frontend

**1. Installation**
```bash
cd frontend
npm install
```

**2. Build**
```bash
npm run build
```

**3. Déploiement avec Nginx**
```bash
sudo cp -r dist/* /var/www/gitbrowser/
sudo systemctl reload nginx
```

### Configuration Nginx

```nginx
server {
    listen 80;
    server_name ton-domaine.com;
    
    # Frontend
    location / {
        root /var/www/gitbrowser;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
```

---

## 🔒 Configuration HTTPS

### Avec Let's Encrypt (Certbot)

**1. Installe Certbot**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

**2. Obtient le certificat**
```bash
sudo certbot --nginx -d ton-domaine.com
```

**3. Auto-renouvellement**
```bash
sudo crontab -e
# Ajoute cette ligne :
0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuration Nginx avec HTTPS

```nginx
server {
    listen 80;
    server_name ton-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ton-domaine.com;
    
    ssl_certificate /etc/letsencrypt/live/ton-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ton-domaine.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Frontend
    location / {
        root /var/www/gitbrowser;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚙️ Variables d'environnement

### Variables obligatoires

```bash
# Server
PORT=3001
NODE_ENV=production
BASE_URL=https://ton-domaine.com

# Frontend
FRONTEND_URL=https://ton-domaine.com

# JWT
JWT_SECRET=<génère-avec-openssl-rand-base64-64>

# GitHub OAuth
GITHUB_CLIENT_ID=<ton-client-id>
GITHUB_CLIENT_SECRET=<ton-client-secret>
GITHUB_CALLBACK_URL=https://ton-domaine.com/api/auth/github/callback
```

### Variables optionnelles (IA)

```bash
# OpenAI
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-4

# Anthropic
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-...
AI_MODEL=claude-3-sonnet-20240229

# Ollama
AI_PROVIDER=ollama
OLLAMA_URL=http://192.168.1.57:11434
AI_MODEL=codellama:latest
```

### Génération du JWT Secret

```bash
# Génère un secret sécurisé
openssl rand -base64 64

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## 📊 Monitoring

### Health Checks

```bash
# Vérifie l'API
curl http://localhost:3001/health

# Réponse attendue :
# {"status":"ok","version":"1.0.0","timestamp":"..."}
```

### Logs Docker

```bash
# Tous les logs
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# Dernières 100 lignes
docker-compose logs --tail=100 -f
```

### Monitoring avec PM2

```bash
# Status des processus
pm2 status

# Logs en temps réel
pm2 logs gitbrowser-backend

# Monitoring
pm2 monit

# Métriques
pm2 show gitbrowser-backend
```

### Scripts de monitoring

```bash
#!/bin/bash
# health-check.sh

# Vérifie le backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$BACKEND_STATUS" != "200" ]; then
    echo "❌ Backend down (HTTP $BACKEND_STATUS)"
    exit 1
fi

# Vérifie le frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
if [ "$FRONTEND_STATUS" != "200" ]; then
    echo "❌ Frontend down (HTTP $FRONTEND_STATUS)"
    exit 1
fi

echo "✅ Tous les services sont opérationnels"
```

---

## 💾 Sauvegarde

### Sauvegarde des données

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/gitbrowser"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarde la configuration
cp .env $BACKUP_DIR/env_$DATE

# Sauvegarde les logs Docker
docker-compose logs > $BACKUP_DIR/logs_$DATE.txt

# Sauvegarde les volumes Docker (si utilisés)
# docker run --rm -v gitbrowser_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/data_$DATE.tar.gz /data

echo "✅ Sauvegarde terminée: $BACKUP_DIR"
```

### Restauration

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

# Arrête les services
docker-compose down

# Restaure la configuration
cp $BACKUP_FILE .env

# Redémarre les services
docker-compose up -d

echo "✅ Restauration terminée"
```

---

## 🔄 Mise à jour

### Mise à jour Docker

```bash
# 1. Sauvegarde
./backup.sh

# 2. Récupère les dernières modifications
git pull origin main

# 3. Reconstruit les images
docker-compose down
docker-compose build --no-cache

# 4. Redémarre
docker-compose up -d

# 5. Vérifie
docker-compose ps
curl http://localhost:3001/health
```

### Mise à jour manuelle

```bash
# 1. Sauvegarde
./backup.sh

# 2. Récupère les modifications
git pull origin main

# 3. Backend
cd backend
npm install --production
pm2 restart gitbrowser-backend

# 4. Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/gitbrowser/

# 5. Vérifie
curl http://localhost:3001/health
```

### Rollback

```bash
# 1. Arrête les services
docker-compose down

# 2. Checkout la version précédente
git checkout <previous-commit-hash>

# 3. Restaure la sauvegarde
./restore.sh /backup/gitbrowser/env_<date>

# 4. Redémarre
docker-compose up -d
```

---

## 🔧 Optimisations Production

### Nginx

```nginx
# Compression gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Cache statique
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Sécurité
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### Docker

```yaml
# Limites de ressources
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Node.js

```bash
# Variables d'environnement pour la production
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=512"
```

---

## 🐛 Dépannage

### Problèmes courants

**1. Port déjà utilisé**
```bash
# Trouve le processus
lsof -i :3001
# ou
netstat -tulpn | grep 3001

# Tue le processus
kill -9 <PID>
```

**2. Permission denied**
```bash
# Ajoute l'utilisateur au groupe docker
sudo usermod -aG docker $USER
# Déconnecte et reconnecte-toi
```

**3. Out of memory**
```bash
# Vérifie la mémoire
free -h
# Augmente la swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**4. GitHub API rate limit**
```bash
# Vérifie les limites
curl -H "Authorization: token <token>" https://api.github.com/rate_limit
```

---

## 📞 Support

Pour les problèmes de déploiement :
- Consulte les logs : `docker-compose logs -f`
- Vérifie la santé : `curl http://localhost:3001/health`
- Ouvre une issue sur GitHub

---

**Guide de déploiement GitBrowser v1.0.0**