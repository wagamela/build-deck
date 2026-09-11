import { get as cacheGet, set as cacheSet } from '../cache.js'
import { isProxyableImageUrl } from '../image-hosts.js'

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

function pushedSince() {
  return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function defaultQuery() {
  return `stars:>1000 pushed:>${pushedSince()}`
}

// GitHub topics are lowercase, digits and hyphens only. Anything else is
// either a typo or an injection attempt into the search qualifier string.
export function sanitizeTopic(raw) {
  if (typeof raw !== 'string') return null
  const topic = raw.trim().toLowerCase()
  return /^[a-z0-9][a-z0-9-]{1,34}$/.test(topic) ? topic : null
}

// A steered search is narrower than the default feed, so the star floor drops
// to keep niche topics from returning an empty page.
function topicQuery(topic) {
  return `topic:${topic} stars:>300 pushed:>${pushedSince()}`
}

function authHeaders() {
  const token = process.env.GITHUB_TOKEN
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function githubFetch(path, { raw = false, accept = 'application/vnd.github+json' } = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: accept,
      'User-Agent': 'RepoSwipe',
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

// github.com/<owner>/<repo>/blob/<ref>/<path> serves an HTML page, not the
// image bytes. The /raw/ form redirects, but raw.githubusercontent.com is
// already on the proxy allowlist, so rewrite both to it directly.
function normalizeGithubBlobUrl(url) {
  const match = url.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+\/[^/]+)\/(?:blob|raw)\/(.+)$/i
  )
  if (!match) return url
  return `https://raw.githubusercontent.com/${match[1]}/${match[2]}`
}

function resolveImageUrl(src, fullName) {
  if (!src) return null
  let url = src.trim().replace(/^<(.*)>$/, '$1').trim()
  if (!url || /^data:/i.test(url)) return null
  if (/^\/\//.test(url)) url = `https:${url}`
  if (/^https?:\/\//i.test(url)) return normalizeGithubBlobUrl(url)

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
    // Note: no blanket `.svg` rule here. Plenty of projects ship a real SVG
    // banner, and the badge hosts and URL patterns below already catch the
    // shields-style ones.
    if (/badge|shields|badgen/i.test(url)) {
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

// Images that are real content but not a picture *of the project*: contributor
// avatar grids, star-history charts, sponsor walls, generated social cards.
const NON_CONTENT_HOSTS = [
  'avatars.githubusercontent.com',
  'contrib.rocks',
  'contributors-img.web.app',
  'api.star-history.com',
  'star-history.com',
  'opengraph.githubassets.com',
  'github-readme-stats.vercel.app',
  'streak-stats.demolab.com',
  'komarev.com',
  'visitor-badge.laobi.icu',
  'profile-counter.glitch.me',
]

function isNonContentImage(url) {
  const host = (url.match(/^https?:\/\/([^/?#]+)/i) || [])[1]?.toLowerCase()
  if (host && NON_CONTENT_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return true
  }
  return /\/(?:contributors?|sponsors?)[-_.]?(?:img|image|grid|wall)?\.(?:png|jpg|jpeg|svg)/i.test(url)
}

// Prefer the image that actually shows the project. READMEs put their hero
// near the top, so document order is the tiebreaker; these adjustments only
// override it when the filename says something meaningful.
const SCREENSHOT_HINT = /screenshot|screen-shot|demo|preview|hero|banner|cover|example|showcase|ui|dashboard/i
const LOGO_HINT = /logo|icon|favicon|wordmark|avatar/i
const RASTER_EXT = /\.(png|jpe?g|webp|avif|gif)(\?|#|$)/i

function scoreImage(url, order) {
  let score = -order
  if (SCREENSHOT_HINT.test(url)) score += 40
  if (LOGO_HINT.test(url)) score -= 25
  if (RASTER_EXT.test(url)) score += 8
  if (/\.svg(\?|#|$)/i.test(url)) score -= 4
  return score
}

const MAX_IMAGE_CANDIDATES = 3

/** Extra candidates enriched per page beyond the exact remaining target, to
 * absorb ones that fail enrichment or turn out to have no languages. */
const ENRICH_BUFFER = 3

async function fetchReadmeImages(fullName) {
  const [owner, repo] = fullName.split('/')
  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const response = await githubFetch(`${path}/readme`, {
    raw: true,
    accept: 'application/vnd.github.raw',
  }).catch(() => null)
  if (!response) return []

  const readme = await response.text().catch(() => '')

  const seen = new Set()
  const candidates = []
  for (const url of extractImageUrls(readme)) {
    const resolved = resolveImageUrl(url, fullName)
    if (!resolved || seen.has(resolved)) continue
    if (isBadgeUrl(resolved) || isNonContentImage(resolved)) continue
    // Everything is rendered through /api/image-proxy, so drop anything the
    // proxy would refuse rather than handing the card a doomed URL.
    if (!isProxyableImageUrl(resolved)) continue
    seen.add(resolved)
    candidates.push({ url: resolved, order: candidates.length })
  }

  return candidates
    .sort((a, b) => scoreImage(b.url, b.order) - scoreImage(a.url, a.order))
    .slice(0, MAX_IMAGE_CANDIDATES)
    .map((candidate) => candidate.url)
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
    // Kept raw alongside the display category: the client's recommendation
    // model scores cards on these.
    topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 12) : [],
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

async function fetchRepoDetails(fullName, { light = false } = {}) {
  const [owner, repo] = fullName.split('/')
  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const baseCalls = [
    githubFetch(path).catch(() => null),
    githubFetch(`${path}/languages`).catch(() => ({})),
    fetchContributors(path),
  ]
  if (light) {
    const [details, languages, contributors] = await Promise.all(baseCalls)
    return {
      languages: toLanguageShares(languages),
      subscribers: details?.subscribers_count ?? 0,
      contributors: contributors.contributors,
      contributorsCount: contributors.contributorsCount,
      images: [],
    }
  }
  const [details, languages, contributors, images] = await Promise.all([
    ...baseCalls,
    fetchReadmeImages(fullName),
  ])
  return {
    languages: toLanguageShares(languages),
    subscribers: details?.subscribers_count ?? 0,
    contributors: contributors.contributors,
    contributorsCount: contributors.contributorsCount,
    images,
  }
}

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

async function collectProjects({
  searchQuery,
  sort,
  target,
  light,
  seenRepos,
  projects,
  startPage = 1,
}) {
  let page = startPage
  let scanned = 0

  while (projects.length < target && scanned < MAX_SCAN) {
    const params = new URLSearchParams({
      q: searchQuery,
      sort: sort || 'stars',
      order: 'desc',
      per_page: String(FETCH_BUFFER),
      page: String(page),
    })

    const data = await githubFetch(`/search/repositories?${params}`)
    const items = data.items || []
    scanned += items.length
    if (items.length === 0) break

    const candidates = items.filter((repo) => {
      if (excluded(repo) || seenRepos.has(repoKey(repo))) return false
      seenRepos.add(repoKey(repo))
      return true
    })

    if (candidates.length === 0) {
      page += 1
      continue
    }

    // Enriching a candidate costs 3-4 GitHub API round trips (details,
    // languages, contributors, README scrape), so only enrich as many as the
    // remaining target needs. `ENRICH_BUFFER` absorbs candidates that come
    // back with no languages or fail outright, without paying for the whole
    // page: a `perPage: 1` request (the LCP-critical first card) used to
    // enrich all ~15 candidates on the page in parallel just to keep one,
    // which queued dozens of concurrent GitHub requests behind it.
    const need = target - projects.length
    const toEnrich = candidates.slice(0, need + ENRICH_BUFFER)

    const enrichments = await Promise.all(
      toEnrich.map((repo) =>
        fetchRepoDetails(repo.full_name, { light }).then((details) => ({
          repo,
          details,
        })).catch(() => null)
      )
    )

    for (const result of enrichments) {
      if (projects.length >= target) break
      if (!result) continue
      const { repo, details } = result
      const project = mapRepo(repo)
      project.languages = details.languages
      project.watchers = details.subscribers
      project.contributors = details.contributors
      project.contributorsCount = details.contributorsCount
      // `images` is the fallback chain; `image` stays the primary so the card
      // has something to render before any of them resolve.
      project.images = details.images
      project.image = details.images[0] ?? null
      if (project.languages.length === 0) continue
      projects.push(project)
    }

    page += 1
  }

  return projects
}

/** Enough steered results to be worth showing without topping up. */
const STEER_SUFFICIENCY = 0.6

// One `batch` consumes at most MAX_SCAN results, so the next batch has to start
// where the previous one gave up or every refill would return the same repos.
const PAGES_PER_BATCH = Math.ceil(MAX_SCAN / FETCH_BUFFER)
// GitHub search only serves the first 1000 matches; wrap rather than page past it.
const MAX_SEARCH_PAGE = Math.floor(1000 / FETCH_BUFFER)

function startPageForBatch(batch) {
  const offset = ((batch - 1) * PAGES_PER_BATCH) % MAX_SEARCH_PAGE
  return offset + 1
}

export async function getProjects({
  refresh = false,
  query,
  sort,
  perPage,
  light = false,
  topic,
  batch = 1,
} = {}) {
  const target = Math.min(perPage || DEFAULT_COUNT, 30)
  const steerTopic = query ? null : sanitizeTopic(topic)
  const batchNumber = Number.isFinite(batch) && batch > 0 ? Math.floor(batch) : 1
  const startPage = startPageForBatch(batchNumber)
  const cacheKey = `projects:${query || 'default'}:${steerTopic || 'none'}:${sort || 'stars'}:${target}:${light ? 'light' : 'full'}:${startPage}`

  if (!refresh) {
    const cached = cacheGet(cacheKey)
    if (cached) return cached
  }

  const seenRepos = new Set()
  const projects = []

  if (steerTopic) {
    await collectProjects({
      searchQuery: topicQuery(steerTopic),
      sort,
      target,
      light,
      seenRepos,
      projects,
      startPage,
    })
  }

  // Top up from the general feed when the topic is too niche to fill a batch,
  // so a steered refill never hands the deck fewer cards than an unsteered one.
  if (projects.length < Math.ceil(target * STEER_SUFFICIENCY)) {
    await collectProjects({
      searchQuery: query || defaultQuery(),
      sort,
      target,
      light,
      seenRepos,
      projects,
      startPage,
    })
  }

  if (!refresh) cacheSet(cacheKey, projects)

  return projects
}