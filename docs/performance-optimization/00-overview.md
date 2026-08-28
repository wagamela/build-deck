# Performance Optimization Plan

## Current Lighthouse Results

| Metric | Value |
|---|---|
| Performance | 57 |
| FCP | 3.7s |
| LCP | 7.6s |
| Speed Index | 3.9s |
| TBT | 0ms |
| CLS | 0 |
| JavaScript savings | ~6,040 KiB |
| Unused JavaScript | ~424 KiB |
| Network payload | ~8,343 KiB |
| Image delivery savings | ~429 KiB |
| Cache lifetime savings | ~578 KiB |
| Render-blocking savings | ~160ms |

## Root Cause Analysis

| Problem | Cause | Location |
|---|---|---|
| LCP 7.6s | App shows spinner until API responds (~49 GitHub API calls per batch) | `useProjects.ts:18` initializes `[]`, `App.tsx:536` gates on `projects.length === 0` |
| FCP 3.7s | Google Fonts `<link rel="stylesheet">` is render-blocking | `index.html:9-12` |
| ~424 KiB unused JS | `fallbackProjects` (8 full objects) always bundled, only used on API failure | `data/projects.ts:28-213` imported unconditionally |
| ~8.3 MB network | External fonts + large API response + 3-ahead image preloading + eager avatar loading | Multiple locations |
| Render-blocking ~160ms | External Google Fonts CSS in `<head>` | `index.html:9-12` |

## Execution Order

| Step | Phase | Impact | Files Changed |
|---|---|---|---|
| 1 | TypeScript build fixes | Unblocks production build | `App.tsx`, `DiscoveryDeck.tsx`, `SwipeCard.tsx` |
| 2 | Fallback data initialization | LCP 7.6s → ~1.5s | `useProjects.ts`, `App.tsx` |
| 3 | Self-host Google Fonts | FCP 3.7s → ~1.2s | `index.html`, `index.css`, `public/fonts/*` |
| 4 | Image optimization | ~500 KB network saved | `useImagePreloader.ts`, `SwipeCard.tsx` |
| 5 | Backend in-memory cache | API latency near-zero on cache hit | `github.js`, new `cache.js` |
| 6 | Code splitting | ~100-200 KB JS saved | `App.tsx`, new component files, `vite.config.ts` |

## Expected Results

| Metric | Before | After |
|---|---|---|
| Performance | 57 | 90+ |
| FCP | 3.7s | <1.5s |
| LCP | 7.6s | <2.0s |
| TBT | 0ms | <50ms |
| CLS | 0 | 0 |
| Network Payload | ~8.3 MB | <3 MB |
| JS Transfer | ~6 MB | <300 KB |

## Constraints

- Do not redesign the UI or change visual design
- Do not add artificial timeouts or loading tricks
- Do not hide content from Lighthouse to inflate scores
- Do not replace working functionality with mocks
- Do not disable features for performance
- Do not blindly add memoization everywhere
- The optimization must be a real performance improvement, not a Lighthouse score hack
