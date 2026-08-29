# Phase 6: Cache Lifetime Fix (~428 KB savings)

## Root Cause

Fingerprinted production assets should have long `Cache-Control` headers since filenames change when content changes. If the deployment server doesn't set these, Lighthouse reports ~428 KB savings.

## Current State Analysis

### Fingerprinted Assets

Vite build output has fingerprinted filenames:
```
dist/assets/index-CKuu8zOR.js
dist/assets/react-vendor-DzH5Pu2p.js
dist/assets/index-CqnomLtw.css
```

These filenames change when content changes, making them safe for long-term caching.

### Cache Headers

**Problem**: The deployment server may not be setting appropriate cache headers for:
- Fingerprinted JavaScript files
- Fingerprinted CSS files
- Font files (WOFF2)
- Other static assets

### Lighthouse Report

- **Efficient cache lifetimes**: ~428 KB savings estimated

## Fix Plan

### 1. Configure `Cache-Control` for Fingerprinted Assets (Server Level)

**Deployment Server Configuration**

Add the following headers for fingerprinted assets:
```
Cache-Control: public, max-age=31536000, immutable
```

This tells the browser to cache these files for 1 year, which is safe since the filename changes when content changes.

**Nginx Example**:
```nginx
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location /fonts/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Apache Example**:
```apache
<Directory "/path/to/dist/assets">
    Header set Cache-Control "public, max-age=31536000, immutable"
</Directory>
```

**Cloudflare/CDN Example**:
Configure cache rules in the CDN dashboard to set long cache lifetimes for `/assets/*` and `/fonts/*` paths.

### 2. Configure Appropriate Caching for API Responses

**File: `bd-backend/src/routes/index.js`**

Add cache headers for API responses:
```js
router.get('/projects', async (req, res) => {
  // Set cache headers for API responses
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5 min browser, 10 min CDN
  
  // ... existing code
})
```

### 3. Configure Cache Headers for Font Files

**File: `bd-frontend/index.html`**

Already preloaded:
```html
<link rel="preload" href="/fonts/Inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/JetBrainsMono-latin.woff2" as="font" type="font/woff2" crossorigin>
```

**Deployment Server Configuration**:
```
location /fonts/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 4. Configure Cache Headers for Favicon

**Deployment Server Configuration**:
```
location /favicon.svg {
    add_header Cache-Control "public, max-age=86400"; // 1 day
}
```

## Expected Savings

- **Before**: ~428 KB of assets re-downloaded on each visit
- **After**: ~428 KB of assets cached for 1 year
- **Net improvement**: Faster subsequent page loads

## Verification

1. Run `npm run build` in `bd-frontend/`
2. Start production server: `npm run preview -- --port 4321`
3. Open Chrome DevTools Network panel
4. Check response headers for fingerprinted assets
5. Verify `Cache-Control` header is set correctly
6. Reload page and verify assets are served from cache

## Risk Assessment

- **Low risk**: Only affects caching behavior
- **No visual change**: Same assets, just cached longer
- **Test**: Verify assets are cached correctly, verify updates work after deployment

## Deployment Notes

If you cannot configure server headers from the frontend, document the required configuration for your deployment platform (Vercel, Netlify, AWS, etc.).
