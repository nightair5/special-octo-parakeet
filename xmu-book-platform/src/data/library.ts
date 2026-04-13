import type { Book, RequestPost, UserProfile, Seller } from '../types'

export const BOOK_CATEGORIES = [
  '全部学科',
  '专业教材',
  '学科笔记',
  '教辅资料',
  '文学名著',
  '考公考研',
  '雅思托福',
  '学习心得',
  '竞赛资料',
] as const

export const BOOK_SUBJECTS = [
  '经济学',
  '法学',
  '计算机',
  '医学',
  '数学',
  '英语',
  '文学',
  '公共管理',
  '心理学',
  '教育学',
] as const

const BASE_ITEMS = [
  {
    title: '微观经济学：现代观点',
    subtitle: 'Varian 第九版重点标注',
    category: '专业教材',
    subject: '经济学',
    tags: ['经管核心', '期末高频', '讲义配套'],
    description: '含完整章节结构与期末高频题型标注，配套课堂导图，适合经管学院基础与复习。',
  },
  {
    title: '深入理解计算机系统',
    subtitle: 'CSAPP 经典黑皮书',
    category: '专业教材',
    subject: '计算机',
    tags: ['系统底层', '无涂写', '秋招基础'],
    description: '覆盖程序结构、内存、并发与性能优化，附个人整理的章节索引与面试题映射。',
  },
  {
    title: '高等数学满分笔记',
    subtitle: '学霸手写复刻版',
    category: '学科笔记',
    subject: '数学',
    tags: ['错题归纳', '公式清单', '思路精炼'],
    description: '围绕中值定理、重积分、级数三大模块构建，覆盖难点与常见误区。',
  },
  {
    title: '剑桥雅思真题 14-18',
    subtitle: 'A 类阅读听力精读版',
    category: '雅思托福',
    subject: '英语',
    tags: ['烤鸭必备', '听力无痕', '口语素材'],
    description: '含章节练习计划与题型总结，适合冲刺 6.5-7.5 分段学习者。',
  },
  {
    title: '肖秀荣考研政治 1000 题',
    subtitle: '配套错题二刷标注',
    category: '考公考研',
    subject: '公共管理',
    tags: ['冲刺阶段', '二刷笔记', '上岸资料'],
    description: '覆盖主观题框架与客观题易错点，含阶段性复习路线。',
  },
  {
    title: '百年孤独',
    subtitle: '精装典藏版',
    category: '文学名著',
    subject: '文学',
    tags: ['经典名著', '完整无缺页', '收藏推荐'],
    description: '适合文学赏析与读书会分享，书脊完整，内页状态良好。',
  },
  {
    title: '教育心理学导论',
    subtitle: '高校教辅与案例实训',
    category: '教辅资料',
    subject: '教育学',
    tags: ['案例导向', '课程配套', '教学设计'],
    description: '内含课堂案例模板与研究方法摘要，适合教育学与师范专业。',
  },
  {
    title: '保研全流程经验手册',
    subtitle: '夏令营与复试资料',
    category: '学习心得',
    subject: '心理学',
    tags: ['保研攻略', '套磁模板', '复试技巧'],
    description: '从规划到复试的完整经验复盘，含时间线与材料清单。',
  },
  {
    title: '蓝桥杯算法专题',
    subtitle: '竞赛真题分层讲解',
    category: '竞赛资料',
    subject: '计算机',
    tags: ['竞赛提升', '代码模板', 'DP/图论'],
    description: '覆盖常见竞赛算法与工程化代码模板，适合刷题进阶。',
  },
  {
    title: '民法学（上下册）',
    subtitle: '法学院核心教材',
    category: '专业教材',
    subject: '法学',
    tags: ['法考基础', '条文索引', '重点释义'],
    description: '章节完整，附带法条索引卡，便于高效检索复习。',
  },
] as const

const CONDITIONS = [
  '全新未拆封',
  '九成新（有少量划线）',
  '七成新（有笔记）',
  '八成新（封面轻微磨损）',
] as const

const COVER_TONES = ['ocean', 'navy', 'azure', 'teal', 'indigo']
const COVER_VARIANTS: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c']

const SELLERS: Seller[] = [
  { id: 's1', name: '林同学', campus: '思明校区', credit: 97, verified: true },
  { id: 's2', name: '陈同学', campus: '翔安校区', credit: 94, verified: true },
  { id: 's3', name: '周同学', campus: '海韵园区', credit: 92, verified: true },
  { id: 's4', name: '黄同学', campus: '思明校区', credit: 89, verified: false },
  { id: 's5', name: '吴同学', campus: '翔安校区', credit: 95, verified: true },
]

