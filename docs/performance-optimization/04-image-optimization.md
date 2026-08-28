# Phase 4: Image Optimization

## Problem

1. **Aggressive preloading:** `useImagePreloader` preloads 3 images ahead for every card position change, downloading large screenshot images that may never be viewed
2. **Eager avatar loading:** Owner avatars and contributor avatars are loaded eagerly on every card, even though they are below the fold on the top card
3. **No explicit image dimensions:** `<img>` tags lack `width`/`height` attributes, which can contribute to layout shift during loading

## Changes

### `src/hooks/useImagePreloader.ts`

**Line 4:** Reduce `PRELOAD_AHEAD` from `3` to `1`.

```diff
-const PRELOAD_AHEAD = 3;
+const PRELOAD_AHEAD = 1;
```

This only preloads the immediately next card's image instead of 3 ahead. Reduces unnecessary image downloads by ~66%.

### `src/components/SwipeCard.tsx`

**Lines 113-118 (owner avatar):** Add `loading="lazy"` and explicit dimensions.

```diff
 <img
   src={project.ownerAvatarUrl}
   alt={`${project.owner} profile photo`}
+  width="20"
+  height="20"
   loading="lazy"
   className="h-5 w-5 rounded-full border border-line bg-surface"
 />
```

**Lines 167-174 (contributor avatars):** Add `loading="lazy"` and explicit dimensions.

```diff
 <img
   key={contributor.login}
   src={contributor.avatarUrl}
   alt={`${contributor.login} profile photo`}
+  width="24"
+  height="24"
   loading="lazy"
   className="h-6 w-6 rounded-full border-2 border-neutral bg-surface object-cover"
   style={{ marginLeft: index === 0 ? 0 : -7 }}
 />
```

**Do NOT** add `loading="lazy"` to the main project preview image on the top card — it is the LCP image and must load eagerly.

### What NOT to change

- The main `ProjectPreview` image (lines 37-43) — this is the LCP image and must load eagerly
- The image preloader itself still works the same way, just with a smaller lookahead window

## Expected Impact

- ~500 KB reduction in initial network payload (fewer images preloaded)
- Faster initial page load (less bandwidth contention for critical resources)
- Explicit image dimensions prevent any potential layout shift

## Verification

1. Run `npm run build`
2. Run `npm run preview`
3. Swipe through cards — confirm images still load smoothly
4. Open DevTools Network tab — confirm fewer image requests during initial load
5. Verify no layout shift when images load (CLS should remain 0)
