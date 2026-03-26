// =============================================
// GitBrowser - AI Analyzer Service
// Analyse les repos avec l'IA
// =============================================

const { Octokit } = require('@octokit/rest');
const { sendAIRequest } = require('./aiProviders');

/**
 * Analyse un repo avec l'IA
 */
async function analyzeRepository(token, owner, repo) {
  const octokit = new Octokit({ auth: token });

  try {
    // Récupère les infos du repo
    const { data: repoData } = await octokit.repos.get({ owner, repo });

    // Liste les fichiers à la racine
    const { data: rootContents } = await octokit.repos.getContent({
      owner, repo, path: '',
    });

    const files = rootContents.map(f => ({ name: f.name, type: f.type, path: f.path }));

    // Récupère les fichiers clés
    let packageJson = null;
    let requirements = null;
    let goMod = null;
    let readme = null;

    const tryGetFile = async (path) => {
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path });
        return Buffer.from(data.content, 'base64').toString('utf-8');
      } catch { return null; }
    };

    if (files.find(f => f.name === 'package.json')) {
      const raw = await tryGetFile('package.json');
      try { packageJson = JSON.parse(raw); } catch {}
    }
    if (files.find(f => f.name === 'requirements.txt')) {
      requirements = await tryGetFile('requirements.txt');
    }
    if (files.find(f => f.name === 'go.mod')) {
      goMod = await tryGetFile('go.mod');
    }
    if (files.find(f => f.name.toLowerCase() === 'readme.md')) {
      readme = await tryGetFile(files.find(f => f.name.toLowerCase() === 'readme.md').path);
    }

    // Analyse le stack
    const stackInfo = detectStack(files, packageJson, requirements, goMod);

    // Analyse la qualité du code
    const qualityAnalysis = analyzeCodeQuality(files, packageJson, readme);

    // Analyse la sécurité
    const securityAnalysis = analyzeSecurity(files, packageJson, requirements);

    // Analyse les performances
    const performanceAnalysis = analyzePerformance(files, packageJson, stackInfo);

    // Génère les recommandations
    const recommendations = generateRecommendations(stackInfo, qualityAnalysis, securityAnalysis, performanceAnalysis);

    return {
      repo: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        defaultBranch: repoData.default_branch,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
      },
      stack: stackInfo,
      quality: qualityAnalysis,
      security: securityAnalysis,
      performance: performanceAnalysis,
      recommendations,
      files: files.slice(0, 50), // Limite à 50 fichiers
    };
  } catch (err) {
    throw new Error(`Erreur lors de l'analyse: ${err.message}`);
  }
}

/**
 * Détecte le stack technique
 */
