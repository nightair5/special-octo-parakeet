import { createSeedRequests, DEFAULT_PROFILE, generateBookDatabase, getBookAbbr } from '../data/library'
import { queryBooks } from '../lib/bookQuery'
import { INITIAL_CHAT_STATE, nextChatReply } from '../lib/chatEngine'
import type {
  Book,
  BookQuery,
  ChatContext,
  ChatReply,
  ChatSessionState,
  CheckoutPayload,
  Feedback,
  Order,
  PagedResult,
  PublishPayload,
  RequestPayload,
  RequestPost,
  UserProfile,
} from '../types'

interface MockServerState {
  books: Book[]
  favorites: Set<string>
  purchases: Order[]
  requests: RequestPost[]
  feedbacks: Feedback[]
  profile: UserProfile
  chatSessions: Record<string, ChatSessionState>
}

const server: MockServerState = {
  books: generateBookDatabase(500),
  favorites: new Set<string>(),
  purchases: [],
  requests: createSeedRequests(DEFAULT_PROFILE.id),
  feedbacks: [],
  profile: DEFAULT_PROFILE,
  chatSessions: {},
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function withLatency<T>(data: T): Promise<T> {
  const latency = 120 + Math.floor(Math.random() * 220)
  await sleep(latency)
  return data
}

function byId(id: string): Book | undefined {
  return server.books.find((book) => book.id === id)
}

export function seedServerState(seed: {
  favorites?: string[]
  purchases?: Order[]
  requests?: RequestPost[]
  feedbacks?: Feedback[]
}): void {
  if (seed.favorites) server.favorites = new Set(seed.favorites)
  if (seed.purchases) server.purchases = seed.purchases
  if (seed.requests) {
    const base = createSeedRequests(server.profile.id)
    const dedup = new Map<string, RequestPost>()
    ;[...base, ...seed.requests].forEach((item) => dedup.set(item.id, item))
    server.requests = Array.from(dedup.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  if (seed.feedbacks) server.feedbacks = seed.feedbacks
}

export const mockApi = {
  async getBooks(query: BookQuery = {}): Promise<PagedResult<Book>> {
    return withLatency(queryBooks(server.books, query))
  },

  async getBookById(bookId: string): Promise<Book | null> {
    return withLatency(byId(bookId) ?? null)
  },

  async postFavorite(bookId: string): Promise<string[]> {
    server.favorites.add(bookId)
    return withLatency(Array.from(server.favorites))
  },

  async deleteFavorite(bookId: string): Promise<string[]> {
    server.favorites.delete(bookId)
    return withLatency(Array.from(server.favorites))
  },

  async getFavorites(): Promise<string[]> {
    return withLatency(Array.from(server.favorites))
  },

  async getProfile(): Promise<UserProfile> {
    return withLatency(server.profile)
  },

  async getProfilePurchases(): Promise<Order[]> {
    return withLatency([...server.purchases].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async getProfileRequests(): Promise<RequestPost[]> {
    const own = server.requests.filter((item) => item.requesterId === server.profile.id)
    return withLatency(own.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async postRequest(payload: RequestPayload): Promise<RequestPost> {
    const created: RequestPost = {
      id: `REQ-${Date.now()}`,
      requesterId: server.profile.id,
      requesterName: '我',
      title: payload.title,
      category: payload.category,
      keywords: payload.keywords,
      budgetText: payload.budgetText,
      budgetValue: payload.budgetValue,
      campus: payload.campus,
      description: payload.description,
      status: 'open',
      responses: 0,
      createdAt: new Date().toISOString(),
    }
    server.requests.unshift(created)
    return withLatency(created)
  },

  async getRequests(): Promise<RequestPost[]> {
    return withLatency([...server.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async postRequestRespond(requestId: string): Promise<RequestPost | null> {
    const item = server.requests.find((request) => request.id === requestId)
    if (!item) return withLatency(null)
    item.responses += 1
    if (item.status === 'open' && item.responses >= 3) item.status = 'matched'
    return withLatency({ ...item })
  },

  async postChatReply(sessionId: string, input: string, context: ChatContext): Promise<ChatReply> {
    const state = server.chatSessions[sessionId] ?? INITIAL_CHAT_STATE
    const reply = nextChatReply(input, context, state)
    server.chatSessions[sessionId] = reply.nextState
    return withLatency(reply)
  },

  async postOrderCheckout(payload: CheckoutPayload): Promise<Order | null> {
    const book = byId(payload.bookId)
    if (!book) return withLatency(null)

    const order: Order = {
      id: `ORD-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      amount: book.mode === 'sell' ? book.price : 0,
      mode: book.mode,
      sellerName: book.seller.name,
      meetupTime: payload.meetupTime,
      meetupCampus: payload.meetupCampus,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    server.purchases.unshift(order)
    return withLatency(order)
  },

  async postFeedback(content: string, contact?: string): Promise<Feedback> {
    const feedback: Feedback = {
      id: `FDB-${Date.now()}`,
      content,
      contact,
      createdAt: new Date().toISOString(),
      status: 'new',
    }
    server.feedbacks.unshift(feedback)
    return withLatency(feedback)
  },

  async getFeedbacks(): Promise<Feedback[]> {
    return withLatency([...server.feedbacks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async postBook(payload: PublishPayload): Promise<Book> {
    const seed = server.books.length + 1
    const entry: Book = {
      id: `BK-${String(seed).padStart(3, '0')}`,
      code: `${payload.subject.slice(0, 2).toUpperCase()}${100 + (seed % 800)}`,
      title: payload.title,
      subtitle: payload.subtitle,
      category: payload.category,
      subject: payload.subject,
      mode: payload.mode,
      price: payload.mode === 'sell' ? payload.price : 0,
      condition: payload.condition,
      isbn: `978-7-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}-X`,
      matchScore: 100,
      tags: payload.tags,
      description: payload.description,
      highlights: ['新发布资源', '可立即联系交易', '支持收藏与分享'],
      coverTone: ['ocean', 'navy', 'azure', 'teal'][seed % 4],
      coverAbbr: getBookAbbr(payload.title),
      coverPatternVariant: (['a', 'b', 'c'] as const)[seed % 3],
      createdAt: new Date().toISOString(),
      seller: {
        id: server.profile.id,
        name: '我',
        campus: '思明校区',
        credit: server.profile.credit,
        verified: true,
      },
    }
    server.books.unshift(entry)
    return withLatency(entry)
  },
}
