export type TradeMode = 'sell' | 'free' | 'exchange'

export type RequestStatus = 'open' | 'matched' | 'closed'

export type BookSort = 'latest' | 'priceAsc' | 'priceDesc' | 'creditDesc' | 'matchDesc'

export type Campus = '思明校区' | '翔安校区' | '海韵园区'

export interface Seller {
  id: string
  name: string
  campus: Campus
  credit: number
  verified: boolean
}

export interface Book {
  id: string
  code: string
  title: string
  subtitle: string
  category: string
  subject: string
  mode: TradeMode
  price: number
  condition: string
  isbn: string
  matchScore: number
  tags: string[]
  description: string
  highlights: string[]
  coverTone: string
  coverAbbr: string
  coverPatternVariant?: 'a' | 'b' | 'c'
  createdAt: string
  seller: Seller
}

export interface RequestPost {
  id: string
  requesterId: string
  requesterName: string
  title: string
  category: string
  keywords: string[]
  budgetText: string
  budgetValue: number
  campus: Campus
  description: string
  status: RequestStatus
  responses: number
  createdAt: string
}

export interface Order {
  id: string
  bookId: string
  bookTitle: string
  amount: number
  mode: TradeMode
  sellerName: string
  meetupTime: string
  meetupCampus: Campus
  status: 'pending' | 'completed'
  createdAt: string
}

export interface Feedback {
  id: string
  content: string
  contact?: string
  createdAt: string
  status: 'new' | 'reviewed'
}

export interface UserProfile {
  id: string
  name: string
  school: string
  major: string
  grade: string
  credit: number
  greenScore: number
}

export interface BookQuery {
  q?: string
  category?: string
  mode?: TradeMode | 'all'
  sort?: BookSort
  page?: number
  pageSize?: number
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface PublishPayload {
  title: string
  subtitle: string
  category: string
  subject: string
  mode: TradeMode
  price: number
  condition: string
  description: string
  tags: string[]
}

export interface RequestPayload {
  title: string
  category: string
  keywords: string[]
  budgetText: string
  budgetValue: number
  campus: Campus
  description: string
}

export interface CheckoutPayload {
  bookId: string
  meetupTime: string
  meetupCampus: Campus
}

export type ChatIntent =
  | 'price'
  | 'condition'
  | 'location'
  | 'time'
  | 'bargain'
  | 'confirm'
  | 'cancel'
  | 'unknown'

export interface ChatContext {
  kind: 'book' | 'request'
  title: string
  mode?: TradeMode
  price?: number
  budgetText?: string
  condition?: string
  campus: Campus
}

export interface ChatSessionState {
  phase: 'discovery' | 'negotiation' | 'meeting' | 'agreement' | 'closed' | 'cancelled'
  bargained: boolean
}

export interface ChatReply {
  text: string
  nextState: ChatSessionState
  intent: ChatIntent
  action?: 'offer_card' | 'close'
}
