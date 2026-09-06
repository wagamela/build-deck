const PROXY_BASE = '/api/image-proxy'

/**
 * The card preview box is at most `min(92vw, 28.5rem)` wide minus padding, so
 * ~456 CSS px. These widths cover that up to a 2x display; anything larger is
 * bytes the browser downloads and then scales down.
 */
export const RESPONSIVE_WIDTHS = [320, 480, 640, 960] as const

/** Matches the preview box in SwipeCard so the browser picks the right width. */
export const CARD_IMAGE_SIZES = '(max-width: 640px) 88vw, 27rem'

export function proxyUrl(url: string, width?: number, format?: 'webp' | 'avif'): string {
  const params = new URLSearchParams({ url })
  if (width) params.set('w', String(width))
  if (format) params.set('fmt', format)
  return `${PROXY_BASE}?${params.toString()}`
}

/**
 * The card's default srcSet. Preloaders must use this exact string alongside
 * `CARD_IMAGE_SIZES`, otherwise the browser resolves the preload to a
 * different width than the one it later renders and downloads the image twice.
 */
export function cardSrcSet(url: string): string {
  return RESPONSIVE_WIDTHS.map((w) => `${proxyUrl(url, w)} ${w}w`).join(', ')
}

export interface PictureSource {
  type: string
  srcSet: string
  sizes: string
}

export function pictureSources(
  url: string,
  sizes: string,
  widths: readonly number[] = RESPONSIVE_WIDTHS,
): PictureSource[] {
  return [
    {
      type: 'image/avif',
      srcSet: widths.map((w) => `${proxyUrl(url, w, 'avif')} ${w}w`).join(', '),
      sizes,
    },
    {
      type: 'image/webp',
      srcSet: widths.map((w) => `${proxyUrl(url, w, 'webp')} ${w}w`).join(', '),
      sizes,
    },
  ]
}