function detectStack(files, packageJson, requirements, goMod) {
  const fileNames = files.map(f => f.name.toLowerCase());
  const hasFile = (name) => fileNames.includes(name.toLowerCase());

  // Node.js
  if (hasFile('package.json') || hasFile('.nvmrc')) {
    const deps = packageJson?.dependencies || {};
    const devDeps = packageJson?.devDependencies || {};
    const allDeps = { ...deps, ...devDeps };

    let framework = 'Node.js';
    if (allDeps['next']) framework = 'Next.js';
    else if (allDeps['nuxt']) framework = 'Nuxt.js';
    else if (allDeps['express']) framework = 'Express';
    else if (allDeps['fastify']) framework = 'Fastify';
    else if (allDeps['react']) framework = 'React';
    else if (allDeps['vue']) framework = 'Vue.js';
    else if (allDeps['svelte']) framework = 'Svelte';

    return {
      type: 'node',
      framework,
      version: packageJson?.engines?.node || '20',
      hasTypeScript: hasFile('tsconfig.json'),
      hasTests: hasFile('jest.config.js') || hasFile('vitest.config.js') || hasFile('.mocharc.js'),
      packageManager: hasFile('pnpm-lock.yaml') ? 'pnpm' : hasFile('yarn.lock') ? 'yarn' : 'npm',
    };
  }

  // Python
  if (hasFile('requirements.txt') || hasFile('pyproject.toml') || hasFile('Pipfile')) {
    let framework = 'Python';
    const reqContent = requirements || '';
    if (reqContent.includes('fastapi')) framework = 'FastAPI';
    else if (reqContent.includes('flask')) framework = 'Flask';
    else if (reqContent.includes('django')) framework = 'Django';

    return {
      type: 'python',
      framework,
      version: '3.11',
      hasTests: hasFile('pytest.ini') || hasFile('setup.cfg'),
      packageManager: hasFile('poetry.lock') ? 'poetry' : hasFile('Pipfile') ? 'pipenv' : 'pip',
    };
  }

  // Go
  if (hasFile('go.mod')) {
    let framework = 'Go';
    if (goMod?.includes('gin-gonic/gin')) framework = 'Gin';
    else if (goMod?.includes('labstack/echo')) framework = 'Echo';
    else if (goMod?.includes('gofiber/fiber')) framework = 'Fiber';

    return {
      type: 'go',
      framework,
      version: '1.21',
      hasTests: files.some(f => f.name.endsWith('_test.go')),
    };
  }

  // PHP
  if (hasFile('composer.json')) {
    return {
      type: 'php',
      framework: 'PHP',
      version: '8.2',
      hasTests: hasFile('phpunit.xml'),
    };
  }

  // Rust
  if (hasFile('Cargo.toml')) {
    return {
      type: 'rust',
      framework: 'Rust',
      version: 'latest',
      hasTests: true,
    };
  }

  // Java
  if (hasFile('pom.xml') || hasFile('build.gradle')) {
    return {
      type: 'java',
      framework: 'Java',
      version: '21',
      hasTests: true,
      packageManager: hasFile('pom.xml') ? 'maven' : 'gradle',
    };
  }

  // Static
  if (hasFile('index.html')) {
    return {
      type: 'static',
      framework: 'HTML/CSS/JS',
      version: null,
      hasTests: false,
    };
  }

  return {
    type: 'unknown',
    framework: 'Unknown',
    version: null,
    hasTests: false,
  };
}

/**
 * Analyse la qualité du code
 */
function analyzeCodeQuality(files, packageJson, readme) {
  let score = 100;
  const issues = [];
  const suggestions = [];

  // Vérifie la présence de README
  if (!readme) {
    score -= 15;
    issues.push('Pas de README.md');
    suggestions.push('Ajoutez un README.md pour documenter votre projet');
  }

  // Vérifie la présence de .gitignore
  if (!files.find(f => f.name === '.gitignore')) {
    score -= 10;
    issues.push('Pas de .gitignore');
    suggestions.push('Ajoutez un .gitignore pour éviter de committer des fichiers inutiles');
  }

  // Vérifie la présence de tests
  const hasTests = files.some(f => 
    f.name.includes('.test.') || 
    f.name.includes('.spec.') || 
    f.name.includes('_test.') ||
    f.name === 'jest.config.js' ||
    f.name === 'vitest.config.js'
  );
  if (!hasTests) {
    score -= 20;
    issues.push('Pas de tests détectés');
    suggestions.push('Ajoutez des tests unitaires pour améliorer la fiabilité');
  }

  // Vérifie la présence de CI/CD
  const hasCI = files.some(f => 
    f.path.includes('.github/workflows') || 
    f.path.includes('.gitlab-ci.yml') ||
    f.name === 'Jenkinsfile'
  );
  if (!hasCI) {
    score -= 10;
    issues.push('Pas de CI/CD détecté');
    suggestions.push('Configurez un pipeline CI/CD pour automatiser les tests et déploiements');
  }

  // Vérifie la présence de documentation
  const hasDocs = files.some(f => 
    f.name.toLowerCase().includes('doc') || 
    f.path.includes('/docs')
  );
  if (!hasDocs && !readme) {
    score -= 5;
    issues.push('Documentation limitée');
    suggestions.push('Ajoutez de la documentation pour faciliter la maintenance');
  }

  // Vérifie la taille du projet
  if (files.length > 100) {
    suggestions.push('Le projet contient beaucoup de fichiers, envisagez de le modulariser');
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    hasReadme: !!readme,
    hasTests,
    hasCI,
    hasDocs,
  };
}

