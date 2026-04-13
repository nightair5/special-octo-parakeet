const STORAGE_PREFIX = 'xmu-book-drift'

export const STORAGE_KEYS = {
  favorites: `${STORAGE_PREFIX}:favorites`,
  searchHistory: `${STORAGE_PREFIX}:search-history`,
  purchases: `${STORAGE_PREFIX}:purchases`,
  requests: `${STORAGE_PREFIX}:requests`,
  feedbacks: `${STORAGE_PREFIX}:feedbacks`,
  drafts: `${STORAGE_PREFIX}:drafts`,
} as const

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadBucket<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  return safeParse<T>(window.localStorage.getItem(key), fallback)
}

export function saveBucket<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}
