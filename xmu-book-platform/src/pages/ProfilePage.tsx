import { Bookmark, MessageSquareWarning, Radar, ShoppingBag, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCover } from '../components/BookCover'
import { usePlatform } from '../state/PlatformContext'

type TabId = 'favorites' | 'wanted' | 'purchases' | 'feedback' | 'history'

const REQUEST_STATUS_LABEL: Record<string, string> = {
  open: '征集中',
  matched: '已匹配',
  closed: '已关闭',
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'favorites', label: '喜欢收藏的书' },
  { id: 'wanted', label: '我求购的书' },
  { id: 'purchases', label: '我购买的书' },
  { id: 'feedback', label: '建议与反馈' },
  { id: 'history', label: '搜索记录' },
]

export function ProfilePage() {
  const {
    profile,
    allBooks,
    favorites,
    requests,
    purchases,
    feedbacks,
    searchHistory,
    clearSearchHistory,
    submitFeedback,
  } = usePlatform()
  const [tab, setTab] = useState<TabId>('favorites')
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackContact, setFeedbackContact] = useState('')

  const favoriteBooks = useMemo(
    () => favorites.map((id) => allBooks.find((book) => book.id === id)).filter(Boolean),
    [favorites, allBooks],
  )
  const myRequests = requests.filter((item) => item.requesterId === profile?.id)

  const sendFeedback = async () => {
    const content = feedbackText.trim()
    if (!content) return
    await submitFeedback(content, feedbackContact.trim() || undefined)
    setFeedbackText('')
    setFeedbackContact('')
  }

  return (
    <section className="page profile-page">
      <header className="profile-header">
        <div>
          <h1>{profile?.name ?? '个人中心'}</h1>
          <p>
            {profile?.school} · {profile?.major} · {profile?.grade}
          </p>
        </div>
        <div className="profile-score">
          <span>信用 {profile?.credit ?? '--'}</span>
          <strong>绿色贡献 {profile?.greenScore ?? '--'}</strong>
        </div>
      </header>

      <div className="profile-layout">
        <aside className="profile-tabs">
          {TABS.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div className="profile-content">
          {tab === 'favorites' && (
            <section>
              <h2>
                <Bookmark size={16} />
                喜欢收藏的书
              </h2>
              <div className="profile-grid">
                {favoriteBooks.length === 0 && <p className="empty">还没有收藏，先去市场看看吧。</p>}
                {favoriteBooks.map((book) =>
                  book ? (
                    <Link to={`/book/${book.id}`} key={book.id} className="profile-book-card">
                      <BookCover book={book} compact />
                      <div>
                        <strong>{book.title}</strong>
                        <small>{book.mode === 'sell' ? `¥${book.price}` : book.mode === 'exchange' ? '互换' : '0元'}</small>
                      </div>
                    </Link>
                  ) : null,
                )}
              </div>
            </section>
          )}

          {tab === 'wanted' && (
            <section>
              <h2>
                <Radar size={16} />
                我求购的书
              </h2>
              <div className="profile-list">
                {myRequests.length === 0 && <p className="empty">你还没有发布求购。</p>}
                {myRequests.map((item) => (
                  <Link to={`/wanted/${item.id}`} className="profile-list-item" key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.budgetText}</span>
                    <small>
                      {REQUEST_STATUS_LABEL[item.status] ?? item.status} · 响应 {item.responses}
                    </small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {tab === 'purchases' && (
            <section>
              <h2>
                <ShoppingBag size={16} />
                我购买的书
              </h2>
              <div className="profile-list">
                {purchases.length === 0 && <p className="empty">还没有交易记录。</p>}
                {purchases.map((item) => (
                  <article className="profile-list-item" key={item.id}>
                    <strong>{item.bookTitle}</strong>
                    <span>{item.mode === 'sell' ? `¥${item.amount}` : item.mode === 'exchange' ? '互换' : '公益0元'}</span>
                    <small>
                      {item.meetupCampus} · {item.meetupTime}
                    </small>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === 'feedback' && (
            <section>
              <h2>
                <MessageSquareWarning size={16} />
                建议与反馈
              </h2>
              <div className="feedback-box">
                <textarea
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  rows={4}
                  placeholder="请写下功能建议、体验问题或改进方向..."
                />
                <input
                  value={feedbackContact}
                  onChange={(event) => setFeedbackContact(event.target.value)}
                  placeholder="联系方式（可选）"
                />
                <button onClick={() => void sendFeedback()}>提交反馈</button>
              </div>
              <div className="profile-list">
                {feedbacks.length === 0 && <p className="empty">尚无反馈记录。</p>}
                {feedbacks.map((item) => (
                  <article className="profile-list-item" key={item.id}>
                    <strong>{item.content}</strong>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === 'history' && (
            <section>
              <h2>
                <SearchHistoryIcon />
                搜索记录
              </h2>
              <div className="history-wrap">
                {searchHistory.length === 0 && <p className="empty">暂无检索记录。</p>}
                {searchHistory.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <button className="clear-btn" onClick={clearSearchHistory}>
                <Trash2 size={14} />
                清空记录
              </button>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}

function SearchHistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
