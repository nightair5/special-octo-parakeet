import {
  ArrowLeft,
  CalendarClock,
  Heart,
  MapPinned,
  MessageSquareText,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookCover } from '../components/BookCover'
import { ChatPanel } from '../components/ChatPanel'
import { usePlatform } from '../state/PlatformContext'
import type { Campus } from '../types'

export function BookDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ bookId: string }>()
  const { allBooks, favorites, toggleFavorite, checkoutBook } = usePlatform()
  const [showChat, setShowChat] = useState(false)
  const [meetupTime, setMeetupTime] = useState('明天 18:30')
  const [meetupCampus, setMeetupCampus] = useState<Campus>('思明校区')
  const [submitting, setSubmitting] = useState(false)

  const book = useMemo(
    () => allBooks.find((item) => item.id === params.bookId) ?? null,
    [allBooks, params.bookId],
  )

  if (!book) {
    return (
      <section className="page detail-page missing">
        <h2>未找到该书籍</h2>
        <p>可能已下架或链接失效，请返回首页重新检索。</p>
        <Link to="/">返回首页</Link>
      </section>
    )
  }

  const onShare = async () => {
    const url = `${window.location.origin}/book/${book.id}`
    if (navigator.share) {
      await navigator.share({ title: book.title, text: book.subtitle, url })
      return
    }
    await navigator.clipboard.writeText(url)
    window.alert('分享链接已复制')
  }

  const handleCheckout = async () => {
    setSubmitting(true)
    const order = await checkoutBook(book.id, meetupTime, meetupCampus)
    setSubmitting(false)
    if (!order) return
    window.alert('已确认成交，记录已同步到“我购买的书”。')
    navigate('/profile')
  }

  return (
    <section className="page detail-page">
      <header className="detail-topbar">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          返回
        </button>
        <div className="detail-topbar-actions">
          <button className={favorites.includes(book.id) ? 'active' : ''} onClick={() => void toggleFavorite(book.id)}>
            <Heart size={16} fill={favorites.includes(book.id) ? 'currentColor' : 'none'} />
            收藏
          </button>
          <button onClick={() => void onShare()}>
            <Share2 size={16} />
            分享
          </button>
        </div>
      </header>

      <div className="detail-layout">
        <article className="detail-card">
          <div className="detail-cover-wrap">
            <BookCover book={book} />
          </div>
          <div className="detail-info">
            <span className="detail-badge">{book.category}</span>
            <h1>{book.title}</h1>
            <p className="subtitle">{book.subtitle}</p>
            <p className="desc">{book.description}</p>
            <ul>
              {book.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="detail-metrics">
              <div>
                <strong>匹配度</strong>
                <span>{book.matchScore}%</span>
              </div>
              <div>
                <strong>卖家</strong>
                <span>
                  {book.seller.name}（信用 {book.seller.credit}）
                </span>
              </div>
              <div>
                <strong>成色</strong>
                <span>{book.condition}</span>
              </div>
              <div>
                <strong>ISBN</strong>
                <span>{book.isbn}</span>
              </div>
            </div>

            <div className="detail-price">
              {book.mode === 'sell' ? `¥${book.price}` : book.mode === 'exchange' ? '等价互换' : '公益0元'}
            </div>

            <div className="detail-actions">
              <button onClick={() => setShowChat((prev) => !prev)}>
                <MessageSquareText size={16} />
                {showChat ? '收起沟通窗口' : '开始沟通'}
              </button>
            </div>
          </div>
        </article>

        <aside className="checkout-card">
          <h2>确认线下交易</h2>
          <p>确认后将写入“我购买的书”，并保存面交时间与校区。</p>
          <label>
            <CalendarClock size={14} />
            约定时间
            <input value={meetupTime} onChange={(event) => setMeetupTime(event.target.value)} />
          </label>
          <label>
            <MapPinned size={14} />
            面交校区
            <select value={meetupCampus} onChange={(event) => setMeetupCampus(event.target.value as Campus)}>
              <option value="思明校区">思明校区</option>
              <option value="翔安校区">翔安校区</option>
              <option value="海韵园区">海韵园区</option>
            </select>
          </label>
          <button onClick={() => void handleCheckout()} disabled={submitting}>
            {submitting ? '提交中...' : '确认并写入购买记录'}
          </button>
          <span className="safe-tag">
            <ShieldCheck size={14} />
            信息加密传输
          </span>
        </aside>
      </div>

      {showChat && (
        <ChatPanel
          sessionId={`book-${book.id}`}
          title={book.title}
          context={{
            kind: 'book',
            title: book.title,
            mode: book.mode,
            price: book.price,
            condition: book.condition,
            campus: book.seller.campus,
          }}
          onAgreement={() => void handleCheckout()}
        />
      )}
    </section>
  )
}
