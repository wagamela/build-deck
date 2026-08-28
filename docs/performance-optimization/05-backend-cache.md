# Phase 5: Backend In-Memory Cache

## Problem

The backend makes ~49 GitHub API calls per batch (1 search + 4 per each of 12 projects: repo details, languages, contributors, readme image). There is no caching, so every page load or `loadMore` trigger repeats all these requests. This causes:

- Slow API responses (several seconds)
- Risk of hitting GitHub API rate limits
- Redundant network traffic

## Solution

Add a simple in-memory cache with a 5-minute TTL. The cache module is isolated so it can later be replaced with Redis or another persistent cache.

## Changes

### Create `bd-backend/src/cache.js`

```js
/**
 * Simple in-memory cache with TTL.
 * Swap this module for Redis/other persistent cache later.
 */
const store = new Map();

export function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function set(key, value, ttlMs = 5 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clear() {
  store.clear();
}
```

### Modify `bd-backend/src/services/github.js`

**Add import at the top:**

```diff
+import { get as cacheGet, set as cacheSet } from './cache.js';
```

**In `getProjects()` (line 349), add cache check before the main loop:**

```diff
 export async function getProjects({ refresh = false, query, sort, perPage } = {}) {
   if (refresh) {
     seenRepos = new Set();
     cursorPage = 1;
   }

   const target = Math.min(perPage || DEFAULT_COUNT, 30);
+
+  // Check cache (skip on refresh)
+  if (!refresh) {
+    const cacheKey = `projects:${query || 'default'}:${sort || 'stars'}:${target}`;
+    const cached = cacheGet(cacheKey);
+    if (cached) return cached;
+  }
+
   const projects = []
```

**After `return projects` (line 403), add cache write:**

```diff
+  // Cache the result (skip on refresh)
+  if (!refresh) {
+    const cacheKey = `projects:${query || 'default'}:${sort || 'stars'}:${target}`;
+    cacheSet(cacheKey, projects);
+  }
+
   return projects;
 }
```

## Cache Key Strategy

- Based on `query`, `sort`, and `perPage` (the three parameters that affect the result)
- Different request parameters get different cache entries
- The `refresh` parameter bypasses the cache (existing behavior preserved)

## Cache Isolation

The `cache.js` module exports three functions: `get`, `set`, `clear`. To swap for Redis later:
1. Replace the internals of `cache.js` with Redis calls
2. No changes needed in `github.js`

## Expected Impact

- First request: same latency as before (~several seconds)
- Subsequent requests within 5 minutes: near-instant response
- Reduced GitHub API rate limit consumption
- Better user experience on page refreshes and `loadMore` triggers

## Verification

1. Start the backend: `npm run dev` from `bd-backend/`
2. Make a request to `/api/projects` — should return projects
3. Make the same request again within 5 minutes — should return instantly (cached)
4. Make a request with `?refresh=true` — should bypass cache and fetch fresh data
5. Wait 5+ minutes — cache should expire, next request fetches fresh data
