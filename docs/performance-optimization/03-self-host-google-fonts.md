# Phase 3: Self-Host Google Fonts

## Problem

Google Fonts are loaded via an external `<link rel="stylesheet">` in `index.html`. This is render-blocking: the browser must download and parse the CSS file before rendering any pixel. The CSS file then references font files on `fonts.gstatic.com` (a different origin), requiring additional DNS lookups, connections, and downloads.

**Current render-blocking chain:**
1. Browser parses `<head>`
2. Encounters `<link rel="stylesheet" href="https://fonts.googleapis.com/...">`
3. Must download and parse this CSS before rendering
4. CSS references font files on `fonts.gstatic.com`
5. Browser must resolve DNS, connect, and download each font file
6. Only then can text render with the correct font

**Total impact:** ~160ms render-blocking + multiple external network requests.

## Solution

Self-host the exact font weights the app uses. Serve them from the same origin as the app. Use `font-display: swap` so text renders immediately with fallback fonts.

## Font Inventory

From the Google Fonts URL: `Inter:wght@400;500;600` and `JetBrains Mono:wght@400;500`

| Font | Weight | File | Usage |
|---|---|---|---|
| Inter | 400 | `Inter-Regular.woff2` | Body text, descriptions |
| Inter | 500 | `Inter-Medium.woff2` | Labels, stats |
| Inter | 600 | `Inter-SemiBold.woff2` | Headings, card titles |
| JetBrains Mono | 400 | `JetBrainsMono-Regular.woff2` | Monospace text, keyboard hints |
| JetBrains Mono | 500 | `JetBrainsMono-Medium.woff2` | Code, debug panel |

## Changes

### Create font files

Download WOFF2 files for each weight listed above and place them in `bd-frontend/public/fonts/`.

Sources for downloading Google Fonts as WOFF2:
- Use https://gwfh.mranftl.com/fonts (google-webfonts-helper)
- Or download directly from `fonts.gstatic.com` by inspecting the CSS response

### `index.html`

**Remove lines 7-12:** Delete the Google Fonts `<link rel="preconnect">` and `<link rel="stylesheet">` tags.

```diff
-    <link rel="preconnect" href="https://fonts.googleapis.com" />
-    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
-    <link
-      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
-      rel="stylesheet"
-    />
```

**Add preload hints** for the two most critical font files (Inter 400 and Inter 600):

```html
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Inter-SemiBold.woff2" as="font" type="font/woff2" crossorigin>
```

### `src/index.css`

Add `@font-face` declarations after the existing `@theme` block (after line 23):

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/Inter-Regular.woff2") format("woff2");
}

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/Inter-Medium.woff2") format("woff2");
}

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/Inter-SemiBold.woff2") format("woff2");
}

@font-face {
  font-family: "JetBrains Mono";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2");
}

@font-face {
  font-family: "JetBrains Mono";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/JetBrainsMono-Medium.woff2") format("woff2");
}
```

The existing `--font-sans: "Inter"` and `--font-mono: "JetBrains Mono"` CSS custom properties reference these font family names — no changes needed there.

## Why This Works

- **No external requests:** Fonts are served from the same origin as the app
- **No render-blocking CSS:** The `<link rel="preload">` hints tell the browser to start downloading fonts early, but don't block rendering
- **`font-display: swap`:** Text renders immediately with system fallback fonts, then swaps to the custom font once loaded
- **Fewer network round trips:** Eliminates DNS lookup + TCP connection + TLS handshake for `fonts.googleapis.com` and `fonts.gstatic.com`

## Verification

1. Run `npm run build`
2. Run `npm run preview`
3. Open DevTools Network tab — confirm no requests to `fonts.googleapis.com` or `fonts.gstatic.com`
4. Confirm fonts render correctly (Inter for body/headings, JetBrains Mono for code)
5. Run Lighthouse — confirm render-blocking resources reduced
