import { ArrowRight, SendHorizontal, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePlatform } from '../state/PlatformContext'
import type { ChatContext } from '../types'

interface UiMessage {
  id: string
  sender: 'me' | 'peer' | 'tip'
  text: string
}

interface ChatPanelProps {
  sessionId: string
  title: string
  context: ChatContext
  onAgreement?: () => void
}

export function ChatPanel({ sessionId, title, context, onAgreement }: ChatPanelProps) {
  const { sendChatMessage } = usePlatform()
  const [messages, setMessages] = useState<UiMessage[]>([
    { id: 'tip-1', sender: 'tip', text: '聊天内容仅用于沟通面交与交易信息。' },
    { id: 'peer-1', sender: 'peer', text: `你好呀，关于《${title}》，你想先看成色还是先聊价格？` },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, showAgreement])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, sender: 'me', text }])
    setInput('')
    setTyping(true)
    const reply = await sendChatMessage(sessionId, text, context)
    setTyping(false)

    setMessages((prev) => [...prev, { id: `peer-${Date.now()}`, sender: 'peer', text: reply.text }])
    setShowAgreement(reply.action === 'offer_card')
  }

  return (
    <section className="chat-panel">
      <header className="chat-panel-header">
        <div>
          <h3>{title} · 在线沟通</h3>
          <p>像同学之间沟通一样直接说需求就行</p>
        </div>
        <span className="safe-tag">
          <ShieldCheck size={14} />
          已加密
        </span>
      </header>

      <div className="chat-list" ref={listRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.sender}`}>
            <span>{msg.text}</span>
          </div>
        ))}
        {typing && (
          <div className="chat-msg peer">
            <span>我看一下，马上回你～</span>
          </div>
        )}

        {showAgreement && (
          <div className="agreement-card">
            <h4>成交确认卡片</h4>
            <p>确认后会同步到“我购买的书”，并写入面交时间与校区信息。</p>
            <button
              onClick={() => {
                setShowAgreement(false)
                onAgreement?.()
              }}
            >
              去确认成交
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="例如：这本还有吗？能在思明校区面交吗？"
        />
        <button type="submit" disabled={!input.trim()}>
          <SendHorizontal size={16} />
        </button>
      </form>
    </section>
  )
}
