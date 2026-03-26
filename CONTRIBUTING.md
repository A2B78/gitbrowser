# 🤝 Contribuer à GitBrowser

Merci de ton intérêt pour GitBrowser ! Ce guide t'aidera à contribuer au projet.

---

## 📋 Table des matières

- [Code de conduite](#-code-de-conduite)
- [Comment contribuer](#-comment-contribuer)
- [Développement](#-développement)
- [Standards de code](#-standards-de-code)
- [Pull Requests](#-pull-requests)
- [Issues](#-issues)
- [Questions](#-questions)

---

## 📜 Code de conduite

En participant à ce projet, tu t'engages à respecter notre Code de conduite :

- ✅ Être respectueux envers les autres contributeurs
- ✅ Accepter les critiques constructives
- ✅ Se concentrer sur ce qui est meilleur pour la communauté
- ✅ Montrer de l'empathie envers les autres membres

---

## 🎯 Comment contribuer

### Types de contributions

1. **🐛 Signaler des bugs** : Ouvre une issue décrivant le problème
2. **💡 Proposer des fonctionnalités** : Suggère de nouvelles idées
3. **🔧 Soumettre des corrections** : Envoie des Pull Requests
4. **📖 Améliorer la documentation** : Aide à documenter le projet
5. **🎨 Améliorer le design** : Propose des améliorations UI/UX

### Avant de commencer

1. Vérifie qu'une issue existe déjà pour ton sujet
2. Si non, crée une nouvelle issue pour discuter du changement
3. Attends le feedback avant de commencer à coder

---

## 💻 Développement

### Configuration de l'environnement

**1. Clone le repository**
```bash
git clone https://github.com/ton-user/gitbrowser.git
cd gitbrowser
```

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure .env avec tes valeurs
npm run dev
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

**4. Docker (alternative)**
```bash
cp .env.example .env
docker-compose up -d
```

### Structure du projet

```
gitbrowser/
├── backend/
│   ├── src/
│   │   ├── server.js          # Point d'entrée
│   │   ├── middleware/        # Middleware Express
│   │   ├── routes/           # Routes API
│   │   └── services/         # Logique métier
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Composant principal
│   │   ├── lib/              # Utilitaires
│   │   └── pages/            # Pages React
│   └── package.json
└── docker-compose.yml
```

---

## 📏 Standards de code

### JavaScript/React

- **ES6+** : Utilise les fonctionnalités modernes de JavaScript
- **Fonctions fléchées** : `const fn = () => {}` au lieu de `function fn() {}`
- **Destructuring** : `const { name } = obj` au lieu de `const name = obj.name`
- **Template literals** : `` `Hello ${name}` `` au lieu de `'Hello ' + name`
- **Async/Await** : Au lieu de Promises avec `.then()`

### Formatage

- **Indentation** : 2 espaces
- **Guillemets** : Simples `'` pour les strings
- **Points-virgules** : Optionnels (style moderne)
- **Longueur des lignes** : Max 100 caractères

### Nommage

- **Variables** : `camelCase` → `const userName = 'John'`
- **Composants** : `PascalCase` → `function UserProfile() {}`
- **Fichiers** : `kebab-case` → `user-profile.jsx`
- **Constantes** : `UPPER_SNAKE_CASE` → `const API_URL = '...'`

### Commentaires

```javascript
// Bon : Explique le POURQUOI
// Récupère le token GitHub pour l'analyse IA
const token = await getGitHubToken();

// Mauvais : Explique le QUOI (évident)
// Récupère le token
const token = await getGitHubToken();
```

---

## 🔀 Pull Requests

### Processus

1. **Crée une branche**
```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

2. **Fais tes changements**
```bash
git add .
git commit -m "feat: Ajoute ma nouvelle fonctionnalité"
```

3. **Push vers GitHub**
```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

4. **Ouvre une Pull Request**
- Va sur GitHub
- Clique sur "Compare & pull request"
- Remplis le template de PR

### Template de Pull Request

```markdown
## Description
Décris brièvement ce que fait cette PR.

## Type de changement
- [ ] 🐛 Bug fix (correction qui ne casse pas l'API existante)
- [ ] ✨ Nouvelle fonctionnalité (ajout qui ne casse pas l'API existante)
- [ ] 💥 Breaking