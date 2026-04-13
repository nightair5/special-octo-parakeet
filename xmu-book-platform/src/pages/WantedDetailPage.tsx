import { ArrowLeft, Handshake, Radar } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChatPanel } from '../components/ChatPanel'
import { usePlatform } from '../state/PlatformContext'

export function WantedDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ requestId: string }>()
  const { requests, respondToRequest } = usePlatform()
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  const request = useMemo(
    () => requests.find((item) => item.id === params.requestId) ?? null,
    [params.requestId, requests],
  )

  if (!request) {
    return (
      <section className="page detail-page missing">
        <h2>未找到求购记录</h2>
        <p>该需求可能已关闭或已被移除。</p>
        <Link to="/wanted">返回求购页</Link>
      </section>
    )
  }

  const handleConnect = async () => {
    setConnecting(true)
    await respondToRequest(request.id)
    setConnecting(false)
    setConnected(true)
  }

  return (
    <section className="page wanted-detail-page">
      <header className="detail-topbar">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          返回求购列表
        </button>
      </header>

      <article className="wanted-detail-card">
        <h1>{request.title}</h1>
        <p>{request.description}</p>
        <div className="wanted-detail-meta">
          <span>
            <Radar size={14} />
            {request.category} · {request.campus}
          </span>
          <strong>{request.budgetText}</strong>
          <small>已响应 {request.responses} 次</small>
        </div>
        <div className="wanted-detail-tags">
          {request.keywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>
        <button className="connect-btn" onClick={() => void handleConnect()} disabled={connecting}>
          <Handshake size={16} />
          {connecting ? '连接中...' : connected ? '已建立会话' : '响应并进入沟通'}
        </button>
      </article>

      {connected && (
        <ChatPanel
          sessionId={`request-${request.id}`}
          title={request.title}
          context={{
            kind: 'request',
            title: request.title,
            budgetText: request.budgetText,
            campus: request.campus,
          }}
        />
      )}
    </section>
  )
}
