// =============================================
// GitBrowser - API Client
// =============================================

const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('gitbrowser_token');
}

function setToken(token) {
  localStorage.setItem('gitbrowser_token', token);
}

function clearToken() {
  localStorage.removeItem('gitbrowser_token');
}

function getGitHubToken() {
  return localStorage.getItem('gitbrowser_github_token');
}

function setGitHubToken(token) {
  localStorage.setItem('gitbrowser_github_token', token);
}

function clearGitHubToken() {
  localStorage.removeItem('gitbrowser_github_token');
}

async function request(method, path, data = null) {
  const token = getToken();
  const githubToken = getGitHubToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (githubToken) headers['X-GitHub-Token'] = githubToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    clearGitHubToken();
    window.location.href = '/login';
    return;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: json.error || 'Erreur serveur', ...json };
  return json;
}

const api = {
  // Auth
  auth: {
    me: () => request('GET', '/auth/me'),
    githubUrl: () => `${BASE_URL}/auth/github`,
    logout: () => request('POST', '/auth/logout'),
  },

  // Repos
  repos: {
    list: (page = 1, perPage = 30) => request('GET', `/repos?page=${page}&per_page=${perPage}`),
    get: (owner, repo) => request('GET', `/repos/${owner}/${repo}`),
    contents: (owner, repo, path = '') => request('GET', `/repos/${owner}/${repo}/contents?path=${encodeURIComponent(path)}`),
    file: (owner, repo, path) => request('GET', `/repos/${owner}/${repo}/file?path=${encodeURIComponent(path)}`),
    branches: (owner, repo) => request('GET', `/repos/${owner}/${repo}/branches`),
    commits: (owner, repo, branch = 'main', limit = 10) => request('GET', `/repos/${owner}/${repo}/commits?branch=${branch}&limit=${limit}`),
  },

  // Analyze
  analyze: {
    run: (owner, repo, aiOptions = {}) => request('POST', `/analyze/${owner}/${repo}`, aiOptions),
    providers: () => request('GET', '/analyze/providers'),
    testProvider: (data) => request('POST', '/analyze/providers/test', data),
    models: (provider, baseUrl) => request('GET', `/analyze/providers/${provider}/models${baseUrl ? `?baseUrl=${encodeURIComponent(baseUrl)}` : ''}`),
    allModels: (baseUrl) => request('GET', `/analyze/providers/models/all${baseUrl ? `?baseUrl=${encodeURIComponent(baseUrl)}` : ''}`),
  },

  setToken,
  clearToken,
  getToken,
  setGitHubToken,
  clearGitHubToken,
  getGitHubToken,
};

export default api;