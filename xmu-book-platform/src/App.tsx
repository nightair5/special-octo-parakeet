import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { PublishDrawer } from './components/PublishDrawer'
import { BookDetailPage } from './pages/BookDetailPage'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { WantedDetailPage } from './pages/WantedDetailPage'
import { WantedPage } from './pages/WantedPage'
import { usePlatform } from './state/PlatformContext'

function LayoutWithDrawer() {
  const { publishBook } = usePlatform()
  const navigate = useNavigate()
  const [publishOpen, setPublishOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return
      const key = event.key.toLowerCase()

      if (key === '1') {
        event.preventDefault()
        navigate('/')
      } else if (key === '2') {
        event.preventDefault()
        navigate('/wanted')
      } else if (key === '3') {
        event.preventDefault()
        navigate('/profile')
      } else if (key === 'n') {
        event.preventDefault()
        setPublishOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  return (
    <>
      <AppLayout onOpenPublish={() => setPublishOpen(true)} />
      <PublishDrawer
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSubmit={async (payload) => {
          await publishBook(payload)
          window.alert('发布成功，已进入全站书库。')
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutWithDrawer />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:bookId" element={<BookDetailPage />} />
        <Route path="/wanted" element={<WantedPage />} />
        <Route path="/wanted/:requestId" element={<WantedDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
