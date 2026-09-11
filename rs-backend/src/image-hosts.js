import dns from 'node:dns/promises'
import net from 'node:net'

// README images live anywhere — a project's own domain, a docs site, an S3
// bucket, an image CDN. A host allowlist throws most of them away, so instead
// we allow any *public* host and block the things a host allowlist was really
// protecting against: requests back into the network the server runs on.

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
])

const BLOCKED_TLDS = ['.local', '.internal', '.localhost', '.home.arpa']

function isPrivateIp(address) {
  const version = net.isIP(address)
  if (version === 4) {
    const [a, b] = address.split('.').map(Number)
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 169 && b === 254) return true // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true // carrier NAT
    if (a >= 224) return true // multicast + reserved
    return false
  }
  if (version === 6) {
    const addr = address.toLowerCase()
    if (addr === '::' || addr === '::1') return true
    if (addr.startsWith('fc') || addr.startsWith('fd')) return true // unique local
    if (addr.startsWith('fe80')) return true // link-local
    if (addr.startsWith('::ffff:')) return isPrivateIp(addr.slice(7)) // v4-mapped
    return false
  }
  return false
}

// Cheap synchronous check. Used by the scraper so it never stores a URL the
// proxy would refuse, and by the proxy as a first pass before any DNS work.
export function isProxyableImageUrl(url) {
  try {
    const { protocol, hostname } = new URL(url)
    if (protocol !== 'https:' && protocol !== 'http:') return false
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
    if (!host) return false
    if (BLOCKED_HOSTNAMES.has(host)) return false
    if (BLOCKED_TLDS.some((tld) => host.endsWith(tld))) return false
    if (net.isIP(host) && isPrivateIp(host)) return false
    // A bare hostname with no dot can only resolve on the local network.
    if (!net.isIP(host) && !host.includes('.')) return false
    return true
  } catch {
    return false
  }
}

// Full check, including DNS. Every address the host resolves to must be public,
// otherwise a public name pointed at 127.0.0.1 would sail through the check
// above. Called for the initial URL and again for every redirect hop.
export async function assertProxyableImageUrl(url) {
  if (!isProxyableImageUrl(url)) return false
  const { hostname } = new URL(url)
  const host = hostname.replace(/^\[|\]$/g, '')
  if (net.isIP(host)) return true
  try {
    const records = await dns.lookup(host, { all: true })
    return records.length > 0 && records.every((r) => !isPrivateIp(r.address))
  } catch {
    return false
  }
}
