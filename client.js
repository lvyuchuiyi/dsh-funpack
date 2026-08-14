window.__ModuleLoader__.load({
  id: 'dsh-funpack',
  factory(require) {
    const { createElement, useEffect, useState } = require('react')
    const { createPortal } = require('react-dom')

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

    const WHALE_SVG = '<svg viewBox="0 0 96 96" width="76" height="76" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M40 18 Q38 8 50 6 Q48 16 54 20 Q46 26 40 18Z" fill="#8ec5f7" opacity=".85">'
      + '<animate attributeName="opacity" values=".3;.95;.3" dur="1.8s" repeatCount="indefinite"/>'
      + '</path><g>'
      + '<path d="M20 54 Q16 34 28 26 Q42 14 56 16 Q72 18 78 30 Q84 42 80 56 Q72 70 56 72 Q40 74 30 66 Q22 60 20 54Z" fill="#4a90d9"/>'
      + '<ellipse cx="48" cy="66" rx="24" ry="13" fill="#cde8ff"/>'
      + '<circle cx="44" cy="52" r="6.5" fill="#14233f"/>'
      + '<circle cx="46" cy="49.5" r="2.2" fill="#fff"/>'
      + '<ellipse cx="56" cy="60" rx="5.5" ry="3.2" fill="#ffb6c1" opacity=".85"/>'
      + '<path d="M74 50 Q88 52 88 62 Q88 72 74 74 Q72 66 74 62 Q76 56 74 50Z" fill="#3b78c4">'
      + '<animateTransform attributeName="transform" type="rotate" values="0 80 62;9 80 62;0 80 62" dur="2.2s" repeatCount="indefinite"/>'
      + '</path><path d="M40 34 Q48 40 58 38 Q52 44 42 42Z" fill="#3b78c4"/>'
      + '</g></svg>'

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

    const petStyle = {
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 6,
      pointerEvents: 'none',
      userSelect: 'none',
    }
    const bubbleStyle = {
      background: 'rgba(255,255,255,.96)',
      border: '1px solid rgba(74,144,217,.35)',
      borderRadius: 10,
      padding: '6px 10px',
      fontSize: 12,
      color: '#16324f',
      boxShadow: '0 2px 10px rgba(0,0,0,.12)',
      maxWidth: 220,
      lineHeight: 1.5,
    }
    const petButtonStyle = {
      pointerEvents: 'auto',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.18))',
    }

    function FunPet({ useSession }) {
      const [line, setLine] = useState(0)
      const running = useSession((snapshot) => snapshot.running)

      useEffect(() => {
        const id = setInterval(() => {
          setLine((current) => (current + 1) % (running ? THINKING_LINES.length : IDLE_LINES.length))
        }, 5000)
        return () => clearInterval(id)
      }, [running])

      const lines = running ? THINKING_LINES : IDLE_LINES
      const text = lines[line % lines.length]
      return createPortal(
        createElement('div', { style: petStyle },
          createElement('div', { style: bubbleStyle, role: 'status' }, text),
          createElement('button', {
            type: 'button',
            style: petButtonStyle,
            title: '蓝色大肥鱼',
            onClick: () => setLine((current) => (current + 1) % lines.length),
            dangerouslySetInnerHTML: { __html: WHALE_SVG },
          }),
        ),
        document.body,
      )
    }

    return {
      inject: ['slots', 'remote', 'remote.commands'],
      apply(ctx) {
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'funpack-pet',
          order: 2,
        }, FunPet))
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
