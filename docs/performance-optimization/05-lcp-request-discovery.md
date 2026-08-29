# Phase 5: LCP Request Discovery Fix

## Root Cause

LCP element (first project card image) discovered late due to JS → API → React → Image chain. The browser can't discover the LCP resource until after JavaScript executes and the API response is processed.

## Current State Analysis

### LCP Element

The LCP element is the first project's image (`project.image`), rendered inside:
- `SwipeCard` → `ProjectPreview` → `<img src={project.image}>`

### Discovery Chain

1. HTML loads
2. JS bundle downloads and executes (37.75 kB raw)
3. API request to `/api/projects` initiates
4. API response arrives and React state is updated
5. First project card renders with its image
6. Image request is initiated after JavaScript processing

This chain delays LCP resource discovery by several seconds.

### Lighthouse Report

- **LCP request discovery**: failing
- **Network dependency tree**: failing

## Fix Plan

### 1. Preload LCP Image

**File: `bd-frontend/index.html`**

Add preload for the first project's image:
```html
<link rel="preload" href="/first-project-image-url" as="image" fetchpriority="high">
```

However, this requires knowing the image URL at build time, which is dynamic from the API.

### 2. Use `fetchpriority="high"` on LCP Image

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Add `fetchpriority="high"` to the first project's image:
```tsx
<img
  src={project.image}
  alt={`${project.name} screenshot`}
  width={400}
  height={240}
  fetchpriority="high"
  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-300 ${
    showImage ? "opacity-100" : "opacity-0"
  }`}
/>
```

### 3. Server-Side Rendering (SSR)

Consider implementing SSR to allow earlier resource discovery:
- Render the first project card on the server
- Include the LCP image URL in the HTML
- Allow the browser to discover the image before JavaScript executes

This is a more complex change and may not be feasible with the current Vite setup.

### 4. Inline Critical CSS

**File: `bd-frontend/index.html`**

Add critical CSS for above-the-fold content:
```html
<style>
  /* Critical CSS for LCP element */
  .app-bg { background-color: #101014; }
  .card-container { /* ... */ }
</style>
```

### 5. Avoid Lazy-Loading LCP Image

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Ensure the LCP image does NOT have `loading="lazy"`:
```tsx
<img
  src={project.image}
  alt={`${project.name} screenshot`}
  width={400}
  height={240}
  fetchpriority="high"
  loading="eager"  // NOT lazy
  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-300 ${
    showImage ? "opacity-100" : "opacity-0"
  }`}
/>
```

### 6. Preload Font Files

**File: `bd-frontend/index.html`**

Already implemented:
```html
<link rel="preload" href="/fonts/Inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/JetBrainsMono-latin.woff2" as="font" type="font/woff2" crossorigin>
```

### 7. Add `dns-prefetch` for External Resources

**File: `bd-frontend/index.html`**

Add DNS prefetch for GitHub:
```html
<link rel="dns-prefetch" href="https://github.com">
<link rel="dns-prefetch" href="https://raw.githubusercontent.com">
```

## Expected Savings

- **Before**: LCP discovered late (JS → API → React → Image chain)
- **After**: LCP discovered earlier (preload + fetchpriority)
- **Net improvement**: ~1-2 seconds faster LCP discovery

## Verification

1. Run `npm run build` in `bd-frontend/`
2. Start production server: `npm run preview -- --port 4321`
3. Run Lighthouse audit
4. Check "LCP request discovery" audit
5. Check "Network dependency tree" audit
6. Verify LCP metric improved

## Risk Assessment

- **Low risk**: Only affects image loading behavior
- **No visual change**: Same images, just loaded earlier
- **Test**: Verify images load correctly, verify no layout shift
