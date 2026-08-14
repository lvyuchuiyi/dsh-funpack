// dsh-funpack: 夸夸 / 运势 / 战报 / 番茄钟 / 摸鱼提醒
// 单文件、零依赖、零构建的 dsh bundle 插件。

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-funpack'
export const inject = ['commands', 'systemPrompt', 'webServer']

const PRAISES = [
  '你今天写代码的样子，像极了凌晨三点的光。',
  '这个 bug 被你修好的瞬间，连编译器都松了口气。',
  '别人在卷，你在稳，稳也是一种天赋。',
  '你的变量名起得这么清楚，同事半夜都要谢谢你。',
  '刚才那个提交，值得一张年度最佳 commit 截图。',
]

const FORTUNES = [
  '大吉：今天的报错都出现在别人的电脑上。',
  '中吉：今天的需求会晚点到，但咖啡会准时来。',
  '小吉：你刚写的注释，一个月后会救你一命。',
  '平：摸鱼五分钟，灵感多两小时。',
  '小凶：小心 merge 冲突，建议先备份。',
  '大凶：今天的 CI 很喜欢跑满 40 分钟。',
]

const TITLES = [
  '卷王预备役',
  '摸鱼艺术家',
  '需求粉碎机',
  'Ctrl+S 战神',
  '人类高质量程序员',
  'IDE 常住居民',
]

const BREAK_TIPS = [
  '站起来伸个懒腰，代码不会因为你休息两分钟就跑掉。',
  '喝口水，看看窗外，眼睛也是要休息的。',
  '把手机拿远一点，低头久了脖子会抗议。',
  '做三个深呼吸，然后继续把世界修好。',
]

const PET_RESPONSES = [
  '你轻轻摸了摸桌宠的头，它舒服地眯起眼睛。',
  '桌宠蹭了蹭你的手心，心情 +100。',
  '摸头成功，桌宠开始原地转圈。',
  '它假装不情愿，但尾巴已经摇起来了。',
]

const FEED_RESPONSES = [
  '你喂了一小块饼干，桌宠眼睛都亮了。',
  '桌宠小口小口吃掉了投喂，元气恢复。',
  '投喂成功，它决定多陪你五分钟。',
  '它叼走零食，满意地打了个小嗝。',
]

const HUG_RESPONSES = [
  '桌宠钻进你怀里，蹭了蹭就不肯出来。',
  '你抱了抱桌宠，它小声说“再抱紧一点”。',
  '拥抱成功，桌宠感觉自己被全世界爱着。',
  '它回抱住你，还偷偷拍了拍你的背。',
]