/**
 * Analyse la sécurité
 */
function analyzeSecurity(files, packageJson, requirements) {
  const vulnerabilities = [];
  const recommendations = [];

  // Vérifie les dépendances Node.js
  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Vérifie les packages connus pour avoir des vulnérabilités
    const riskyPackages = ['lodash', 'moment', 'request', 'axios'];
    riskyPackages.forEach(pkg => {
      if (deps[pkg]) {
        vulnerabilities.push({
          severity: 'medium',
          package: pkg,
          message: `Le package ${pkg} peut avoir des vulnérabilités connues`,
        });
        recommendations.push(`Mettez à jour ou remplacez ${pkg} par une alternative plus sûre`);
      }
    });

    // Vérifie si les dépendances sont à jour
    if (!packageJson.engines) {
      recommendations.push('Spécifiez les versions de Node.js requises dans "engines"');
    }
  }

  // Vérifie les fichiers sensibles
  const sensitiveFiles = ['.env', '.env.local', 'secrets.json', 'credentials.json'];
  sensitiveFiles.forEach(file => {
    if (files.find(f => f.name === file)) {
      vulnerabilities.push({
        severity: 'high',
        file,
        message: `Le fichier ${file} ne devrait pas être commité`,
      });
      recommendations.push(`Ajoutez ${file} à votre .gitignore`);
    }
  });

  // Vérifie la présence de fichiers de sécurité
  const hasSecurityConfig = files.some(f => 
    f.name === 'security.md' || 
    f.name === 'SECURITY.md' ||
    f.path.includes('.github/SECURITY')
  );
  if (!hasSecurityConfig) {
    recommendations.push('Ajoutez un fichier SECURITY.md pour documenter vos pratiques de sécurité');
  }

  return {
    score: vulnerabilities.length === 0 ? 100 : Math.max(0, 100 - vulnerabilities.length * 15),
    vulnerabilities,
    recommendations,
    hasSecurityConfig,
  };
}

/**
 * Analyse les performances
 */
function analyzePerformance(files, packageJson, stackInfo) {
  const suggestions = [];

  // Vérifie la présence de build optimization
  if (stackInfo.type === 'node') {
    const scripts = packageJson?.scripts || {};
    
    if (!scripts.build) {
      suggestions.push('Ajoutez un script de build pour optimiser la production');
    }

    if (!scripts['build:analyze']) {
      suggestions.push('Utilisez un analyseur de bundle pour identifier les dépendances lourdes');
    }

    // Vérifie les dépendances lourdes
    const deps = packageJson?.dependencies || {};
    const heavyPackages = ['moment', 'lodash', 'jquery'];
    heavyPackages.forEach(pkg => {
      if (deps[pkg]) {
        suggestions.push(`Le package ${pkg} est volumineux, envisagez des alternatives plus légères`);
      }
    });
  }

  // Vérifie la présence de cache
  const hasCacheConfig = files.some(f => 
    f.name.includes('cache') || 
    f.name.includes('redis') ||
    f.path.includes('cache')
  );
  if (!hasCacheConfig) {
    suggestions.push('Envisagez d\'implémenter un système de cache pour améliorer les performances');
  }

  // Vérifie la présence de monitoring
  const hasMonitoring = files.some(f => 
    f.name.includes('monitoring') || 
    f.name.includes('logging') ||
    f.name.includes('metrics')
  );
  if (!hasMonitoring) {
    suggestions.push('Ajoutez du monitoring et du logging pour surveiller les performances');
  }

  return {
    score: suggestions.length === 0 ? 100 : Math.max(0, 100 - suggestions.length * 10),
    suggestions,
    hasCache: hasCacheConfig,
    hasMonitoring,
  };
}

