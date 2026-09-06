const PROXY_BASE = '/api/image-proxy'

const RESPONSIVE_WIDTHS = [400, 600, 800, 1200] as const

export function proxyUrl(url: string, width?: number, format?: 'webp' | 'avif'): string {
  const params = new URLSearchParams({ url })
  if (width) params.set('w', String(width))
  if (format) params.set('fmt', format)
  return `${PROXY_BASE}?${params.toString()}`
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
