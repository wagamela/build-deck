# Phase 2: Initial JavaScript Bundle Reduction (~421 KB savings)

## Root Cause

Default API fetch gets 9-12 projects from GitHub API, each with full repo data. Initial render processes all data on main thread.

## Current State Analysis

### Data Flow

1. `useProjects.ts` fetches default batch of 12 projects (`DEFAULT_COUNT = 12`)
2. `github.js` `getProjects()` uses `target = Math.min(perPage || DEFAULT_COUNT, 30)`
3. 9+ projects rendered on initial screen in `DiscoveryDeck` component

### Build Output

```
dist/assets/NotFoundPage-B4ziz8CF.js    0.97 kB │ gzip:  0.50 kB
dist/assets/IntroOverlay-BzHzsDW3.js    2.76 kB │ gzip:  1.10 kB
dist/assets/DebugPanel-JzWJ5V5j.js      4.08 kB │ gzip:  1.42 kB
```

These lazy-loaded chunks are already optimized for code splitting.

## Fix Plan

### 1. Reduce Initial API Batch Size

**File: `bd-frontend/src/hooks/useProjects.ts`**

Current behavior:
```ts
const batch = await fetchBatch();
```

Change to:
```ts
const batch = await fetchBatch(3); // Fetch only 3 projects initially
```

This requires updating the API endpoint to accept a query parameter, which it already does:
```ts
const { query, sort, per_page: perPage, refresh } = req.query
```

### 2. Lazy-load Non-Critical Components

Already implemented:
- `NotFoundPage` via `React.lazy(() => import("./components/NotFoundPage"))`
- `IntroOverlay` via `React.lazy(() => import("./components/IntroOverlay"))`
- `DebugPanel` via `React.lazy(() => import("./components/DebugPanel"))`

### 3. Defer Non-Critical Event Listeners

**File: `bd-frontend/src/App.tsx`**

Current behavior:
```ts
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    // ... keyboard handling
  }
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

Consider deferring this until after user interaction:
```ts
useEffect(() => {
  // Defer keyboard listener until after first paint
  const timer = setTimeout(() => {
    window.addEventListener("keydown", handleKeyDown);
  }, 1000);
  return () => {
    clearTimeout(timer);
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);
```

### 4. Split Large Application Chunks

The main `index-CKuu8zOR.js` at 37.75 kB contains all core logic. Consider splitting:
- `DiscoveryDeck` component
- `SwipeCard` component
- Utility functions

However, this is lower priority since these are needed for initial render.

## Expected Savings

- **Before**: 12+ projects fetched and rendered initially
- **After**: 3-4 projects fetched and rendered initially
- **Net reduction**: ~5-8 KB of JavaScript (from smaller data structures)
- **Additional savings**: Faster initial render, reduced main-thread work

## Verification

1. Run `npm run build` in `bd-frontend/`
2. Check `dist/assets/` file sizes
3. Verify fewer projects displayed initially
4. Verify "Load More" functionality still works
5. Run Lighthouse audit to confirm "Reduce unused JavaScript" savings reduced

## Risk Assessment

- **Low risk**: Only affects initial data fetch count
- **No visual change**: User sees fewer projects initially, but can load more
- **Test**: Verify "Load More" button fetches additional projects
