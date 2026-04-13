import { describe, expect, it } from 'vitest'
import { generateBookDatabase } from '../data/library'
import { queryBooks } from './bookQuery'

describe('queryBooks', () => {
  const books = generateBookDatabase(120)

  it('filters by category and mode', () => {
    const result = queryBooks(books, {
      category: '专业教材',
      mode: 'sell',
      page: 1,
      pageSize: 50,
    })
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.every((book) => book.category === '专业教材' && book.mode === 'sell')).toBe(true)
  })

  it('matches keyword in title and tags', () => {
    const result = queryBooks(books, {
      q: '雅思',
      page: 1,
      pageSize: 60,
    })
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.some((book) => book.title.includes('雅思') || book.tags.join(' ').includes('雅思'))).toBe(true)
  })

  it('sorts by price descending', () => {
    const result = queryBooks(books, {
      mode: 'sell',
      sort: 'priceDesc',
      page: 1,
      pageSize: 20,
    })
    const prices = result.items.map((book) => book.price)
    const sorted = [...prices].sort((a, b) => b - a)
    expect(prices).toEqual(sorted)
  })
})
