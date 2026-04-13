import type { ChatContext, ChatIntent, ChatReply, ChatSessionState } from '../types'

export const INITIAL_CHAT_STATE: ChatSessionState = {
  phase: 'discovery',
  bargained: false,
}

export function detectIntent(input: string): ChatIntent {
  const text = input.toLowerCase().trim()
  if (!text) return 'unknown'
  if (/(多少钱|价格|预算|便宜|降价|打折|price|budget)/.test(text)) return 'price'
  if (/(成色|划线|笔记|新旧|condition)/.test(text)) return 'condition'
  if (/(哪里|校区|地点|面交|location|campus)/.test(text)) return 'location'
  if (/(时间|几点|今天|明天|周末|time)/.test(text)) return 'time'
  if (/(少点|再便宜|砍价|优惠|bargain)/.test(text)) return 'bargain'
  if (/(要了|成交|确认|可以|ok|行|买|accept|confirm)/.test(text)) return 'confirm'
  if (/(取消|算了|不买|不需要|cancel)/.test(text)) return 'cancel'
  return 'unknown'
}

export function nextChatReply(
  input: string,
  context: ChatContext,
  previous: ChatSessionState,
): ChatReply {
  const intent = detectIntent(input)
  const state: ChatSessionState = { ...previous }
  const isBook = context.kind === 'book'

  if (intent === 'cancel') {
    state.phase = 'cancelled'
    return {
      text: '好的，那我先给你留着聊天记录。你后面想继续，直接说“继续”就行。',
      nextState: state,
      intent,
      action: 'close',
    }
  }

  if (intent === 'price') {
    state.phase = 'negotiation'
    const value = isBook
      ? context.mode === 'free'
        ? '0元公益漂流'
        : context.mode === 'exchange'
          ? '等价互换（可按书单匹配）'
          : `¥${context.price ?? 0}`
      : context.budgetText ?? '按你的预算协商'
    return {
      text: `这本目前是 ${value}。你要是合适的话，我们可以直接约时间地点了。`,
      nextState: state,
      intent,
    }
  }

  if (intent === 'condition') {
    state.phase = 'discovery'
    return {
      text: `成色这边是 ${context.condition ?? '八成新以上'}。面交前我也可以先拍细节给你看。`,
      nextState: state,
      intent,
    }
  }

  if (intent === 'location') {
    state.phase = 'meeting'
    return {
      text: `我这边方便在【${context.campus}】图书馆或者食堂附近面交，你看哪个点更顺路？`,
      nextState: state,
      intent,
    }
  }

  if (intent === 'time') {
    state.phase = 'meeting'
    return {
      text: '时间我都可以，今晚 19:00-21:00 或明天中午 12:00-13:30 都行，你定一个就好。',
      nextState: state,
      intent,
    }
  }

  if (intent === 'bargain') {
    state.phase = 'negotiation'
    if (!state.bargained) {
      state.bargained = true
      return {
        text: '行，我给你一个同学校友价，再往下我就不太划算啦。你要是接受我就直接走确认。',
        nextState: state,
        intent,
      }
    }
    return {
      text: '这个已经是我能给到的最低了。你要是OK，我们就直接确认成交。',
      nextState: state,
      intent,
    }
  }

  if (intent === 'confirm') {
    state.phase = 'agreement'
    return {
      text: '没问题，那就这么定了。你点下面卡片，我们把面交和联系方式确认一下。',
      nextState: state,
      intent,
      action: 'offer_card',
    }
  }

  return {
    text: '收到。你可以直接问价格、成色、地点时间，或者说“要了”我就帮你走确认流程。',
    nextState: state,
    intent,
  }
}
