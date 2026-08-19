const GITHUB_API = 'https://api.github.com'
const DEFAULT_COUNT = 12
const FETCH_BUFFER = 18
const CACHE_TTL_MS = 30 * 60 * 1000
const SELF_REPO = 'wagamela/build-deck'

const LANGUAGE_COLORS = {
  Assembly: '#6E4C13',
  C: '#555555',
  'C#': '#178600',
  'C++': '#f34b7d',
  Clojure: '#db5855',
  CSS: '#563d7c',
  Crystal: '#000100',
  Dart: '#00B4AB',
  Dockerfile: '#384d54',
  Elixir: '#6e4a7e',
  Go: '#00ADD8',
  Haskell: '#5e5086',
  HTML: '#e34c26',
  Java: '#b07219',
  JavaScript: '#f1e05a',
  'Jupyter Notebook': '#DA5B0B',
  Kotlin: '#A97BFF',
  Lua: '#000080',
  Makefile: '#427819',
  'Objective-C': '#438eff',
  Perl: '#0298c3',
  PHP: '#4F5D95',
  PowerShell: '#012456',
  Python: '#3572a5',
  R: '#198CE7',
  Ruby: '#701516',
  Rust: '#dea584',
  SCSS: '#c6538c',
  Scala: '#c22d40',
  Shell: '#89e051',
  Svelte: '#ff3e00',
  Swift: '#F05138',
  TeX: '#3D6117',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  Zig: '#ec915c',
}

const FALLBACK_LANGUAGE_COLOR = '#8a8f98'

function defaultQuery() {
  const pushedSince = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  return `stars:>1000 pushed:>${pushedSince}`
}

function authHeaders() {
  const token = process.env.GITHUB_TOKEN
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function githubFetch(path) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'BuildDeck',
      ...authHeaders(),
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const message = body.match(/"message":\s*"([^"]+)"/)?.[1] ?? body.slice(0, 200)
    throw new Error(`GitHub API ${response.status}: ${message || response.statusText}`)
  }

  return response.json()
}

function topicToCategory(topics = []) {
  if (topics.length === 0) return 'Open Source'
  return topics[0]
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function toLanguageShares(languages) {
  const entries = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0)
  if (total === 0) return []

  const shares = entries
    .map(([name, bytes]) => ({
      name,
      color: LANGUAGE_COLORS[name] ?? FALLBACK_LANGUAGE_COLOR,
      share: Math.floor((bytes / total) * 100),
    }))
    .filter((share) => share.share > 0)

  const remainder = 100 - shares.reduce((sum, share) => sum + share.share, 0)
  if (remainder > 0 && shares.length > 0) shares[0].share += remainder

  return shares
}

function mapRepo(repo) {
  return {
    name: repo.name,
    owner: repo.owner.login,
    description: (repo.description || '').trim(),
    category: topicToCategory(repo.topics),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    languages: [],
    url: repo.html_url,
  }
}

async function fetchLanguages(fullName) {
  const [owner, repo] = fullName.split('/')
  const languages = await githubFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
  ).catch(() => ({}))
  return toLanguageShares(languages)
}

let cache = null
let cacheAt = 0

export async function getProjects({ refresh = false, query, sort, perPage } = {}) {
  const now = Date.now()
  if (!refresh && cache && now - cacheAt < CACHE_TTL_MS) return cache

  const target = Math.min(perPage || DEFAULT_COUNT, 30)
  const params = new URLSearchParams({
    q: query || defaultQuery(),
    sort: sort || 'stars',
    order: 'desc',
    per_page: String(Math.max(target, FETCH_BUFFER)),
  })

  const data = await githubFetch(`/search/repositories?${params}`)

  const repos = (data.items || [])
    .filter((repo) => !repo.fork && !repo.archived)
    .filter((repo) => repo.full_name.toLowerCase() !== SELF_REPO)
    .filter((repo) => repo.description)
    .filter((repo) => repo.language)

  const projects = []
  for (const repo of repos) {
    if (projects.length >= target) break
    const project = mapRepo(repo)
    project.languages = await fetchLanguages(repo.full_name)
    if (project.languages.length > 0) projects.push(project)
  }

  cache = projects
  cacheAt = now
  return projects
}