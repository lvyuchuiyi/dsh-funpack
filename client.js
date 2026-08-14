window.__ModuleLoader__.load({
  id: 'dsh-funpack',
  factory(require) {
    const { createElement, useState } = require('react')

    const BUTTONS = [
      { label: '✨ 夸我', command: '/praise' },
      { label: '🎴 运势', command: '/fortune' },
      { label: '📊 战报', command: '/report' },
      { label: '🍅 番茄 25', command: '/pomodoro 25' },
      { label: '🎭 人设', command: '/persona' },
      { label: '☕ 摸鱼', command: '/break' },
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

    return {
      inject: ['slots', 'remote'],
      apply(ctx) {
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
