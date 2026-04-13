import type { CSSProperties } from 'react'
import type { Book } from '../types'

function hashCode(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

interface BookCoverProps {
  book: Book
  compact?: boolean
}

export function BookCover({ book, compact = false }: BookCoverProps) {
  const hash = hashCode(`${book.id}-${book.title}-${book.subject}`)
  const style = {
    '--cover-hue': `${hash % 360}deg`,
    '--cover-pos-x': `${12 + (hash % 74)}%`,
    '--cover-pos-y': `${8 + ((hash >> 3) % 78)}%`,
  } as CSSProperties

  return (
    <div className={`book-cover ${compact ? 'book-cover-compact' : ''}`} style={style}>
      <div className="book-cover-top">{book.code}</div>
      <div className="book-cover-symbol">{book.coverAbbr}</div>
      <div className="book-cover-footer">
        <span>{book.subject}</span>
        <span>{book.category}</span>
      </div>
    </div>
  )
}
