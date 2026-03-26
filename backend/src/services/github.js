// =============================================
// GitBrowser - GitHub Service
// =============================================

const { Octokit } = require('@octokit/rest');

/**
 * Crée un client Octokit avec le token de l'utilisateur
 */
function createGitHubClient(token) {
  return new Octokit({ auth: token });
}

/**
 * Liste les repos accessibles avec le token
 */
async function listUserRepositories(token, page = 1, perPage = 30) {
  const octokit = createGitHubClient(token);

  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: perPage,
    page,
    type: 'all',
  });

  return data.map(r => ({
    id: r.id,
    fullName: r.full_name,
    name: r.name,
    owner: r.owner.login,
    private: r.private,
    language: r.language,
    defaultBranch: r.default_branch,
    updatedAt: r.updated_at,
    url: r.html_url,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
  }));
}

/**
 * Récupère les détails d'un repo
 */
async function getRepository(token, owner, repo) {
  const octokit = createGitHubClient(token);

  const { data } = await octokit.repos.get({ owner, repo });

  return {
    id: data.id,
    fullName: data.full_name,
    name: data.name,
    owner: data.owner.login,
    private: data.private,
    language: data.language,
    defaultBranch: data.default_branch,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    url: data.html_url,
  };
}

/**
 * Liste les fichiers d'un repo
 */
async function listRepositoryContents(token, owner, repo, path = '') {
  const octokit = createGitHubClient(token);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      return data.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type, // 'file' ou 'dir'
        size: item.size,
        url: item.html_url,
        downloadUrl: item.download_url,
      }));
    }

    // Si c'est un fichier unique
    return [{
      name: data.name,
      path: data.path,
      type: data.type,
      size: data.size,
      url: data.html_url,
      downloadUrl: data.download_url,
      content: data.content ? Buffer.from(data.content, 'base64').toString('utf-8') : null,
    }];
  } catch (err) {
    if (err.status === 404) {
      return [];
    }
    throw err;
  }
}

/**
 * Récupère le contenu d'un fichier
 */
async function getFileContent(token, owner, repo, filePath) {
  const octokit = createGitHubClient(token);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    if (data.type !== 'file') {
      throw new Error('Le chemin ne pointe pas vers un fichier.');
    }

    return {
      name: data.name,
      path: data.path,
      size: data.size,
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      url: data.html_url,
      sha: data.sha,
    };
  } catch (err) {
    if (err.status === 404) {
      throw new Error('Fichier introuvable.');
    }
    throw err;
  }
}

/**
 * Récupère les branches d'un repo
 */
async function listBranches(token, owner, repo) {
  const octokit = createGitHubClient(token);

  const { data } = await octokit.repos.listBranches({ owner, repo });

  return data.map(b => ({
    name: b.name,
    commit: b.commit.sha.slice(0, 7),
    protected: b.protected,
  }));
}

/**
 * Récupère les derniers commits d'un repo
 */
async function getRecentCommits(token, owner, repo, branch = 'main', limit = 10) {
  const octokit = createGitHubClient(token);

  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: limit,
    });

    return data.map(c => ({
      sha: c.sha.slice(0, 7),
      fullSha: c.sha,
      message: c.commit.message.split('\n')[0],
      author: c.commit.author.name,
      date: c.commit.author.date,
      url: c.html_url,
    }));
  } catch {
    return [];
  }
}

/**
 * Récupère les infos de l'utilisateur GitHub
 */
async function getGitHubUser(token) {
  const octokit = createGitHubClient(token);

  const { data } = await octokit.users.getAuthenticated();

  return {
    id: data.id,
    login: data.login,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following,
  };
}

module.exports = {
  createGitHubClient,
  listUserRepositories,
  getRepository,
  listRepositoryContents,
  getFileContent,
  listBranches,
  getRecentCommits,
  getGitHubUser,
};