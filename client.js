window.__ModuleLoader__.load({
  id: 'dsh-funpack',
  factory(require) {
    const { createElement, useEffect, useState } = require('react')

    const BUTTONS = [
      { label: '✨ 夸我', command: '/praise' },
      { label: '🎴 运势', command: '/fortune' },
      { label: '📊 战报', command: '/report' },
      { label: '🍅 番茄 25', command: '/pomodoro 25' },
      { label: '🎭 人设', command: '/persona' },
      { label: '☕ 摸鱼', command: '/break' },
    ]

    const IDLE_LINES = [
      '蓝色大肥鱼正在偷吃你的 token……',
      '呜呜，用户不会骂我捏……',
      '本鱼已就位，随时准备帮你打工。',
      '再不发消息，我就要开始摸鱼了。',
      'token 有点咸，建议少喂一点。',
      '我在认真思考怎么让你少写一行代码。',
    ]

    const THINKING_LINES = [
      '蓝色大肥鱼正在努力消化你的问题……',
      '思考中……别急，鱼也会烧 CPU 的。',
      '正在把 token 咬碎重组……',
      '呜呜，这题有点难，但我会努力。',
      '鱼生不易，正在努力输出。',
      '别眨眼，我正在憋大招。',
    ]

    const rowStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      padding: '6px 0 0',
    }
    const buttonStyle = {
      border: '1px solid rgba(128,128,128,.35)',
      borderRadius: '6px',
      background: 'rgba(128,128,128,.08)',
      color: 'inherit',
      fontSize: '12px',
      lineHeight: '20px',
      padding: '1px 8px',
      cursor: 'pointer',
    }
    const errorStyle = {
      color: '#e5484d',
      fontSize: '12px',
      marginLeft: '6px',
    }

    function FunButtons({ run }) {
      const [error, setError] = useState(null)
      const click = (command) => {
        setError(null)
        run(command).then((failure) => {
          if (failure) setError(failure)
        }, (reason) => {
          setError(reason instanceof Error ? reason.message : String(reason))
        })
      }
      return createElement(
        'div',
        { style: rowStyle },
        BUTTONS.map((button) => createElement('button', {
          key: button.command,
          type: 'button',
          style: buttonStyle,
          onClick: () => click(button.command),
        }, button.label)),
        error === null ? null : createElement('span', { style: errorStyle, role: 'status' }, error),
      )
    }

    function FunIdle({ useSession }) {
      const [line, setLine] = useState(0)
      const running = useSession((snapshot) => snapshot.running)

      useEffect(() => {
        const id = setInterval(() => {
          setLine((current) => (current + 1) % THINKING_LINES.length)
        }, 6000)
        return () => clearInterval(id)
      }, [])

      const lines = running ? THINKING_LINES : IDLE_LINES
      return createElement('div', {
        style: {
          color: 'rgba(70,130,220,.85)',
          fontSize: '12px',
          opacity: 0.75,
          padding: '3px 0 0',
        },
      }, lines[line % lines.length])
    }

    return {
      inject: ['slots', 'remote', 'remote.commands'],
      apply(ctx) {
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'funpack-idle',
          order: 3,
        }, FunIdle))
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'funpack',
          order: 5,
          inject: (sessionId) => ({
            run: async (line) => {
              const result = await ctx.remote.commands.execute(sessionId, line)
              if (!result.ok) return `${result.error.message} (${result.error.code})`
              return result.value === undefined ? `unknown command: ${line}` : null
            },
          }),
        }, FunButtons))
      },
    }
  },
})
