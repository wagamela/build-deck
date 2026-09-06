import { Router } from 'express'
import sharp from 'sharp'

const router = Router()

const ALLOWED_HOSTS = [
  'github.com',
  'raw.githubusercontent.com',
  'avatars.githubusercontent.com',
]

const MAX_WIDTH = 1200
const DEFAULT_WIDTH = 800
const REQUEST_TIMEOUT_MS = 10_000

function isAllowedHost(url) {
  try {
    const { hostname } = new URL(url)
    return ALLOWED_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    )
  } catch {
    return false
  }
}

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

router.get('/', async (req, res) => {
  const { url, w, fmt } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing "url" query parameter' })
  }

  if (!isAllowedHost(url)) {
    return res.status(403).json({ error: 'Domain not allowed' })
  }

  const width = parseWidth(w)
  const accept = req.get('accept') || ''
  const format = negotiateFormat(accept, fmt)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BuildDeck-ImageProxy/1.0' },
    })
    clearTimeout(timeout)

    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream returned ${upstream.status}` })
    }

    const contentType = upstream.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      return res.status(422).json({ error: 'URL does not point to an image' })
    }

    const buffer = Buffer.from(await upstream.arrayBuffer())

    if (!format) {
      res.set('Cache-Control', 'public, max-age=86400, immutable')
      res.set('Content-Type', contentType)
      res.set('Vary', 'Accept')
      return res.send(buffer)
    }

    const pipeline = sharp(buffer).rotate()
    if (format === 'avif') {
      pipeline.avif({ quality: 80, effort: 4 })
    } else {
      pipeline.webp({ quality: 80 })
    }
    pipeline.resize({ width, withoutEnlargement: true })

    const result = await pipeline.toBuffer({ resolveWithObject: true })

    res.set('Cache-Control', 'public, max-age=86400, immutable')
    res.set('Content-Type', contentTypeFor(format))
    res.set('Vary', 'Accept')
    res.send(result.data)
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Upstream request timed out' })
    }
    return res.status(500).json({ error: 'Image processing failed' })
  }
})

export default router
