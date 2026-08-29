# Phase 7: Long Main-Thread Task Fix

## Root Cause

Main thread blocked during initial data fetch + React render. Multiple GitHub API calls during `fetchRepoDetails` processing create a long task that contributes to TBT and FID metrics.

## Current State Analysis

### Main Thread Blocking Points

1. **API fetch for projects** (`/api/projects`)
   - Fetches 9+ projects from GitHub API
   - Each project requires multiple API calls

2. **Processing `fetchRepoDetails` calls**
   - Each project requires 3+ GitHub API requests:
     - Repository details
     - Languages
     - Contributors (with count)
     - README image extraction

3. **Rendering 9+ project cards**
   - Each card has multiple components
   - Event listeners and state setup

4. **Setting up event listeners**
   - Keyboard shortcuts
   - Touch/pointer events
   - Window events

### Lighthouse Report

- **1 long main-thread task**: Blocking input responsiveness
- **High TBT**: Total Blocking Time affected by long task

## Fix Plan

### 1. Reduce Initial Data Processing

**File: `bd-frontend/src/hooks/useProjects.ts`**

Current:
```ts
const batch = await fetchBatch();
```

Change to:
```ts
const batch = await fetchBatch(3); // Fetch only 3 projects initially
```

This reduces the number of projects to process and render.

### 2. Defer Non-Critical Event Listeners

**File: `bd-frontend/src/App.tsx`**

Current:
```ts
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    // ... keyboard handling
  }
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

Change to:
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

### 3. Use `requestIdleCallback` for Non-Critical Work

**File: `bd-frontend/src/components/DiscoveryDeck.tsx`**

Current:
```ts
useEffect(() => {
  if (deck.length - topIndex > REFILL_THRESHOLD) return;
  if (refillInFlightRef.current) return;
  refillInFlightRef.current = true;
  Promise.resolve(onRefillRef.current?.()).finally(() => {
    refillInFlightRef.current = false;
  });
}, [topIndex, deck.length]);
```

Change to:
```ts
useEffect(() => {
  if (deck.length - topIndex > REFILL_THRESHOLD) return;
  if (refillInFlightRef.current) return;
  
  // Defer refill until after idle
  const idleCallback = requestIdleCallback(() => {
    refillInFlightRef.current = true;
    Promise.resolve(onRefillRef.current?.()).finally(() => {
      refillInFlightRef.current = false;
    });
  });
  
  return () => cancelIdleCallback(idleCallback);
}, [topIndex, deck.length]);
```

### 4. Move Data Processing Off Main Thread

**Option A: Web Workers**

Create a worker to process GitHub API responses:
```js
// src/workers/projectProcessor.js
self.onmessage = function(e) {
  const { projects } = e.data;
  // Process projects in worker
  const processed = projects.map(project => {
    // ... processing logic
  });
  self.postMessage(processed);
};
```

**Option B: Defer Processing Until After FCP**

```ts
useEffect(() => {
  // Wait for FCP before processing
  if (document.querySelector('[data-fcp]')) {
    processProjects();
  } else {
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-fcp]')) {
        processProjects();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}, []);
```

### 5. Optimize React Rendering

**File: `bd-frontend/src/components/DiscoveryDeck.tsx`**

Consider memoizing components:
```tsx
const SwipeCard = React.memo(({ project, imageLoaded }) => {
  // ... component logic
});
```

### 6. Reduce DOM Operations

**File: `bd-frontend/src/components/DiscoveryDeck.tsx`**

Current:
```tsx
const stack = [0, 1, 2].flatMap((offset) => {
  const project = deck[topIndex + offset];
  return project ? [{ project, key: counter + offset, offset }] : [];
});
```

This creates a new array on every render. Consider memoizing:
```tsx
const stack = useMemo(() => {
  return [0, 1, 2].flatMap((offset) => {
    const project = deck[topIndex + offset];
    return project ? [{ project, key: counter + offset, offset }] : [];
  });
}, [deck, topIndex, counter]);
```

## Expected Savings

- **Before**: Long main-thread task blocking input responsiveness
- **After**: Shorter main-thread tasks, better input responsiveness
- **Net improvement**: ~50-100ms reduction in main-thread blocking

## Verification

1. Run `npm run build` in `bd-frontend/`
2. Start production server: `npm run preview -- --port 4321`
3. Run Lighthouse audit
4. Check "Avoid long main-thread tasks" audit
5. Check "Total Blocking Time" metric
6. Verify no visual changes

## Risk Assessment

- **Medium risk**: Changes to event handling and rendering
- **No visual change**: Same functionality, just optimized timing
- **Test**: Verify all interactions work correctly, verify no regressions