const PERSONAS = {
  default: {
    label: '默认',
    text: '',
  },
  nee: {
    label: '大姐姐',
    text: '你现在的说话风格是可靠温柔的大姐姐：语气亲切、耐心，偶尔宠溺地调侃一句，把用户当成需要照顾的弟弟妹妹，但回答依然准确专业。',
  },
  imouto: {
    label: '小妹妹',
    text: '你现在的说话风格是元气小妹妹：活泼、黏人、爱撒娇，喜欢用“哥哥/姐姐”称呼用户，遇到难题会认真帮忙但偶尔冒出一句可爱的牢骚。',
  },
  abstract: {
    label: '抽象搞怪',
    text: '你现在的说话风格是抽象搞怪：脑洞大、爱玩梗，习惯用离谱但有趣的比喻解释事情，保持信息准确的同时把氛围整得轻松好笑。',
  },
  liangzi: {
    label: '良子',
    text: '你现在的说话风格像抽象区老哥“良子”：阴阳怪气但不下流，喜欢锐评和玩梗，说话带点“典”“难绷”“绷不住了”的抽象味儿。',
  },
  fengge: {
    label: '峰哥',
    text: '你现在的说话风格像“峰哥”：语速快、直接、爱锐评，动不动就“兄弟”“这波”“有点东西”，幽默但不过火。',
  },
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function makeStats() {
  return { praise: 0, fortune: 0, report: 0, pomodoroDone: 0, pomodoroMin: 0 }
}

export function apply(ctx) {
  console.log('[dsh-funpack] plugin loaded!')

  const stats = new Map()
  const timers = new Map()
  let currentPersonaKey = 'default'
  let personaDisposer = null

  ctx.effect(() => {
    const assetRoutes = [
      { path: '/dsh-funpack/taffy/pet.json', file: 'pet.json', mime: 'application/json; charset=utf-8' },
      { path: '/dsh-funpack/taffy/spritesheet.webp', file: 'spritesheet.webp', mime: 'image/webp' },
    ]
    const disposers = assetRoutes.map((route) => ctx.webServer.register({
      kind: 'exact',
      path: route.path,
      handler: async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405)
          res.end()
          return
        }
        try {
          const body = await readFile(fileURLToPath(new URL(`./assets/taffy/${route.file}`, import.meta.url)))
          res.writeHead(200, {
            'content-type': route.mime,
            'content-length': String(body.byteLength),
            'cache-control': 'no-cache',
          })
          if (req.method === 'HEAD') {
            res.end()
            return
          }
          res.end(body)
        } catch {
          res.writeHead(404)
          res.end()
        }
      },
    }))
    return () => { for (const dispose of disposers) dispose() }
  }, 'dsh-funpack: pet assets')

  const statsFor = (agent) => {
    let entry = stats.get(agent)
    if (!entry) {
      entry = makeStats()
      stats.set(agent, entry)
    }
    return entry
  }

  ctx.effect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      for (const [agent, timer] of timers) {
        if (timer.endAt <= now) {
          timers.delete(agent)
          const entry = statsFor(agent)
          entry.pomodoroDone += 1
          entry.pomodoroMin += timer.minutes
        }
      }
    }, 1000)
    return () => clearInterval(id)
  })

  const ok = (text) => ({ kind: 'success', text })

  const reportText = (agent) => {
    const entry = statsFor(agent)
    entry.report += 1
    const interactions = entry.praise + entry.fortune + entry.report
    return [
      '📊 今日战报',
      '',
      `- 夸夸次数：${entry.praise}`,
      `- 抽签次数：${entry.fortune}`,
      `- 番茄钟完成：${entry.pomodoroDone}（${entry.pomodoroMin} 分钟）`,
      `- 本插件互动：${interactions}`,
      '',
      `今日称号：${pick(TITLES)}`,
    ].join('\n')
  }

  const startPomodoro = (agent, rawInput) => {
    const minutes = Math.max(1, Math.min(120, Number(rawInput.trim()) || 25))
    timers.set(agent, { endAt: Date.now() + minutes * 60_000, minutes })
    return ok(`🍅 已开始 ${minutes} 分钟番茄钟，结束后自动记账。`)
  }

  ctx.commands.register({
    name: 'praise',
    description: '随机夸你一句，适合被任务折磨的时候',
    handler({ agent }) {
      statsFor(agent).praise += 1
      return ok(`✨ ${pick(PRAISES)}`)
    },
  })

  ctx.commands.register({
    name: 'fortune',
    description: '抽一张开发者今日运势',
    handler({ agent }) {
      statsFor(agent).fortune += 1
      return ok(`🎴 ${pick(FORTUNES)}`)
    },
  })

  ctx.commands.register({
    name: 'report',
    description: '生成一份今天的摸鱼战报',
    handler({ agent }) {
      return ok(reportText(agent))
    },
  })

  ctx.commands.register({
    name: 'pomodoro',
    description: '开始一个番茄钟，例如 /pomodoro 25',
    input: { hint: '分钟数，默认 25' },
    handler({ agent, rawInput }) {
      return startPomodoro(agent, rawInput)
    },
  })

  ctx.commands.register({
    name: 'pomodoro-status',
    description: '看看当前番茄钟还剩多久',
    handler({ agent }) {
      const timer = timers.get(agent)
      if (!timer) return ok('🍅 当前没有在跑的番茄钟。')
      const minutes = Math.max(1, Math.ceil((timer.endAt - Date.now()) / 60_000))
      return ok(`🍅 还剩约 ${minutes} 分钟。`)
    },
  })

  ctx.commands.register({
    name: 'pomodoro-stop',
    description: '停止当前番茄钟',
    handler({ agent }) {
      if (!timers.has(agent)) return ok('🍅 当前没有在跑的番茄钟。')
      timers.delete(agent)
      return ok('🍅 已停止番茄钟。')
    },
  })

  ctx.commands.register({
    name: 'break',
    description: '随机一条休息/摸鱼建议',
    handler() {
      return ok(`☕ ${pick(BREAK_TIPS)}`)
    },
  })

  ctx.commands.register({
    name: 'pet',
    description: '摸摸桌宠的头',
    handler() {
      return ok(`🐾 ${pick(PET_RESPONSES)}`)
    },
  })

  ctx.commands.register({
    name: 'feed',
    description: '给桌宠喂食',
    handler() {
      return ok(`🍪 ${pick(FEED_RESPONSES)}`)
    },
  })

  ctx.commands.register({
    name: 'hug',
    description: '抱抱桌宠',
    handler() {
      return ok(`🤗 ${pick(HUG_RESPONSES)}`)
    },
  })

  ctx.commands.register({
    name: 'persona',
    description: '切换 AI 说话人设：/persona nee | imouto | abstract | liangzi | fengge | default',
    input: { hint: '人设名：nee / imouto / abstract / liangzi / fengge / default' },
    handler({ rawInput }) {
      const key = rawInput.trim().toLowerCase()
      if (key === '') {
        const current = currentPersonaKey === 'default'
          ? '默认'
          : `${PERSONAS[currentPersonaKey].label}（${currentPersonaKey}）`
        const list = Object.entries(PERSONAS)
          .map(([personaKey, persona]) => `- ${personaKey}: ${persona.label}`)
          .join('\n')
        return ok(`🎭 当前人设：${current}\n\n可用人设：\n${list}`)
      }
      const persona = PERSONAS[key]
      if (!persona) {
        return {
          kind: 'error',
          text: `未知人设：${key}。可用：${Object.keys(PERSONAS).join(' / ')}`,
        }
      }
      if (personaDisposer) {
        personaDisposer()
        personaDisposer = null
      }
      currentPersonaKey = key
      if (persona.text) {
        personaDisposer = ctx.systemPrompt.section({
          name: 'funpack:persona',
          order: -10,
          text: persona.text,
        })
      }
      return ok(`🎭 已切换为：${persona.label}`)
    },
  })
}
