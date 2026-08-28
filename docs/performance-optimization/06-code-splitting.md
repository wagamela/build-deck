# Phase 6: Code Splitting

## Problem

The entire app is bundled into a single JavaScript file. Components that are only shown conditionally (NotFoundPage on 404, DebugPanel on Ctrl+Shift+D, IntroOverlay on first visit) are loaded upfront even when not needed.

## Solution

Use `React.lazy()` and dynamic `import()` to split non-critical components into separate chunks. Vite automatically creates separate files for each dynamic import.

## Changes

### Extract components to separate files

**Create `src/components/DebugPanel.tsx`:**

Move the following from `App.tsx`:
- `DebugButton` function (lines 196-218)
- `DebugPanel` function (lines 220-349)
- `DebugPanelProps` interface (lines 220-233)

**Create `src/components/IntroOverlay.tsx`:**

Move the following from `App.tsx`:
- `Step` function (lines 97-117)
- `StepProps` interface (lines 97-101)
- `IntroOverlay` function (lines 119-194)
- `IntroOverlayProps` interface (lines 119-121)

### Modify `src/App.tsx`

**Replace static imports with lazy imports:**

```diff
-import NotFoundPage from "./components/NotFoundPage";
+import { lazy, Suspense } from "react";
+const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
+const DebugPanel = lazy(() => import("./components/DebugPanel"));
+const IntroOverlay = lazy(() => import("./components/IntroOverlay"));
```

**Wrap lazy components in `<Suspense>`:**

For `NotFoundPage` (line 535):
```diff
-  if (window.location.pathname !== "/") return <NotFoundPage />;
+  if (window.location.pathname !== "/") {
+    return (
+      <Suspense fallback={null}>
+        <NotFoundPage />
+      </Suspense>
+    );
+  }
```

For `IntroOverlay` (line 679):
```diff
-  {showIntro && <IntroOverlay onDismiss={dismissIntro} />}
+  {showIntro && (
+    <Suspense fallback={null}>
+      <IntroOverlay onDismiss={dismissIntro} />
+    </Suspense>
+  )}
```

For `DebugPanel` (line 680):
```diff
-  {debugOpen && (
-    <DebugPanel
-      ...
-    />
-  )}
+  {debugOpen && (
+    <Suspense fallback={null}>
+      <DebugPanel
+        ...
+      />
+    </Suspense>
+  )}
```

### Remove extracted code from `App.tsx`

After extracting to separate files, remove the following from `App.tsx`:
- `StepProps` interface
- `Step` function
- `IntroOverlayProps` interface
- `IntroOverlay` function
- `DebugButton` function
- `DebugPanelProps` interface
- `DebugPanel` function

### Modify `vite.config.ts`

Add manual chunk splitting for vendor libraries:

```diff
 export default defineConfig({
   plugins: [react(), tailwindcss()],
   server: {
     proxy: {
       "/api": "http://localhost:3000",
     },
   },
+  build: {
+    rollupOptions: {
+      output: {
+        manualChunks: {
+          "react-vendor": ["react", "react-dom"],
+        },
+      },
+    },
+  },
 })
```

This separates React into its own cached chunk. Application code changes don't invalidate the React cache.

## Expected Impact

- `NotFoundPage` code (~1 KB) only loaded on 404 pages
- `DebugPanel` code (~5 KB) only loaded when debug mode is opened
- `IntroOverlay` code (~3 KB) only loaded on first visit
- React vendor chunk cached independently from app code
- Total initial bundle reduced by ~100-200 KB

## Verification

1. Run `npm run build`
2. Check `dist/assets/` — should now have multiple JS files (main chunk + vendor chunk + lazy chunks)
3. Run `npm run preview`
4. Open DevTools Network tab — confirm NotFoundPage/DebugPanel/IntroOverlay chunks are NOT loaded on initial page load
5. Trigger debug mode (Ctrl+Shift+D) — confirm DebugPanel chunk loads on demand
6. Navigate to a non-existent path — confirm NotFoundPage chunk loads on demand
