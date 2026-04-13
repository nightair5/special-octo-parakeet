import { X } from 'lucide-react'
import { useState } from 'react'
import { BOOK_CATEGORIES, BOOK_SUBJECTS } from '../data/library'
import type { TradeMode } from '../types'

interface PublishDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: {
    title: string
    subtitle: string
    category: string
    subject: string
    mode: TradeMode
    price: number
    condition: string
    description: string
    tags: string[]
  }) => Promise<void>
}

export function PublishDrawer({ open, onClose, onSubmit }: PublishDrawerProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const mode = String(form.get('mode')) as TradeMode
    const payload = {
      title: String(form.get('title') ?? ''),
      subtitle: String(form.get('subtitle') ?? ''),
      category: String(form.get('category') ?? '专业教材'),
      subject: String(form.get('subject') ?? '计算机'),
      mode,
      price: mode === 'sell' ? Number(form.get('price') ?? 0) : 0,
      condition: String(form.get('condition') ?? ''),
      description: String(form.get('description') ?? ''),
      tags: String(form.get('tags') ?? '')
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    }
    setSubmitting(true)
    await onSubmit(payload)
    setSubmitting(false)
    event.currentTarget.reset()
    onClose()
  }

  return (
    <aside className={`publish-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="publish-header">
        <h3>发布书籍 / 教辅 / 笔记</h3>
        <button onClick={onClose} aria-label="close">
          <X size={18} />
        </button>
      </div>
      <form className="publish-form" onSubmit={handleSubmit}>
        <label>
          书名
          <input name="title" required placeholder="例如：计算机网络（第八版）" />
        </label>
        <label>
          副标题
          <input name="subtitle" required placeholder="例如：章节重点已梳理" />
        </label>
        <div className="publish-grid-2">
          <label>
            分类
            <select name="category" defaultValue="专业教材">
              {BOOK_CATEGORIES.filter((item) => item !== '全部学科').map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            学科
            <select name="subject" defaultValue={BOOK_SUBJECTS[0]}>
              {BOOK_SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="publish-grid-2">
          <label>
            交易方式
            <select name="mode" defaultValue="sell">
              <option value="sell">定价出售</option>
              <option value="exchange">等价互换</option>
              <option value="free">公益漂流</option>
            </select>
          </label>
          <label>
            价格（出售时）
            <input type="number" min={0} name="price" defaultValue={28} />
          </label>
        </div>
        <label>
          成色
          <input name="condition" defaultValue="九成新（有少量划线）" required />
        </label>
        <label>
          标签（逗号分隔）
          <input name="tags" defaultValue="凤凰花主题, 学术蓝风格, 快速面交" />
        </label>
        <label>
          详细介绍
          <textarea
            name="description"
            rows={4}
            required
            placeholder="可描述版本、配套资料、适用课程、是否含笔记等信息。"
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? '发布中...' : '确认发布'}
        </button>
      </form>
    </aside>
  )
}
