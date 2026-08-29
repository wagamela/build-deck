# Phase 4: Image Delivery Optimization (~790 KB savings)

## Root Cause

Project images from GitHub READMEs download at full resolution but display at card dimensions well under 400px wide. No `width`/`height` attributes. No `loading="lazy"`. No format optimization.

## Current State Analysis

### Image Sources

1. **Project images** (`project.image`): Fetched from GitHub README via `fetchReadmeImage()`
   - Can be any resolution (often 1000+ px wide)
   - Displayed at card dimensions (~400px wide on mobile)

2. **Owner avatars** (`project.ownerAvatarUrl`): GitHub avatar URLs
   - Format: `https://github.com/username.png?size=96`
   - Already optimized to 96x96

3. **Contributor avatars** (`contributor.avatarUrl`): GitHub avatar URLs
   - Format: `https://github.com/username.png?size=96`
   - Already optimized to 96x96

### Missing Attributes

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Project image:
```tsx
<img
  src={project.image}
  alt={`${project.name} screenshot`}
  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-300 ${
    showImage ? "opacity-100" : "opacity-0"
  }`}
/>
```

Missing:
- `width` attribute
- `height` attribute
- `loading="lazy"` attribute
- `sizes` attribute

Contributor avatars:
```tsx
<img
  key={contributor.login}
  src={contributor.avatarUrl}
  alt={`${contributor.login} profile photo`}
  width="24"
  height="24"
  loading="lazy"
  className="h-6 w-6 rounded-full border-2 border-neutral bg-surface object-cover"
  style={{ marginLeft: index === 0 ? 0 : -7 }}
/>
```

Already has `width`/`height` and `loading="lazy"` - no changes needed.

## Fix Plan

### 1. Add Dimensions to Project Images

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Current:
```tsx
<img
  src={project.image}
  alt={`${project.name} screenshot`}
  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-300 ${
    showImage ? "opacity-100" : "opacity-0"
  }`}
/>
```

Change to:
```tsx
<img
  src={project.image}
  alt={`${project.name} screenshot`}
  width={400}
  height={240}
  loading="lazy"
  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-300 ${
    showImage ? "opacity-100" : "opacity-0"
  }`}
/>
```

### 2. Add Responsive Image Sizing

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
  className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-300 ${
    showImage ? "opacity-100" : "opacity-0"
  }`}
/>
```

### 3. Add Lazy-Loading to Non-Critical Images

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Owner avatar:
```tsx
<img
  src={project.ownerAvatarUrl}
  alt={`${project.owner} profile photo`}
  width="20"
  height="20"
  loading="lazy"
  className="h-5 w-5 rounded-full border border-line bg-surface"
/>
```

Already has `width`/`height` and `loading="lazy"` - no changes needed.

### 4. Lazy-Load Project Images

**File: `bd-frontend/src/hooks/useImagePreloader.ts`**

Current behavior preloads 1 image ahead:
```ts
const PRELOAD_AHEAD = 1;
```

Consider reducing to 0 for mobile:
```ts
const PRELOAD_AHEAD = window.innerWidth < 640 ? 0 : 1;
```

### 5. Add Aspect Ratio Box

**File: `bd-frontend/src/components/SwipeCard.tsx`**

Add aspect ratio container to prevent layout shift:
```tsx
<div className="mt-1.5 flex h-24 shrink-0 flex-col overflow-hidden rounded-md border border-line bg-surface sm:mt-3 sm:h-40">
  <div className="relative aspect-[5/3] w-full">
    <ProjectPreview project={project} imageLoaded={imageLoaded} />
  </div>
</div>
```

## Expected Savings

- **Before**: ~790 KB of image data downloaded unnecessarily
- **After**: ~500 KB of image data downloaded (with lazy loading and smaller sizes)
- **Net reduction**: ~290 KB of image data

## Verification

1. Run `npm run build` in `bd-frontend/`
2. Start production server: `npm run preview -- --port 4321`
3. Open Chrome DevTools Network panel
4. Check image sizes and load order
5. Verify images render correctly
6. Verify no layout shift (CLS)

## Risk Assessment

- **Low risk**: Only affects image attributes and loading behavior
- **No visual change**: Same images, just better optimized
- **Test**: Verify all images render correctly, verify no layout shift
