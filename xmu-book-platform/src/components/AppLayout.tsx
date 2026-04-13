import { BookOpen, Home, Radio, UserRound } from 'lucide-react'
import type { CSSProperties } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { XMU_THEME } from '../lib/theme'
import { usePlatform } from '../state/PlatformContext'
import { PhoenixLogo } from './PhoenixLogo'

interface AppLayoutProps {
  onOpenPublish: () => void
}

function navClass({ isActive }: { isActive: boolean }) {
  return `nav-link ${isActive ? 'active' : ''}`
}

export function AppLayout({ onOpenPublish }: AppLayoutProps) {
  const { favorites, requests, purchases } = usePlatform()

  return (
    <div
      className="app-shell"
      data-logo-variant={XMU_THEME.logoVariant}
      style={
        {
          '--paper-image': `url('${XMU_THEME.paperTexturePath}')`,
          '--phoenix-line-opacity': XMU_THEME.phoenixLineOpacity,
        } as CSSProperties
      }
    >
      <div className="global-paper-bg" aria-hidden="true" />
      <aside className="side-nav">
        <div className="brand-card">
          <span className="brand-mark">
            <PhoenixLogo />
          </span>
          <div>
            <strong>凤凰书漂流</strong>
            <small>XMU BOOK DRIFT</small>
          </div>
        </div>

        <nav>
          <NavLink to="/" end className={navClass}>
            <Home size={18} />
            首页书市
          </NavLink>
          <NavLink to="/wanted" className={navClass}>
            <Radio size={18} />
            求购广场
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            <UserRound size={18} />
            个人中心
          </NavLink>
          <button className="nav-link publish-trigger" onClick={onOpenPublish}>
            <BookOpen size={18} />
            发布资源
          </button>
        </nav>

        <div className="shortcut-hint">
          <span>快捷键</span>
          <small>Alt+1 首页 · Alt+2 求购 · Alt+3 个人中心 · Alt+N 发布</small>
        </div>

        <div className="side-metrics">
          <div>
            <span>收藏</span>
            <strong>{favorites.length}</strong>
          </div>
          <div>
            <span>求购</span>
            <strong>{requests.length}</strong>
          </div>
          <div>
            <span>购买</span>
            <strong>{purchases.length}</strong>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet context={{ openPublish: onOpenPublish }} />
      </main>
    </div>
  )
}
