/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import { mockApi, seedServerState } from '../api/mockApi'
import { loadBucket, saveBucket, STORAGE_KEYS } from '../lib/storage'
import type {
  Book,
  ChatContext,
  ChatReply,
  Feedback,
  Order,
  PublishPayload,
  RequestPayload,
  RequestPost,
  UserProfile,
} from '../types'

interface PlatformContextValue {
  loading: boolean
  profile: UserProfile | null
  allBooks: Book[]
  requests: RequestPost[]
  purchases: Order[]
  feedbacks: Feedback[]
  favorites: string[]
  searchHistory: string[]
  setSearchHistory: (items: string[]) => void
  refreshAll: () => Promise<void>
  toggleFavorite: (bookId: string) => Promise<boolean>
  addSearchHistory: (keyword: string) => void
  clearSearchHistory: () => void
  createRequest: (payload: RequestPayload) => Promise<RequestPost>
  respondToRequest: (requestId: string) => Promise<RequestPost | null>
  checkoutBook: (bookId: string, meetupTime: string, meetupCampus: '思明校区' | '翔安校区' | '海韵园区') => Promise<Order | null>
  publishBook: (payload: PublishPayload) => Promise<Book>
  sendChatMessage: (sessionId: string, input: string, context: ChatContext) => Promise<ChatReply>
  submitFeedback: (content: string, contact?: string) => Promise<Feedback>
}

const PlatformContext = createContext<PlatformContextValue | null>(null)

export function PlatformProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [requests, setRequests] = useState<RequestPost[]>([])
  const [purchases, setPurchases] = useState<Order[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [searchHistory, setSearchHistoryState] = useState<string[]>([])

  const loadInitial = async () => {
    const persistedFavorites = loadBucket<string[]>(STORAGE_KEYS.favorites, [])
    const persistedHistory = loadBucket<string[]>(STORAGE_KEYS.searchHistory, [])
    const persistedPurchases = loadBucket<Order[]>(STORAGE_KEYS.purchases, [])
    const persistedRequests = loadBucket<RequestPost[]>(STORAGE_KEYS.requests, [])
    const persistedFeedbacks = loadBucket<Feedback[]>(STORAGE_KEYS.feedbacks, [])

    seedServerState({
      favorites: persistedFavorites,
      purchases: persistedPurchases,
      requests: persistedRequests,
      feedbacks: persistedFeedbacks,
    })

    setFavorites(persistedFavorites)
    setSearchHistoryState(persistedHistory)

    const [bookResult, reqs, buys, profileData, feedbackData] = await Promise.all([
      mockApi.getBooks({ page: 1, pageSize: 1000, sort: 'latest' }),
      mockApi.getRequests(),
      mockApi.getProfilePurchases(),
      mockApi.getProfile(),
      mockApi.getFeedbacks(),
    ])

    setAllBooks(bookResult.items)
    setRequests(reqs)
    setPurchases(buys)
    setProfile(profileData)
    setFeedbacks(feedbackData)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInitial().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    saveBucket(STORAGE_KEYS.favorites, favorites)
  }, [favorites])

  useEffect(() => {
    saveBucket(STORAGE_KEYS.searchHistory, searchHistory)
  }, [searchHistory])

  useEffect(() => {
    saveBucket(STORAGE_KEYS.requests, requests)
  }, [requests])

  useEffect(() => {
    saveBucket(STORAGE_KEYS.purchases, purchases)
  }, [purchases])

  useEffect(() => {
    saveBucket(STORAGE_KEYS.feedbacks, feedbacks)
  }, [feedbacks])

  const refreshAll = async () => {
    const [bookResult, reqs, buys, favs, feedbackData] = await Promise.all([
      mockApi.getBooks({ page: 1, pageSize: 1000, sort: 'latest' }),
      mockApi.getRequests(),
      mockApi.getProfilePurchases(),
      mockApi.getFavorites(),
      mockApi.getFeedbacks(),
    ])
    setAllBooks(bookResult.items)
    setRequests(reqs)
    setPurchases(buys)
    setFavorites(favs)
    setFeedbacks(feedbackData)
  }

  const toggleFavorite = async (bookId: string): Promise<boolean> => {
    const next = favorites.includes(bookId)
      ? await mockApi.deleteFavorite(bookId)
      : await mockApi.postFavorite(bookId)
    setFavorites(next)
    return next.includes(bookId)
  }

  const addSearchHistory = (keyword: string) => {
    const value = keyword.trim()
    if (!value) return
    setSearchHistoryState((prev) => [value, ...prev.filter((item) => item !== value)].slice(0, 8))
  }

  const setSearchHistory = (items: string[]) => {
    setSearchHistoryState(items)
  }

  const clearSearchHistory = () => setSearchHistoryState([])

  const createRequest = async (payload: RequestPayload) => {
    const created = await mockApi.postRequest(payload)
    setRequests((prev) => [created, ...prev])
    return created
  }

  const respondToRequest = async (requestId: string) => {
    const updated = await mockApi.postRequestRespond(requestId)
    if (!updated) return null
    setRequests((prev) => prev.map((item) => (item.id === requestId ? updated : item)))
    return updated
  }

  const checkoutBook = async (
    bookId: string,
    meetupTime: string,
    meetupCampus: '思明校区' | '翔安校区' | '海韵园区',
  ) => {
    const order = await mockApi.postOrderCheckout({ bookId, meetupTime, meetupCampus })
    if (!order) return null
    setPurchases((prev) => [order, ...prev])
    return order
  }

  const publishBook = async (payload: PublishPayload) => {
    const created = await mockApi.postBook(payload)
    setAllBooks((prev) => [created, ...prev])
    return created
  }

  const sendChatMessage = (sessionId: string, input: string, context: ChatContext) => {
    return mockApi.postChatReply(sessionId, input, context)
  }

  const submitFeedback = async (content: string, contact?: string) => {
    const feedback = await mockApi.postFeedback(content, contact)
    setFeedbacks((prev) => [feedback, ...prev])
    return feedback
  }

  const value: PlatformContextValue = {
    loading,
    profile,
    allBooks,
    requests,
    purchases,
    feedbacks,
    favorites,
    searchHistory,
    setSearchHistory,
    refreshAll,
    toggleFavorite,
    addSearchHistory,
    clearSearchHistory,
    createRequest,
    respondToRequest,
    checkoutBook,
    publishBook,
    sendChatMessage,
    submitFeedback,
  }

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext)
  if (!ctx) {
    throw new Error('usePlatform must be used inside PlatformProvider')
  }
  return ctx
}
