/**
 * Simple in-memory cache with TTL.
 * Swap this module for Redis or another persistent cache later.
 */
const store = new Map()

export function get(key) {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function set(key, value, ttlMs = 5 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function clear() {
  store.clear()
}
