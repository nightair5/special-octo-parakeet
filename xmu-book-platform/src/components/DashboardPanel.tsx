import type { Book, Order, RequestPost } from '../types'

interface DashboardPanelProps {
  books: Book[]
  requests: RequestPost[]
  purchases: Order[]
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function computeCategoryDistribution(books: Book[]) {
  const counts = new Map<string, number>()
  books.forEach((book) => {
    counts.set(book.category, (counts.get(book.category) ?? 0) + 1)
  })
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count]) => ({ category, count }))
}

export function DashboardPanel({ books, requests, purchases }: DashboardPanelProps) {
  const categoryRows = computeCategoryDistribution(books)
  const openRequests = requests.filter((item) => item.status === 'open').length
  const matchedRequests = requests.filter((item) => item.status === 'matched').length
  const soldBooks = purchases.length
  const conversion = requests.length > 0 ? soldBooks / requests.length : 0
  const greenScore = soldBooks * 1.8 + matchedRequests * 0.9
  const maxCategory = categoryRows[0]?.count ?? 1

  return (
    <section className="dashboard-panel">
      <header>
        <h2>平台运营看板</h2>
        <p>提案展示与交易运营指标合并呈现，便于比赛路演时统一讲述增长路径。</p>
      </header>

      <div className="kpi-grid">
        <article>
          <span>书籍总量</span>
          <strong>{books.length}</strong>
          <small>覆盖教材 / 教辅 / 名著 / 考研考公 / 语言学习</small>
        </article>
        <article>
          <span>活跃求购</span>
          <strong>{openRequests}</strong>
          <small>等待响应，支持一键进入沟通</small>
        </article>
        <article>
          <span>成交转化</span>
          <strong>{toPercent(conversion)}</strong>
          <small>{soldBooks} 笔已进入“我购买的书”</small>
        </article>
        <article>
          <span>绿色贡献</span>
          <strong>{greenScore.toFixed(0)}</strong>
          <small>按书籍循环与匹配成交综合计算</small>
        </article>
      </div>

      <div className="category-bars">
        {categoryRows.map((item) => (
          <div key={item.category}>
            <div className="bar-label">
              <span>{item.category}</span>
              <span>{item.count}</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.max(8, (item.count / maxCategory) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
