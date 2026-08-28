import { get as cacheGet, set as cacheSet } from '../cache.js'

const GITHUB_API = 'https://api.github.com'
const DEFAULT_COUNT = 12
const FETCH_BUFFER = 18
const MAX_SCAN = 90
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

async function githubFetch(path, { raw = false, accept = 'application/vnd.github+json' } = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: accept,
      'User-Agent': 'BuildDeck',
      ...authHeaders(),
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const message = body.match(/"message":\s*"([^"]+)"/)?.[1] ?? body.slice(0, 200)
    throw new Error(`GitHub API ${response.status}: ${message || response.statusText}`)
  }

  if (raw) return response
  return response.json()
}

function lastPageFromLink(linkHeader) {
  if (!linkHeader) return null
  const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/)
  return match ? Number(match[1]) : null
}

function extractImageUrls(readme) {
  const urls = []
  const markdownPattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+["'([][^)]*)?\)/g
  let match
  while ((match = markdownPattern.exec(readme)) !== null) urls.push(match[1])

  const htmlPattern = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi
  while ((match = htmlPattern.exec(readme)) !== null) urls.push(match[1])

  return urls
}

function resolveImageUrl(src, fullName) {
  if (!src) return null
  let url = src.trim().replace(/^<(.*)>$/, '$1').trim()
  if (!url || /^data:/i.test(url)) return null
  if (/^https?:\/\//i.test(url)) return url

  const clean = url.replace(/^\.?\/+/, '')
  if (!clean) return null
  return `https://raw.githubusercontent.com/${fullName}/HEAD/${clean}`
}

const BADGE_HOSTS = [
  'img.shields.io',
  'shields.io',
  'badgen.net',
  'flat.badgen.net',
  'badge.fury.io',
  'forthebadge.com',
  'travis-ci.org',
  'travis-ci.com',
  'app.travis-ci.com',
  'circleci.com',
  'circle.ci',
  'codecov.io',
  'coveralls.io',
  'app.codacy.com',
  'api.codacy.com',
  'api.dependabot.com',
  'hits.seeyoufarm.com',
  'img.badgesize.io',
  'bettercodehub.com',
  'api.codeclimate.com',
  'api.goreportcard.com',
  'goreportcard.com',
  'david-dm.org',
  'dev.azure.com',
  'app.netlify.com',
  'api.netlify.com',
  'opencollective.com',
  'liberapay.com',
  'www.patreon.com',
  'snyk.io',
  'app.snyk.io',
  'img.snyk.io',
  'githbadges.com',
  'php-eye.com',
  'scrutinizer-ci.com',
  'codefactor.io',
  'www.codefactor.io',
  'lgtm.com',
  'deepscan.io',
  'maven-badges.herokuapp.com',
  'badges.gitter.im',
  'img.gitter.im',
  'gitter.im',
  'badge.waffle.io',
  'api.greenkeeper.io',
  'api.bitrise.io',
  'ci.appveyor.com',
  'app.fossa.com',
  'api.fossa.com',
  'badges-cdn.swaggerhub.com',
  'repostatus.org',
  'www.repostatus.org',
  'api.repostatus.org',
  'img.loopo.de',
  'jitpack.io',
  'badges.herokuapp.com',
  'www.versioneye.com',
  'buildstatus.ow2.org',
  'mypy-lang.org',
  'zenhub.com',
  'codebeat.co',
  'www.codebeat.co',
  'badges.frapsoft.com',
  'badge-size.herokuapp.com',
  'asciinema.org',
]

const BADGE_URL_PATTERNS = [
  /\/actions\/workflows\/[^/]+\/badge\.svg$/i,
  /\/workflows\/[^/]+\/badge\.svg$/i,
  /\/badge\/[^/]+\.(svg|png|gif)$/i,
  /\/badges\//i,
  /\/shields\//i,
  /[?&]badge=/i,
  /\/badge\.(svg|png|gif)$/i,
  /\/status\/[^/]+\.(svg|png|gif)$/i,
  /\/ci\/[^/]+\.(svg|png|gif)$/i,
  /\/build\/[^/]+\.(svg|png|gif)$/i,
  /\/coverage\/[^/]+\.(svg|png|gif)$/i,
  /\/version\/[^/]+\.(svg|png|gif)$/i,
  /\/downloads\/[^/]+\.(svg|png|gif)$/i,
  /\/stars\/[^/]+\.(svg|png|gif)$/i,
  /\/license\/[^/]+\.(svg|png|gif)$/i,
  /\/warning\//i,
  /\/\.svg$/i,
  /\/badge-/i,
  /[?&](?:status|build|version|coverage|license|downloads|stars)=(?:svg|png|gif)/i,
  /github\.com\/[^/]+\/[^/]+\/actions\/workflows\//i,
  /github\.com\/[^/]+\/[^/]+\/workflows\//i,
]

function isBadgeUrl(url) {
  const host = (url.match(/^https?:\/\/([^/?#]+)/i) || [])[1]
  if (host) {
    const normalized = host.toLowerCase()
    if (BADGE_HOSTS.some((badge) => normalized === badge || normalized.endsWith(`.${badge}`))) {
      return true
    }
    if (/badge|shields|badgen|\.svg$/i.test(url)) {
      return true
    }
  }
  if (BADGE_URL_PATTERNS.some((pattern) => pattern.test(url))) {
    return true
  }
  if (/[?&](?:badge|label|style|logo|color|logoColor|link)=/i.test(url)) {
    return true
  }
  return false
}

function isSvgImage(url) {
  return /\.svg(\?|#|$)/i.test(url)
}

async function fetchReadmeImage(fullName) {
  const [owner, repo] = fullName.split('/')
  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const response = await githubFetch(`${path}/readme`, {
    raw: true,
    accept: 'application/vnd.github.raw',
  }).catch(() => null)
  if (!response) return null

  const readme = await response.text().catch(() => '')
  for (const url of extractImageUrls(readme)) {
    const resolved = resolveImageUrl(url, fullName)
    if (!resolved || isBadgeUrl(resolved) || isSvgImage(resolved)) continue
    return resolved
  }
  return null
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
    ownerAvatarUrl: repo.owner.avatar_url,
    description: (repo.description || '').trim(),
    category: topicToCategory(repo.topics),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.subscribers_count,
    languages: [],
    contributors: [],
    contributorsCount: 0,
    url: repo.html_url,
  }
}

async function fetchContributors(path) {
  const [topContributors, countResponse] = await Promise.all([
    githubFetch(`${path}/contributors?per_page=3`).catch(() => []),
    githubFetch(`${path}/contributors?per_page=1`, { raw: true }).catch(() => null),
  ])

  const contributors = Array.isArray(topContributors)
    ? topContributors
        .filter((contributor) => contributor.login && contributor.avatar_url)
        .map((contributor) => ({
          login: contributor.login,
          avatarUrl: contributor.avatar_url,
        }))
    : []

  let contributorsCount = contributors.length
  const lastPage = countResponse
    ? lastPageFromLink(countResponse.headers.get('link'))
    : null
  if (lastPage) contributorsCount = lastPage

  return { contributors, contributorsCount }
}

async function fetchRepoDetails(fullName) {
  const [owner, repo] = fullName.split('/')
  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const [details, languages, contributors, image] = await Promise.all([
    githubFetch(path).catch(() => null),
    githubFetch(`${path}/languages`).catch(() => ({})),
    fetchContributors(path),
    fetchReadmeImage(fullName),
  ])
  return {
    languages: toLanguageShares(languages),
    subscribers: details?.subscribers_count ?? 0,
    contributors: contributors.contributors,
    contributorsCount: contributors.contributorsCount,
    image,
  }
}

let seenRepos = new Set()
let cursorPage = 1

function repoKey(repo) {
  return repo.full_name.toLowerCase()
}

function excluded(repo) {
  return (
    repo.fork ||
    repo.archived ||
    repo.full_name.toLowerCase() === SELF_REPO ||
    !repo.description ||
    !repo.language
  )
}

export async function getProjects({ refresh = false, query, sort, perPage } = {}) {
  if (refresh) {
    seenRepos = new Set()
    cursorPage = 1
  }

  const target = Math.min(perPage || DEFAULT_COUNT, 30)

  if (!refresh) {
    const cacheKey = `projects:${query || 'default'}:${sort || 'stars'}:${target}`
    const cached = cacheGet(cacheKey)
    if (cached) return cached
  }

  const projects = []
  let page = cursorPage
  let scanned = 0

  while (projects.length < target && scanned < MAX_SCAN) {
    const params = new URLSearchParams({
      q: query || defaultQuery(),
      sort: sort || 'stars',
      order: 'desc',
      per_page: String(FETCH_BUFFER),
      page: String(page),
    })

    const data = await githubFetch(`/search/repositories?${params}`)
    const items = data.items || []
    scanned += items.length
    if (items.length === 0) break

    for (const repo of items) {
      if (projects.length >= target) break
      if (excluded(repo) || seenRepos.has(repoKey(repo))) continue

      const project = mapRepo(repo)
      const details = await fetchRepoDetails(repo.full_name)
      project.languages = details.languages
      project.watchers = details.subscribers
      project.contributors = details.contributors
      project.contributorsCount = details.contributorsCount
      project.image = details.image
      if (project.languages.length === 0) continue

      projects.push(project)
      seenRepos.add(repoKey(repo))
    }

    page += 1
  }

  cursorPage = page

  // Scanned a wide range but couldn't fill the batch, meaning every result
  // in range has already been shown — let the next request start over.
  if (projects.length < target && scanned > 0) {
    seenRepos = new Set()
    cursorPage = 1
  }

  if (!refresh) {
    const cacheKey = `projects:${query || 'default'}:${sort || 'stars'}:${target}`
    cacheSet(cacheKey, projects)
  }

  return projects
}