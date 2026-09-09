import { Router } from 'express'
import sharp from 'sharp'
import { assertProxyableImageUrl } from '../image-hosts.js'
import { get as cacheGet, set as cacheSet } from '../cache.js'

const router = Router()

const MAX_WIDTH = 1200
const DEFAULT_WIDTH = 800
const REQUEST_TIMEOUT_MS = 10_000
const MAX_BYTES = 12 * 1024 * 1024
const MAX_REDIRECTS = 4
// Response carries `immutable`, so callers never re-request a given
// url+width+format combination expecting fresh bytes; mirror that server-side
// so repeat visitors (and repeat cards for a popular repo) skip the upstream
// fetch and Sharp re-encode instead of paying for both on every request.
const PROCESSED_CACHE_TTL_MS = 24 * 60 * 60 * 1000

function parseWidth(value) {
  if (!value) return DEFAULT_WIDTH
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_WIDTH
  return Math.min(Math.round(n), MAX_WIDTH)
}

function negotiateFormat(acceptHeader, requested) {
  if (requested === 'avif' && acceptHeader.includes('image/avif')) return 'avif'
  if (requested === 'webp' && acceptHeader.includes('image/webp')) return 'webp'
  if (requested === 'webp') return 'webp'
  if (requested === 'avif') return 'avif'
  if (acceptHeader.includes('image/avif')) return 'avif'
  if (acceptHeader.includes('image/webp')) return 'webp'
  return null
}

function contentTypeFor(format) {
  if (format === 'avif') return 'image/avif'
  if (format === 'webp') return 'image/webp'
  return 'image/png'
}

// fetch() follows redirects itself, which would let a public URL bounce to an
// internal one unchecked. Walk the chain by hand and re-validate each hop.
async function fetchImage(startUrl, signal) {
  let url = startUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await assertProxyableImageUrl(url))) {
      return { error: 'forbidden' }
    }
    const response = await fetch(url, {
      signal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'BuildDeck-ImageProxy/1.0',
        Accept: 'image/*,*/*;q=0.8',
      },
    })
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) return { error: 'upstream', status: response.status }
      url = new URL(location, url).toString()
      continue
    }
    return { response }
  }
  return { error: 'too-many-redirects' }
}

async function readCapped(response) {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > MAX_BYTES) return null

  const chunks = []
  let total = 0
  for await (const chunk of response.body) {
    total += chunk.length
    if (total > MAX_BYTES) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

router.get('/', async (req, res) => {
  const { url, w, fmt } = req.query

  if (!url || typeof url !== 'string') {
    res.set('Cache-Control', 'no-store')
    return res.status(400).json({ error: 'Missing "url" query parameter' })
  }

  const width = parseWidth(w)
  const accept = req.get('accept') || ''
  const format = negotiateFormat(accept, fmt)

  // Width only affects output for the resize branch below; keying the
  // passthrough (no format / animated GIF) cache entry on it too would just
  // fragment the cache across widths that all produce identical bytes.
  const cacheKey = format ? `img:${url}:${width}:${format}` : `img:${url}:raw`
  const cached = cacheGet(cacheKey)
  if (cached) {
    res.set('Cache-Control', 'public, max-age=86400, immutable')
    res.set('Content-Type', cached.contentType)
    res.set('Content-Length', String(cached.buffer.length))
    res.set('Vary', 'Accept')
    return res.send(cached.buffer)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const { response: upstream, error } = await fetchImage(url, controller.signal)

    if (error === 'forbidden') {
      res.set('Cache-Control', 'no-store')
      return res.status(403).json({ error: 'Host not permitted' })
    }
    if (error || !upstream.ok) {
      res.set('Cache-Control', 'no-store')
      return res
        .status(502)
        .json({ error: `Upstream returned ${upstream?.status ?? error}` })
    }

    const contentType = upstream.headers.get('content-type') || ''
    const looksLikeImage =
      contentType.startsWith('image/') || contentType === 'application/octet-stream'
    if (!looksLikeImage) {
      res.set('Cache-Control', 'no-store')
      return res.status(422).json({ error: 'URL does not point to an image' })
    }

    const buffer = await readCapped(upstream)
    if (!buffer) {
      res.set('Cache-Control', 'no-store')
      return res.status(413).json({ error: 'Image too large' })
    }

    // Animated GIFs stay as-is; re-encoding them to a still frame loses the
    // content, and the doc's advice there is to ship video, not a resize.
    if (!format || contentType === 'image/gif') {
      const passthroughType = contentType.startsWith('image/') ? contentType : 'image/png'
      cacheSet(cacheKey, { buffer, contentType: passthroughType }, PROCESSED_CACHE_TTL_MS)
      res.set('Cache-Control', 'public, max-age=86400, immutable')
      res.set('Content-Type', passthroughType)
      res.set('Content-Length', String(buffer.length))
      res.set('Vary', 'Accept')
      return res.send(buffer)
    }

    // density lifts SVG rasterisation to the requested width instead of the
    // nominal 72dpi box, which otherwise renders vector art blurry.
    const pipeline = sharp(buffer, { density: 200 }).rotate()
    pipeline.resize({ width, withoutEnlargement: true })
    if (format === 'avif') {
      pipeline.avif({ quality: 60, effort: 4 })
    } else {
      pipeline.webp({ quality: 78 })
    }

    const result = await pipeline.toBuffer()
    const resultType = contentTypeFor(format)
    cacheSet(cacheKey, { buffer: result, contentType: resultType }, PROCESSED_CACHE_TTL_MS)

    res.set('Cache-Control', 'public, max-age=86400, immutable')
    res.set('Content-Type', resultType)
    res.set('Content-Length', String(result.length))
    res.set('Vary', 'Accept')
    res.send(result)
  } catch (err) {
    res.set('Cache-Control', 'no-store')
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Upstream request timed out' })
    }
    return res.status(500).json({ error: 'Image processing failed' })
  } finally {
    clearTimeout(timeout)
  }
})

export default router
