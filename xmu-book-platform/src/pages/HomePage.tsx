import { Compass, Filter, Search, Sparkles, TrendingUp } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { BookCard } from '../components/BookCard'
import { DashboardPanel } from '../components/DashboardPanel'
import { PhoenixBackground } from '../components/PhoenixBackground'
import { BOOK_CATEGORIES } from '../data/library'
import { queryBooks } from '../lib/bookQuery'
import { usePlatform } from '../state/PlatformContext'
import type { BookSort, Campus, TradeMode } from '../types'

function shareBookLink(bookId: string): string {
  return `${window.location.origin}/book/${bookId}`
}

export function HomePage() {
  const { openPublish } = useOutletContext<{ openPublish: () => void }>()
  const navigate = useNavigate()
  const {
    allBooks,
    requests,
    purchases,
    favorites,
    toggleFavorite,
    addSearchHistory,
    searchHistory,
    createRequest,
  } = usePlatform()

  const [q, setQ] = useState('')
  const [mode, setMode] = useState<TradeMode | 'all'>('all')
  const [category, setCategory] = useState('全部学科')
  const [sort, setSort] = useState<BookSort>('latest')
  const [showHistory, setShowHistory] = useState(false)

  const deferredQuery = useDeferredValue(q)

  const result = useMemo(
    () =>
      queryBooks(allBooks, {
        q: deferredQuery,
        mode,
        category,
        sort,
        page: 1,
        pageSize: 80,
      }),
    [allBooks, deferredQuery, mode, category, sort],
  )

  const submitQuickRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await createRequest({
      title: String(form.get('title')),
      category: String(form.get('category')),
      keywords: String(form.get('keywords'))
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      budgetText: String(form.get('budgetText')),
      budgetValue: Number(form.get('budgetValue') ?? 0),
      campus: String(form.get('campus')) as Campus,
      description: String(form.get('description')),
    })
    event.currentTarget.reset()
  }

  const handleShare = async (bookId: string) => {
    const url = shareBookLink(bookId)
    if (navigator.share) {
      await navigator.share({ title: '凤凰书漂流', text: '这本书挺适合你的，发你看看', url })
      return
    }
    await navigator.clipboard.writeText(url)
    window.alert('分享链接已复制')
  }

  return (
    <div className="page home-page">
      <section className="hero-section">
        <PhoenixBackground />
        <div className="hero-copy">
          <h1>厦大二手书漂流平台</h1>
          <p>厦门大学二手书与学习资料交易平台</p>
          <div className="hero-actions">
            <button onClick={openPublish}>发布资源</button>
            <Link to="/wanted">进入求购页</Link>
          </div>
        </div>
      </section>

      <section className="market-section">
        <header className="section-header">
          <div>
            <h2>
              <Compass size={18} />
              学术书籍主市场
            </h2>
            <p>支持多学科分类、交易模式筛选与丰富书籍介绍信息</p>
          </div>
          <div className="market-count">
            <TrendingUp size={16} />
            共 {result.total} 本可匹配
          </div>
        </header>

        <div className="search-panel">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              value={q}
              onFocus={() => setShowHistory(true)}
              onChange={(event) => setQ(event.target.value)}
              placeholder="搜索书名、课程代码、关键词..."
            />
            <button
              onClick={() => {
                addSearchHistory(q)
                setShowHistory(false)
              }}
            >
              检索
            </button>
            {showHistory && searchHistory.length > 0 && (
              <div className="search-history">
                {searchHistory.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQ(item)
                      setShowHistory(false)
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-row">
            <span>
              <Filter size={14} />
              交易模式
            </span>
            <button className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>
              全部
            </button>
            <button className={mode === 'sell' ? 'active' : ''} onClick={() => setMode('sell')}>
              定价
            </button>
            <button className={mode === 'exchange' ? 'active' : ''} onClick={() => setMode('exchange')}>
              互换
            </button>
            <button className={mode === 'free' ? 'active' : ''} onClick={() => setMode('free')}>
              公益0元
            </button>
          </div>

          <div className="chips">
            {BOOK_CATEGORIES.map((item) => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
            <select value={sort} onChange={(event) => setSort(event.target.value as BookSort)}>
              <option value="latest">最新发布</option>
              <option value="matchDesc">匹配度优先</option>
              <option value="priceAsc">价格升序</option>
              <option value="priceDesc">价格降序</option>
              <option value="creditDesc">卖家信用</option>
            </select>
          </div>
        </div>

        <div className="book-grid">
          {result.items.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              favored={favorites.includes(book.id)}
              onOpen={(bookId) => {
                addSearchHistory(book.title)
                navigate(`/book/${bookId}`)
              }}
              onToggleFavorite={(bookId) => void toggleFavorite(bookId)}
              onShare={(book) => void handleShare(book.id)}
            />
          ))}
        </div>
      </section>

      <section className="preview-row">
        <article className="request-preview">
          <header>
            <h3>求购信息快览</h3>
            <Link to="/wanted">查看全部</Link>
          </header>
          <div className="request-list">
            {requests.slice(0, 3).map((item) => (
              <Link to={`/wanted/${item.id}`} key={item.id} className="request-item">
                <strong>{item.title}</strong>
                <span>{item.budgetText}</span>
                <small>
                  {item.campus} · 响应 {item.responses}
                </small>
              </Link>
            ))}
          </div>
        </article>

        <article className="quick-request-card">
          <header>
            <Sparkles size={16} />
            快速发布求购
          </header>
          <form onSubmit={submitQuickRequest}>
            <input name="title" required placeholder="求购书名 / 资料名" />
            <div className="publish-grid-2">
              <select name="category" defaultValue="专业教材">
                {BOOK_CATEGORIES.filter((item) => item !== '全部学科').map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select name="campus" defaultValue="思明校区">
                <option value="思明校区">思明校区</option>
                <option value="翔安校区">翔安校区</option>
                <option value="海韵园区">海韵园区</option>
              </select>
            </div>
            <input name="keywords" defaultValue="课程代码, 版本, 题库" />
            <div className="publish-grid-2">
              <input name="budgetText" defaultValue="¥30 或互换" />
              <input name="budgetValue" type="number" defaultValue={30} />
            </div>
            <textarea
              name="description"
              rows={2}
              defaultValue="期望成色八成新及以上，可晚间图书馆面交。"
            />
            <button type="submit">发布求购</button>
          </form>
        </article>
      </section>

      <DashboardPanel books={allBooks} requests={requests} purchases={purchases} />
    </div>
  )
}
