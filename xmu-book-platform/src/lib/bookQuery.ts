import type { Book, BookQuery, BookSort, PagedResult } from '../types'

function matchText(book: Book, text: string): boolean {
  const q = text.trim().toLowerCase()
  if (!q) return true
  return [
    book.title,
    book.subtitle,
    book.code,
    book.subject,
    book.category,
    ...book.tags,
    book.description,
  ]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

function sortBooks(items: Book[], sort: BookSort): Book[] {
  const cloned = [...items]
  switch (sort) {
    case 'priceAsc':
      return cloned.sort((a, b) => a.price - b.price)
    case 'priceDesc':
      return cloned.sort((a, b) => b.price - a.price)
    case 'creditDesc':
      return cloned.sort((a, b) => b.seller.credit - a.seller.credit)
    case 'matchDesc':
      return cloned.sort((a, b) => b.matchScore - a.matchScore)
    case 'latest':
    default:
      return cloned.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

export function queryBooks(books: Book[], query: BookQuery = {}): PagedResult<Book> {
  const {
    q = '',
    category = '全部学科',
    mode = 'all',
    sort = 'latest',
    page = 1,
    pageSize = 24,
  } = query

  const filtered = books.filter((book) => {
    const matchQ = matchText(book, q)
    const matchCategory = category === '全部学科' || book.category === category
    const matchMode = mode === 'all' || book.mode === mode
    return matchQ && matchCategory && matchMode
  })

  const sorted = sortBooks(filtered, sort)
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  const items = sorted.slice(start, start + pageSize)

  return {
    items,
    total: sorted.length,
    page: safePage,
    pageSize,
  }
}