function seeded(seed: number): () => number {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)]
}

function isoDaysAgo(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

function cleanTitleForAbbr(title: string): string {
  return title.replace(/[：:（）()《》·\s]/g, '')
}

export function getBookAbbr(title: string): string {
  const cleaned = cleanTitleForAbbr(title)
  if (!cleaned) return 'BOOK'

  const englishOnly = cleaned.replace(/[^a-zA-Z0-9]/g, '')
  if (englishOnly.length >= 2) {
    return englishOnly.slice(0, 4).toUpperCase()
  }
  return cleaned.slice(0, 2).toUpperCase()
}

export function generateBookDatabase(size = 500): Book[] {
  const rng = seeded(20260411)
  const books: Book[] = []

  for (let i = 0; i < size; i += 1) {
    const base = pick(rng, BASE_ITEMS)
    const modeRoll = rng()
    const mode = modeRoll < 0.62 ? 'sell' : modeRoll < 0.82 ? 'exchange' : 'free'
    const price = mode === 'sell' ? Math.floor(rng() * 90) + 12 : 0
    const seller = pick(rng, SELLERS)
    const daysAgo = Math.floor(rng() * 180)
    const codePrefix = base.subject.slice(0, 2).toUpperCase()
    const idx = String(i + 1).padStart(3, '0')
    const isbn = `978-7-${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 9000 + 1000)}-X`
    const title = `${base.title}${i % 3 === 0 ? '（配套资料）' : ''}`

    books.push({
      id: `BK-${idx}`,
      code: `${codePrefix}${100 + (i % 400)}`,
      title,
      subtitle: base.subtitle,
      category: base.category,
      subject: base.subject,
      mode,
      price,
      condition: pick(rng, CONDITIONS),
      isbn,
      matchScore: Number((88 + rng() * 12).toFixed(1)),
      tags: [base.tags[0], base.tags[1], i % 2 === 0 ? '凤凰花主题' : '学术蓝风格'],
      description: base.description,
      highlights: [
        '支持校区面交与时间协商',
        '支持收藏与分享，加入个人中心统一管理',
        '支持聊天协商、协议确认与交易闭环',
      ],
      coverTone: pick(rng, COVER_TONES),
      coverAbbr: getBookAbbr(title),
      coverPatternVariant: pick(rng, COVER_VARIANTS),
      createdAt: isoDaysAgo(daysAgo),
      seller,
    })
  }

  return books.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function createSeedRequests(currentUserId: string): RequestPost[] {
  return [
    {
      id: 'REQ-001',
      requesterId: 'u-1001',
      requesterName: '张同学',
      title: '求购《粉笔行测5000题》全套',
      category: '考公考研',
      keywords: ['行测', '判断推理', '国考'],
      budgetText: '¥35 或等价资料互换',
      budgetValue: 35,
      campus: '翔安校区',
      description: '希望成色八成新及以上，支持晚间面交，最好含近两年题目补充。',
      status: 'open',
      responses: 4,
      createdAt: isoDaysAgo(1),
    },
    {
      id: 'REQ-002',
      requesterId: currentUserId,
      requesterName: '我',
      title: '求借《微观经济学》复习版',
      category: '专业教材',
      keywords: ['经济学', '期末', '重点圈画'],
      budgetText: '请一杯咖啡 / 短期借阅',
      budgetValue: 20,
      campus: '思明校区',
      description: '下周考试前借阅 3 天，优先思明校区同学。',
      status: 'open',
      responses: 2,
      createdAt: isoDaysAgo(3),
    },
    {
      id: 'REQ-003',
      requesterId: 'u-1003',
      requesterName: '李同学',
      title: '求购雅思写作高分资料',
      category: '雅思托福',
      keywords: ['雅思', '写作', 'Task2'],
      budgetText: '¥25',
      budgetValue: 25,
      campus: '海韵园区',
      description: '希望包含高分范文和批改思路，电子版也可。',
      status: 'open',
      responses: 1,
      createdAt: isoDaysAgo(2),
    },
  ]
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'u-me',
  name: '厦大学术漂流者',
  school: '厦门大学',
  major: '信息管理与信息系统',
  grade: '2023级',
  credit: 96,
  greenScore: 324,
}
