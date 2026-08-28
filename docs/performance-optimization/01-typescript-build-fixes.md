# Phase 1: TypeScript Build Fixes

## Problem

The production build (`npm run build`) fails with 3 TypeScript errors due to `noUnusedLocals: true` and `noUnusedParameters: true` in `tsconfig.app.json`. These must be fixed before any other optimization work can be verified.

## Errors

```
src/App.tsx(238,3): error TS6133: 'total' is declared but its value is never read.
src/components/DiscoveryDeck.tsx(76,9): error TS6133: '_position' is declared but its value is never read.
src/components/SwipeCard.tsx(94,3): error TS6133: 'total' is declared but its value is never read.
```

## Changes

### `src/App.tsx`

**Line 225 (DebugPanelProps interface):** Remove the `total` property.

```diff
 interface DebugPanelProps {
   project: Project;
   activeIndex: number;
-  total: number;
   history: HistoryEntry[];
   showIntro: boolean;
```

**Line 248 (DebugPanel function params):** Remove `total` from destructured params.

```diff
 function DebugPanel({
   project,
   activeIndex,
-  total,
   history,
```

**Line 681 (DebugPanel usage in JSX):** Remove the `total` prop being passed.

```diff
 <DebugPanel
   project={projects[activeIndex]}
   activeIndex={activeIndex}
-  total={total}
   history={history}
```

### `src/components/DiscoveryDeck.tsx`

**Line 76:** Remove the unused `_position` variable.

```diff
   const total = deck.length;
   const topIndex = counter;
-  const _position = topIndex + 1;
   const { isLoaded } = useImagePreloader(deck, topIndex);
```

### `src/components/SwipeCard.tsx`

**Line 86-90 (SwipeCardProps interface):** Remove the `total` property.

```diff
 interface SwipeCardProps {
   project: Project;
-  total: number;
   imageLoaded: boolean;
 }
```

**Line 92-96 (SwipeCard function params):** Remove `total` from destructured params.

```diff
 export default function SwipeCard({
   project,
-  total,
   imageLoaded,
 }: SwipeCardProps) {
```

**Line 211 (SwipeCard usage in DiscoveryDeck.tsx):** Remove the `total` prop.

```diff
-<SwipeCard project={project} total={total} imageLoaded={isLoaded(project.image)} />
+<SwipeCard project={project} imageLoaded={isLoaded(project.image)} />
```

## Verification

Run `npm run build` from `bd-frontend/` and confirm it completes without errors.
