import { MessageCircleMore, PlusCircle, Radar, Sparkle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PhoenixBackground } from '../components/PhoenixBackground'
import { BOOK_CATEGORIES } from '../data/library'
import { usePlatform } from '../state/PlatformContext'
import type { Campus } from '../types'

export function WantedPage() {
  const { requests, createRequest } = usePlatform()
  const [submitting, setSubmitting] = useState(false)

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
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
    setSubmitting(false)
  }

  return (
    <section className="page wanted-page">
      <header className="wanted-hero">
        <PhoenixBackground />
        <div>
          <h1>求购信号广场</h1>
          <p>发布需求、响应求购、在线沟通、确认面交，一页完成。</p>
        </div>
      </header>

      <div className="wanted-layout">
        <article className="wanted-list-card">
          <header>
            <h2>
              <Radar size={18} />
              实时求购列表
            </h2>
            <span>{requests.length} 条</span>
          </header>

          <div className="wanted-list">
            {requests.map((item) => (
              <Link to={`/wanted/${item.id}`} className="wanted-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {item.category} · {item.campus}
                  </small>
                </div>
                <div>
                  <span>{item.budgetText}</span>
                  <small>
                    <MessageCircleMore size={12} />
                    响应 {item.responses}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="wanted-form-card">
          <header>
            <PlusCircle size={18} />
            发布新的求购
          </header>
          <form onSubmit={submitRequest}>
            <input name="title" required placeholder="求购书名 / 课程资料名" />
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
            <input name="keywords" defaultValue="课程代码, 版本, 真题, 讲义" />
            <div className="publish-grid-2">
              <input name="budgetText" defaultValue="¥30 或互换" />
              <input name="budgetValue" type="number" defaultValue={30} />
            </div>
            <textarea
              name="description"
              rows={4}
              required
              defaultValue="希望本周内面交，优先考虑带重点标注的版本。"
            />
            <button type="submit" disabled={submitting}>
              {submitting ? '发送中...' : '发送求购广播'}
            </button>
          </form>
          <p>
            <Sparkle size={14} />
            发布后会同步到个人中心“我求购的书”，并支持卖家主动联系。
          </p>
        </article>
      </div>
    </section>
  )
}