/**
 * Génère des recommandations
 */
function generateRecommendations(stackInfo, quality, security, performance) {
  const recommendations = [];

  // Recommandations basées sur le score qualité
  if (quality.score < 70) {
    recommendations.push({
      priority: 'high',
      category: 'Qualité',
      title: 'Améliorer la qualité du code',
      description: 'Le score de qualité est bas. Concentrez-vous sur les tests et la documentation.',
    });
  }

  // Recommandations basées sur la sécurité
  if (security.score < 80) {
    recommendations.push({
      priority: 'high',
      category: 'Sécurité',
      title: 'Renforcer la sécurité',
      description: 'Corrigez les vulnérabilités détectées et suivez les bonnes pratiques de sécurité.',
    });
  }

  // Recommandations basées sur les performances
  if (performance.score < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'Performance',
      title: 'Optimiser les performances',
      description: 'Implémentez du caching et du monitoring pour améliorer les performances.',
    });
  }

  // Recommandations spécifiques au stack
  if (stackInfo.type === 'node' && !stackInfo.hasTypeScript) {
    recommendations.push({
      priority: 'low',
      category: 'Stack',
      title: 'Envisager TypeScript',
      description: 'TypeScript améliore la maintenabilité et réduit les bugs.',
    });
  }

  if (!stackInfo.hasTests) {
    recommendations.push({
      priority: 'high',
      category: 'Qualité',
      title: 'Ajouter des tests',
      description: 'Les tests sont essentiels pour la fiabilité du code.',
    });
  }

  return recommendations;
}

/**
 * Analyse avancée avec IA (optionnel)
 */
async function analyzeWithAI(token, owner, repo, aiProvider = null, aiOptions = {}) {
  if (!aiProvider) {
    return null; // Pas d'IA configurée
  }

  try {
    const octokit = new Octokit({ auth: token });

    // Récupère les fichiers principaux
    const { data: rootContents } = await octokit.repos.getContent({
      owner, repo, path: '',
    });

    const files = rootContents.map(f => ({ name: f.name, type: f.type, path: f.path }));

    // Récupère le contenu des fichiers importants
    let codeContext = '';
    const importantFiles = ['package.json', 'README.md', 'index.js', 'app.js', 'main.js', 'server.js'];

    for (const fileName of importantFiles) {
      const file = files.find(f => f.name === fileName);
      if (file) {
        try {
          const { data } = await octokit.repos.getContent({ owner, repo, path: file.path });
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          codeContext += `\n\n=== ${fileName} ===\n${content.slice(0, 1000)}`;
        } catch {}
      }
    }

    // Prompt pour l'IA
    const prompt = `Analyse ce projet GitHub et fournis des recommandations détaillées.

Nom: ${owner}/${repo}
Fichiers: ${files.map(f => f.name).join(', ')}

Contenu des fichiers principaux:
${codeContext}

Fournis une analyse JSON avec:
1. "summary": résumé du projet en 2-3 phrases
2. "strengths": liste des points forts (3-5 éléments)
3. "weaknesses": liste des points faibles (3-5 éléments)
4. "recommendations": liste de recommandations spécifiques (5-7 éléments)
5. "architecture": évaluation de l'architecture (score 1-10 et commentaire)
6. "maintainability": évaluation de la maintenabilité (score 1-10 et commentaire)

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const response = await sendAIRequest(aiProvider, prompt, aiOptions);

    // Parse la réponse JSON
    try {
      const aiAnalysis = JSON.parse(response);
      return aiAnalysis;
    } catch {
      // Si le parsing échoue, retourne la réponse brute
      return { rawResponse: response };
    }
  } catch (err) {
    console.error('Erreur analyse IA:', err.message);
    return { error: err.message };
  }
}

module.exports = { analyzeRepository, analyzeWithAI };
