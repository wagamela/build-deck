# Phase 3: Network Payload Reduction (~8.5 MB → ~5.5 MB)

## Root Cause

API response data + project images dominate the ~8.5 MB payload. The build output only produces ~271 kB of JS/CSS, but Lighthouse reports ~8,504 KiB total network payload.

## Current State Breakdown

### Resource Categories

| Category | Raw Size | Gzip Size | Notes |
|----------|----------|-----------|-------|
| **JS** | ~271 kB | ~83 kB | Main bundle + React vendor + lazy chunks |
| **CSS** | ~36 kB | ~8 kB | Tailwind CSS with custom theme |
| **Fonts** | ~80 kB | ~15 kB | Inter (48 KB) + JetBrains Mono (31 KB) |
| **API/JSON** | ~6+ MB | N/A | GitHub API responses for 9+ projects |
| **Images** | ~1+ MB | N/A | README images + avatar images |
| **Other** | ~200+ kB | N/A | Favicons, misc |

### API Response Structure

Each project from `/api/projects` includes:
```json
{
  "name": "string",
  "owner": "string",
  "ownerAvatarUrl": "string",
  "description": "string",
  "category": "string",
  "stars": "number",
  "forks": "number",
  "watchers": "number",
  "languages": "array of 4 objects",
  "contributors": "array of 3+ objects",
  "contributorsCount": "number",
  "url": "string",
  "image": "string (URL)"
}
```

With 9+ projects, the cumulative API response data is significant.

## Fix Plan

### 1. Reduce Initial API Payload

**File: `bd-frontend/src/hooks/useProjects.ts`**

Current:
```ts
const batch = await fetchBatch();
```

Change to:
```ts
const batch = await fetchBatch(3); // Fetch only 3 projects initially
```

**File: `bd-backend/src/services/github.js`**

The backend already supports `perPage` parameter:
```js
const target = Math.min(perPage || DEFAULT_COUNT, 30)
```

### 2. Optimize Image Delivery

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Add `width`/`height` attributes:
```tsx
<img
  src={project.image}
  alt={`${project.name} screenshot`}
  width={400}
  height={240}
  loading="lazy"
  className="object-contain"
/>
```

Add `loading="lazy"` to non-LCP images:
```tsx
<img
  src={contributor.avatarUrl}
  alt={`${contributor.login} profile photo`}
  width="24"
  height="24"
  loading="lazy"
  className="h-6 w-6 rounded-full"
/>
```

### 3. Reduce Avatar Count

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Current:
```tsx
const contributors = project.contributors?.slice(0, 3) ?? [];
```

Change to:
```tsx
const contributors = project.contributors?.slice(0, 2) ?? []; // Show max 2 contributors
```

### 4. Add Responsive Image Sizing

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Add `sizes` attribute:
```tsx
<img
  src={project.image}
  alt={`${project.name} screenshot`}
  width={400}
  height={240}
  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 50vw"
  loading="lazy"
  className="object-contain"
/>
```

## Expected Savings

- **API/JSON**: ~2-3 MB reduction (fewer projects, fewer details per project)
- **Images**: ~500 KB reduction (smaller avatars, lazy loading)
- **Total**: ~2.5-3.5 MB reduction

## Verification

1. Run `npm run build` in `bd-frontend/`
2. Start production server: `npm run preview -- --port 4321`
3. Open Chrome DevTools Network panel
4. Check total payload size
5. Verify fewer API requests for initial load
6. Verify images load correctly with lazy loading

## Risk Assessment

- **Low risk**: Only affects initial data fetch count and image attributes
- **No visual change**: User sees fewer projects initially, but can load more
- **Test**: Verify all images render correctly, verify "Load More" works
