import { describe, expect, it } from 'vitest'
import { INITIAL_CHAT_STATE, detectIntent, nextChatReply } from './chatEngine'

describe('chat engine', () => {
  it('detects key intents', () => {
    expect(detectIntent('这个多少钱')).toBe('price')
    expect(detectIntent('周末哪里面交')).toBe('location')
    expect(detectIntent('成色有划线吗')).toBe('condition')
    expect(detectIntent('要了，成交')).toBe('confirm')
  })

  it('transitions to agreement on confirm', () => {
    const reply = nextChatReply(
      '可以，我要了',
      { kind: 'book', title: '测试书', mode: 'sell', price: 30, condition: '九成新', campus: '思明校区' },
      INITIAL_CHAT_STATE,
    )
    expect(reply.intent).toBe('confirm')
    expect(reply.nextState.phase).toBe('agreement')
    expect(reply.action).toBe('offer_card')
  })

  it('marks session cancelled', () => {
    const reply = nextChatReply(
      '先取消吧',
      { kind: 'request', title: '求购测试', budgetText: '¥20', campus: '翔安校区' },
      { phase: 'meeting', bargained: false },
    )
    expect(reply.nextState.phase).toBe('cancelled')
    expect(reply.action).toBe('close')
  })
})
