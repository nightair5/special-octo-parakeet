import { Heart, Share2 } from 'lucide-react'
import type { Book } from '../types'
import { BookCover } from './BookCover'

interface BookCardProps {
  book: Book
  favored: boolean
  onOpen: (bookId: string) => void
  onToggleFavorite: (bookId: string) => void
  onShare: (book: Book) => void
}

export function BookCard({
  book,
  favored,
  onOpen,
  onToggleFavorite,
  onShare,
}: BookCardProps) {
  return (
    <article className="book-card">
      <button className="book-hit-area" onClick={() => onOpen(book.id)}>
        <BookCover book={book} />
      </button>
      <div className="book-card-body">
        <div className="book-card-tags">{book.tags.slice(0, 2).join(' · ')}</div>
        <h3 className="book-card-title" onClick={() => onOpen(book.id)}>
          {book.title}
        </h3>
        <p className="book-card-subtitle">{book.subtitle}</p>
        <div className="book-card-meta">
          <span>{book.seller.name}</span>
          <strong className={`mode-${book.mode}`}>
            {book.mode === 'sell' ? `¥${book.price}` : book.mode === 'exchange' ? '互换' : '0元'}
          </strong>
        </div>
        <div className="book-card-actions">
          <button
            className={`icon-btn ${favored ? 'active' : ''}`}
            onClick={() => onToggleFavorite(book.id)}
            aria-label="favorite"
          >
            <Heart size={16} fill={favored ? 'currentColor' : 'none'} />
            收藏
          </button>
          <button className="icon-btn" onClick={() => onShare(book)} aria-label="share">
            <Share2 size={16} />
            分享
          </button>
        </div>
      </div>
    </article>
  )
}
