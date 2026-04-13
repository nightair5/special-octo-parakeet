import { beforeEach, describe, expect, it } from 'vitest'
import { loadBucket, saveBucket, STORAGE_KEYS } from './storage'

describe('storage buckets', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves and loads arrays', () => {
    const values = ['A', 'B', 'C']
    saveBucket(STORAGE_KEYS.searchHistory, values)
    const loaded = loadBucket<string[]>(STORAGE_KEYS.searchHistory, [])
    expect(loaded).toEqual(values)
  })

  it('returns fallback for missing key', () => {
    const loaded = loadBucket<number[]>(STORAGE_KEYS.favorites, [])
    expect(loaded).toEqual([])
  })
})
