const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function imgSrc(path: string): string {
  if (path.startsWith('http')) return path
  return `${BASE}${path}`
}
