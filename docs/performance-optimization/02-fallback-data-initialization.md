# Phase 2: Instant First Paint via Fallback Data

## Problem

The app initializes `projects` as `[]`, causing it to render `<LoadingState />` (a spinner with "dealing the deck...") until the API responds. The backend makes ~49 GitHub API calls per batch, taking several seconds. This is the primary cause of the 7.6s LCP.

## Current Flow

1. `projects = []` in `useProjects` hook
2. `App` renders `<LoadingState />` (spinner)
3. API call starts (~49 GitHub API requests)
4. API responds after several seconds
5. `projects` populated → `<Deck />` renders → first card appears → LCP

## New Flow

1. `projects = fallbackProjects` in `useProjects` hook (8 real projects already in bundle)
2. `App` renders `<Deck />` immediately with fallback data → first card appears → LCP near-instant
3. API call starts in background
4. API responds → `projects` replaced with fresh data → seamless update

## Changes

### `src/hooks/useProjects.ts`

**Line 18:** Initialize with fallback data instead of empty array.

```diff
-const [projects, setProjects] = useState<Project[]>([]);
+const [projects, setProjects] = useState<Project[]>(fallbackProjects);
```

**Line 21:** Pre-populate `seenRef` with fallback project keys so `mergeUnique` correctly deduplicates when API data arrives.

```diff
-const seenRef = useRef(new Set<string>());
+const seenRef = useRef(new Set(fallbackProjects.map(projectKey)));
```

**Lines 58-69:** In `loadInitial()`, on API success, replace fallback data with fresh API data. On API failure, keep existing fallback data and set `usingFallback = true`.

The existing code already does this correctly:
- Success: `setProjects(mergeUnique(batch))` — `mergeUnique` filters out any projects already in `seenRef` (which includes fallback keys), so only truly new API projects are added, replacing the fallback
- Failure: `setUsingFallback(true)` and `setProjects(mergeUnique(fallbackProjects))` — keeps the fallback data and shows the banner

No changes needed to the `loadInitial` function body.

### `src/App.tsx`

**Line 536:** Remove the unreachable loading state guard.

```diff
 function App() {
   const { projects, usingFallback, loadMore } = useProjects();
   if (window.location.pathname !== "/") return <NotFoundPage />;
-  if (projects.length === 0) return <LoadingState />;
   return (
     <Deck
       projects={projects}
       usingFallback={usingFallback}
       onRefill={loadMore}
     />
   );
 }
```

**Lines 524-531:** Remove the `LoadingState` function (dead code).

```diff
-function LoadingState() {
-  return (
-    <main className="app-bg flex h-dvh flex-col items-center justify-center gap-5 text-text">
-      <DeckMark className="h-11 w-11 animate-pulse" />
-      <p className="font-mono text-xs text-muted">dealing the deck…</p>
-    </main>
-  );
-}
```

## Edge Cases

### API returns some of the same projects as fallback

The `seenRef` pre-population ensures `mergeUnique` filters out any overlap. The user sees fallback data instantly, then it seamlessly updates to include any API projects not already shown.

### API is fast (responds before first paint)

If the API responds before the first paint, `mergeUnique` replaces fallback data with API data. No visual difference from current behavior.

### "API unreachable" banner

The `usingFallback` flag is only set when the API actually fails (in the `catch` block). Starting with fallback data does NOT trigger the banner. The banner only appears on genuine API failure, which is the correct behavior.

## Verification

1. Run `npm run build` — should compile without errors
2. Run `npm run preview` — the app should render the first card immediately without a spinner
3. The "API unreachable" banner should NOT appear during normal operation
4. If the API is unreachable, the banner should appear and the fallback data should remain
