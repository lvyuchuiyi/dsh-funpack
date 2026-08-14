window.__ModuleLoader__.load({
  id: 'dsh-funpack',
  factory(require) {
    const { createElement, Fragment, useEffect, useLayoutEffect, useRef, useState } = require('react')
    const { createPortal } = require('react-dom')

    const BUTTONS = [
      { label: '✨ 夸我', command: '/praise' },
      { label: '🎴 运势', command: '/fortune' },
      { label: '📊 战报', command: '/report' },
      { label: '🍅 番茄 25', command: '/pomodoro 25' },
      { label: '🎭 人设', command: '/persona' },
      { label: '☕ 摸鱼', command: '/break' },
    ]

    const BUTTON_MODULES = BUTTONS.map((button) => ({
      key: button.command,
      label: button.label,
      command: button.command,
      enabled: true,
    }))

    const BEAUTY_PRESETS = [
      {
        id: 'deep',
        label: '深空',
        vars: {
          '--fp-bg': '#0b1220',
          '--fp-panel': '#10161f',
          '--fp-panel2': '#182130',
          '--fp-border': '#2a3546',
          '--fp-text': '#e6edf3',
          '--fp-dim': '#8b98a9',
          '--fp-accent': '#3b82f6',
        },
      },
      {
        id: 'sakura',
        label: '樱花',
        vars: {
          '--fp-bg': '#241220',
          '--fp-panel': '#2d1726',
          '--fp-panel2': '#3d2033',
          '--fp-border': '#59314a',
          '--fp-text': '#ffeef7',
          '--fp-dim': '#d9a9bf',
          '--fp-accent': '#ec4899',
        },
      },
      {
        id: 'mint',
        label: '薄荷',
        vars: {
          '--fp-bg': '#0c1f1b',
          '--fp-panel': '#102820',
          '--fp-panel2': '#17352b',
          '--fp-border': '#245045',
          '--fp-text': '#e9fff6',
          '--fp-dim': '#9dc9b8',
          '--fp-accent': '#10b981',
        },
      },
      {
        id: 'terminal',
        label: '终端',
        vars: {
          '--fp-bg': '#0a0f0a',
          '--fp-panel': '#101710',
          '--fp-panel2': '#182418',
          '--fp-border': '#2c402c',
          '--fp-text': '#d6f5d6',
          '--fp-dim': '#7fa87f',
          '--fp-accent': '#22c55e',
        },
      },
      {
        id: 'paper',
        label: '纸白',
        vars: {
          '--fp-bg': '#f6f7fb',
          '--fp-panel': '#ffffff',
          '--fp-panel2': '#eef1f6',
          '--fp-border': '#d9dee8',
          '--fp-text': '#1f2937',
          '--fp-dim': '#6b7280',
          '--fp-accent': '#2563eb',
        },
      },
    ]

    const BEAUTY_FITS = ['stretch', 'fill', 'center', 'tile']
    const BEAUTY_FIT_LABELS = { stretch: '拉伸', fill: '填充', center: '居中', tile: '平铺' }
    const BEAUTY_FIT_SIZES = { stretch: '100% 100%', fill: 'cover', center: 'auto', tile: 'auto' }
    const BEAUTY_FIT_REPEATS = { stretch: 'no-repeat', fill: 'no-repeat', center: 'no-repeat', tile: 'repeat' }
    const BEAUTY_STYLE_ID = 'dsh-funpack-beauty-style'

    const DEFAULT_BEAUTY = {
      theme: 'deep',
      bgImage: null,
      bgFit: 'fill',
      bgAlpha: 85,
      tint: 45,
      bgBlur: 6,
      glass: true,
      bgScope: 'chat',
      buttonScale: 110,
      buttonAlign: 'center',
      effect: 'none',
      danmakuEnabled: true,
      danmakuStyle: 'neon',
      danmakuSpeed: 'normal',
      danmakuSize: 'medium',
      danmakuOpacity: 90,
      modules: BUTTON_MODULES.map((module) => ({ ...module })),
    }

    const beautyClamp = (value, min, max, fallback) => {
      const number = Number(value)
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback
    }

    const loadBeauty = () => {
      const defaults = { ...DEFAULT_BEAUTY, modules: DEFAULT_BEAUTY.modules.map((module) => ({ ...module })) }
      try {
        const raw = localStorage.getItem('dsh-funpack-beauty-config')
        if (!raw) return defaults
        const saved = JSON.parse(raw)
        return {
          theme: BEAUTY_PRESETS.some((preset) => preset.id === saved.theme) ? saved.theme : defaults.theme,
          bgImage: typeof saved.bgImage === 'string' ? saved.bgImage : null,
          bgFit: BEAUTY_FITS.includes(saved.bgFit) ? saved.bgFit : defaults.bgFit,
          bgAlpha: beautyClamp(saved.bgAlpha, 10, 100, defaults.bgAlpha),
          tint: beautyClamp(saved.tint, 0, 90, defaults.tint),
          bgBlur: beautyClamp(saved.bgBlur, 0, 20, defaults.bgBlur),
          glass: typeof saved.glass === 'boolean' ? saved.glass : defaults.glass,
          bgScope: ['chat', 'full'].includes(saved.bgScope) ? saved.bgScope : defaults.bgScope,
          buttonScale: beautyClamp(saved.buttonScale, 80, 160, defaults.buttonScale),
          buttonAlign: ['left', 'center', 'right'].includes(saved.buttonAlign) ? saved.buttonAlign : defaults.buttonAlign,
          effect: EFFECT_IDS.includes(saved.effect) ? saved.effect : defaults.effect,
          danmakuEnabled: typeof saved.danmakuEnabled === 'boolean' ? saved.danmakuEnabled : defaults.danmakuEnabled,
          danmakuStyle: DANMAKU_STYLE_IDS.includes(saved.danmakuStyle) ? saved.danmakuStyle : defaults.danmakuStyle,
          danmakuSpeed: DANMAKU_SPEED_IDS.includes(saved.danmakuSpeed) ? saved.danmakuSpeed : defaults.danmakuSpeed,
          danmakuSize: DANMAKU_SIZE_IDS.includes(saved.danmakuSize) ? saved.danmakuSize : defaults.danmakuSize,
          danmakuOpacity: beautyClamp(saved.danmakuOpacity, 30, 100, defaults.danmakuOpacity),
          modules: BUTTON_MODULES.map((def) => {
            const savedModule = Array.isArray(saved.modules)
              ? saved.modules.find((module) => module && module.key === def.key)
              : null
            return {
              key: def.key,
              label: savedModule?.label || def.label,
              command: savedModule?.command || def.command,
              enabled: savedModule ? savedModule.enabled !== false : true,
            }
          }),
        }
      } catch {
        return defaults
      }
    }

    const applyBeauty = (beauty) => {
      const preset = BEAUTY_PRESETS.find((item) => item.id === beauty.theme) || BEAUTY_PRESETS[0]
      const root = document.documentElement
      for (const [name, value] of Object.entries(preset.vars)) {
        root.style.setProperty(name, value)
      }
      root.style.setProperty('--fp-bg-image', beauty.bgImage ? `url("${beauty.bgImage}")` : 'none')
      root.style.setProperty('--fp-bg-size', BEAUTY_FIT_SIZES[beauty.bgFit] || 'cover')
      root.style.setProperty('--fp-bg-repeat', BEAUTY_FIT_REPEATS[beauty.bgFit] || 'no-repeat')
      root.style.setProperty('--fp-bg-alpha', String(beauty.bgAlpha / 100))
      root.style.setProperty('--fp-bg-tint', String(1 - beauty.tint / 200))
      root.style.setProperty('--fp-bg-blur', `${beauty.bgBlur}px`)
      root.style.setProperty('--fp-bg-overlay', String(beauty.tint / 100))

      document.body.classList.toggle('dsh-funpack-glass', beauty.glass)
      document.body.classList.toggle('dsh-funpack-bg-full', beauty.bgScope === 'full')
      document.body.classList.toggle('dsh-funpack-bg-chat', beauty.bgScope === 'chat')

      let layer = document.getElementById('dsh-funpack-bg-layer')
      if (!layer) {
        layer = document.createElement('div')
        layer.id = 'dsh-funpack-bg-layer'
        document.body.prepend(layer)
      }

      let fx = document.getElementById('dsh-funpack-fx')
      if (!fx) {
        fx = document.createElement('div')
        fx.id = 'dsh-funpack-fx'
        document.body.appendChild(fx)
      }
      fx.className = `dsh-funpack-fx dsh-funpack-fx-${beauty.effect}`

      let style = document.getElementById(BEAUTY_STYLE_ID)
      if (!style) {
        style = document.createElement('style')
        style.id = BEAUTY_STYLE_ID
        document.head.appendChild(style)
      }
      style.textContent = `
        #dsh-funpack-bg-layer {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: var(--fp-bg-image); background-size: var(--fp-bg-size);
          background-repeat: var(--fp-bg-repeat); background-position: center;
          opacity: var(--fp-bg-alpha); filter: brightness(var(--fp-bg-tint)) blur(var(--fp-bg-blur));
          transform: scale(1.06);
        }
        #dsh-funpack-bg-layer::after {
          content: ""; position: absolute; inset: 0;
          background: rgba(0, 0, 0, var(--fp-bg-overlay));
        }
        html, body, [class*="CgV-4G_frame"], [class*="cw98ZW_root"], [class*="cw98ZW_scrollBody"] {
          background-color: transparent !important;
        }
        [class*="cw98ZW_root"] { position: relative; }
        [class*="cw98ZW_root"]::before {
          content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: var(--fp-bg-image); background-size: var(--fp-bg-size);
          background-repeat: var(--fp-bg-repeat); background-position: center;
          opacity: var(--fp-bg-alpha); filter: brightness(var(--fp-bg-tint)) blur(var(--fp-bg-blur));
          transform: scale(1.06);
        }
        [class*="cw98ZW_root"]::after {
          content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: rgba(0, 0, 0, var(--fp-bg-overlay));
        }
        [class*="HIpiuG_card"], [class*="HIpiuG_grow"], [class*="HIpiuG_scroll"], textarea.HIpiuG_input {
          background: transparent !important;
        }
        body.dsh-funpack-bg-full #dsh-funpack-bg-layer { display: block; }
        body.dsh-funpack-bg-chat #dsh-funpack-bg-layer { display: none; }
        body.dsh-funpack-bg-full [class*="cw98ZW_root"]::before,
        body.dsh-funpack-bg-full [class*="cw98ZW_root"]::after { display: none; }
        body.dsh-funpack-bg-chat [class*="cw98ZW_root"]::before,
        body.dsh-funpack-bg-chat [class*="cw98ZW_root"]::after { display: block; }
        body.dsh-funpack-glass [class*="HIpiuG_card"] {
          background: rgba(255, 255, 255, .14) !important;
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
        }
        body.dsh-funpack-glass textarea.HIpiuG_input { color: var(--fp-text, #e6edf3) !important; }
        #dsh-funpack-fx {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .55;
        }
        .dsh-funpack-fx-none { display: none; }
        .dsh-funpack-fx-stars {
          background-image:
            radial-gradient(1.5px 1.5px at 12% 22%, rgba(255,255,255,.95), transparent),
            radial-gradient(2px 2px at 34% 64%, rgba(255,255,255,.8), transparent),
            radial-gradient(1px 1px at 62% 18%, rgba(255,255,255,.9), transparent),
            radial-gradient(2px 2px at 82% 44%, rgba(255,255,255,.75), transparent),
            radial-gradient(1.5px 1.5px at 46% 82%, rgba(255,255,255,.85), transparent);
          animation: dshFpTwinkle 3.6s ease-in-out infinite;
        }
        .dsh-funpack-fx-rain {
          background-image: linear-gradient(transparent 0%, rgba(125,185,255,.5) 50%, transparent 100%);
          background-size: 2px 90px;
          animation: dshFpRain .55s linear infinite;
        }
        .dsh-funpack-fx-sakura {
          background-image:
            radial-gradient(6px 6px at 20% 30%, rgba(255,182,193,.95), transparent),
            radial-gradient(5px 5px at 80% 20%, rgba(255,192,203,.85), transparent),
            radial-gradient(7px 7px at 50% 70%, rgba(255,182,193,.7), transparent);
          animation: dshFpSakura 9s linear infinite;
        }
        .dsh-funpack-fx-aurora {
          background-image: linear-gradient(120deg, rgba(52,211,153,.28), rgba(96,165,250,.22), rgba(217,70,239,.22));
          background-size: 300% 300%;
          animation: dshFpAurora 9s ease infinite;
        }
        @keyframes dshFpTwinkle {
          0%, 100% { opacity: .35; }
          50% { opacity: .9; }
        }
        @keyframes dshFpRain {
          from { background-position: 0 0; }
          to { background-position: -24px 90px; }
        }
        @keyframes dshFpSakura {
          from { background-position: 0 0, 0 0, 0 0; }
          to { background-position: -90px 130px, -50px 100px, 70px 150px; }
        }
        @keyframes dshFpAurora {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes dshFpDanmaku {
          from { transform: translateX(0); }
          to { transform: translateX(-130vw); }
        }
      `
    }

    const AFFINITY_STORAGE_KEY = 'dsh-funpack-pet-affinity'
    const AFFINITY_LEVELS = [
      { level: 1, min: 0, title: '初遇' },
      { level: 2, min: 50, title: '熟络' },
      { level: 3, min: 150, title: '默契' },
      { level: 4, min: 300, title: '挚友' },
      { level: 5, min: 500, title: '灵魂绑定' },
    ]
    const AFFINITY_RULES = { pet: 5, feed: 8, hug: 6, task: 10 }
    const AFFINITY_COMMANDS = { '/pet': 'pet', '/feed': 'feed', '/hug': 'hug' }
    const DONE_LINES = [
      '任务完成，桌宠给你比了个心。',
      '搞定啦，不愧是你！',
      '漂亮，奖励自己摸鱼五分钟吧。',
    ]
    const LEVEL_BONUS_LINES = {
      2: ['已经和你很熟啦，可以一起吐槽老板了。'],
      3: ['默契值拉满，你抬个手我就知道要摸鱼。'],
      4: ['我们是挚友了，今晚一起看星星吧。'],
      5: ['灵魂绑定完成，这辈子你都是我的主人。'],
    }
    const EFFECT_OPTIONS = [
      { id: 'none', label: '无' },
      { id: 'stars', label: '星空' },
      { id: 'rain', label: '雨滴' },
      { id: 'sakura', label: '樱花' },
      { id: 'aurora', label: '极光' },
    ]
    const EFFECT_IDS = EFFECT_OPTIONS.map((option) => option.id)

    const DANMAKU_COMMANDS = new Set(['/praise', '/fortune'])
    const DANMAKU_STYLES = [
      { id: 'classic', label: '白字', color: '#ffffff', shadow: '0 0 6px rgba(0,0,0,.9)' },
      { id: 'neon', label: '霓虹', color: '#22d3ee', shadow: '0 0 8px #22d3ee, 0 0 18px #22d3ee' },
      { id: 'candy', label: '糖果', color: '#ff9ac1', shadow: '0 0 8px #ff2d95, 0 0 18px #ff2d95' },
      { id: 'ink', label: '墨鱼', color: '#fbbf24', shadow: '0 0 8px rgba(0,0,0,.9), 2px 2px 0 #78350f' },
      { id: 'cyber', label: '赛博', color: '#a5f3fc', shadow: '0 0 10px #22d3ee, 3px 3px 0 #7c3aed' },
    ]
    const DANMAKU_SPEEDS = { slow: 11, normal: 8, fast: 5.5 }
    const DANMAKU_SIZES = { small: 16, medium: 22, large: 30 }
    const DANMAKU_SPEED_LABELS = { slow: '慢', normal: '中', fast: '快' }
    const DANMAKU_SIZE_LABELS = { small: '小', medium: '中', large: '大' }
    const DANMAKU_STYLE_IDS = DANMAKU_STYLES.map((style) => style.id)
    const DANMAKU_SPEED_IDS = Object.keys(DANMAKU_SPEEDS)
    const DANMAKU_SIZE_IDS = Object.keys(DANMAKU_SIZES)

    const ATMOSPHERE_SCENES = [
      { id: 'off', label: '安静', desc: '什么都不放，专心写码' },
      { id: 'cafe', label: '咖啡雨声', desc: '窗边雨声 + 咖啡店暖噪' },
      { id: 'server', label: '机房白噪', desc: '风扇与低频轰鸣' },
      { id: 'cyber', label: '赛博脉冲', desc: '合成器脉冲 + 数字底噪' },
      { id: 'lofi', label: 'Lo-Fi 节拍', desc: '慢速鼓点 + 温暖贝斯' },
    ]
    const ATMOSPHERE_IDS = ATMOSPHERE_SCENES.map((scene) => scene.id)
    const ATMOSPHERE_KEY = 'dsh-funpack-atmosphere-config'
    const audioState = { ctx: null, master: null, nodes: [], timer: null, scene: 'off' }

    const loadAtmosphere = () => {
      const defaults = { scene: 'off', volume: 60, autoLink: true }
      try {
        const raw = localStorage.getItem(ATMOSPHERE_KEY)
        if (!raw) return defaults
        const saved = JSON.parse(raw)
        return {
          scene: ATMOSPHERE_IDS.includes(saved.scene) ? saved.scene : defaults.scene,
          volume: beautyClamp(saved.volume, 0, 100, defaults.volume),
          autoLink: typeof saved.autoLink === 'boolean' ? saved.autoLink : defaults.autoLink,
        }
      } catch {
        return defaults
      }
    }

    const saveAtmosphere = (config) => {
      try {
        localStorage.setItem(ATMOSPHERE_KEY, JSON.stringify(config))
      } catch {}
    }

    const ensureAudio = () => {
      if (audioState.ctx) return audioState.ctx
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return null
      const ctx = new AudioContextClass()
      const master = ctx.createGain()
      master.gain.value = 0
      master.connect(ctx.destination)
      audioState.ctx = ctx
      audioState.master = master
      return ctx
    }

    const stopAtmosphere = () => {
      if (audioState.timer) {
        clearInterval(audioState.timer)
        audioState.timer = null
      }
      for (const node of audioState.nodes) {
        try { node.stop?.(0) } catch {}
        try { node.disconnect?.() } catch {}
      }
      audioState.nodes = []
      audioState.scene = 'off'
      if (audioState.ctx && audioState.master) audioState.master.gain.value = 0
    }

    const makeNoiseBuffer = (ctx, seconds = 2) => {
      const length = Math.max(1, Math.floor(ctx.sampleRate * seconds))
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let last = 0
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1
        last = (last + 0.02 * white) / 1.02
        data[i] = last * 3.5
      }
      return buffer
    }

    const addNoise = (ctx, gainValue, filterType, frequency, q) => {
      const source = ctx.createBufferSource()
      source.buffer = makeNoiseBuffer(ctx, 2)
      source.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = filterType || 'lowpass'
      filter.frequency.value = frequency || 800
      filter.Q.value = q || 0.6
      const gain = ctx.createGain()
      gain.gain.value = gainValue
      source.connect(filter)
      filter.connect(gain)
      gain.connect(audioState.master)
      source.start()
      audioState.nodes.push(source, filter, gain)
    }

    const addPad = (ctx, frequency, gainValue, type = 'sine') => {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = frequency
      const gain = ctx.createGain()
      gain.gain.value = gainValue
      osc.connect(gain)
      gain.connect(audioState.master)
      osc.start()
      audioState.nodes.push(osc, gain)
    }

    const startAtmosphere = (scene, volume) => {
      const ctx = ensureAudio()
      if (!ctx) return
      stopAtmosphere()
      const gain = Math.max(0, Math.min(100, volume)) / 100
      audioState.master.gain.value = gain * 0.7
      audioState.scene = scene
      if (scene === 'cafe') {
        addNoise(ctx, 0.32, 'lowpass', 900, 0.4)
        addNoise(ctx, 0.05, 'highpass', 2400, 0.8)
        addPad(ctx, 110, 0.015)
        addPad(ctx, 164.81, 0.012)
        addPad(ctx, 220, 0.008)
      } else if (scene === 'server') {
        addPad(ctx, 60, 0.07)
        addPad(ctx, 120, 0.02)
        addNoise(ctx, 0.16, 'highpass', 500, 0.5)
      } else if (scene === 'cyber') {
        addNoise(ctx, 0.06, 'bandpass', 2600, 1.2)
        audioState.timer = setInterval(() => {
          const now = ctx.currentTime
          const osc = ctx.createOscillator()
          osc.type = 'square'
          osc.frequency.setValueAtTime(55 + Math.random() * 40, now)
          const envelope = ctx.createGain()
          envelope.gain.setValueAtTime(0.0001, now)
          envelope.gain.exponentialRampToValueAtTime(0.05, now + 0.02)
          envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
          osc.connect(envelope)
          envelope.connect(audioState.master)
          osc.start(now)
          osc.stop(now + 0.15)
        }, 420)
      } else if (scene === 'lofi') {
        addNoise(ctx, 0.025, 'lowpass', 1400, 0.7)
        const bassNotes = [55, 55, 65.41, 49]
        let beat = 0
        audioState.timer = setInterval(() => {
          const now = ctx.currentTime
          const kick = ctx.createOscillator()
          kick.type = 'sine'
          kick.frequency.setValueAtTime(150, now)
          kick.frequency.exponentialRampToValueAtTime(42, now + 0.12)
          const kickGain = ctx.createGain()
          kickGain.gain.setValueAtTime(0.16, now)
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
          kick.connect(kickGain)
          kickGain.connect(audioState.master)
          kick.start(now)
          kick.stop(now + 0.2)

          const hat = ctx.createBufferSource()
          hat.buffer = makeNoiseBuffer(ctx, 0.1)
          const hatFilter = ctx.createBiquadFilter()
          hatFilter.type = 'highpass'
          hatFilter.frequency.value = 6000
          const hatGain = ctx.createGain()
          hatGain.gain.setValueAtTime(0.045, now)
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
          hat.connect(hatFilter)
          hatFilter.connect(hatGain)
          hatGain.connect(audioState.master)
          hat.start(now)
          hat.stop(now + 0.1)

          const bass = ctx.createOscillator()
          bass.type = 'sawtooth'
          bass.frequency.value = bassNotes[beat % bassNotes.length]
          const bassFilter = ctx.createBiquadFilter()
          bassFilter.type = 'lowpass'
          bassFilter.frequency.value = 260
          const bassGain = ctx.createGain()
          bassGain.gain.setValueAtTime(0.035, now)
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42)
          bass.connect(bassFilter)
          bassFilter.connect(bassGain)
          bassGain.connect(audioState.master)
          bass.start(now)
          bass.stop(now + 0.45)
          beat += 1
        }, 450)
      }
    }

    const applyAtmosphereConfig = (config) => {
      const next = {
        scene: ATMOSPHERE_IDS.includes(config.scene) ? config.scene : 'off',
        volume: beautyClamp(config.volume, 0, 100, 60),
        autoLink: typeof config.autoLink === 'boolean' ? config.autoLink : true,
      }
      saveAtmosphere(next)
      if (next.scene === 'off') {
        stopAtmosphere()
      } else if (audioState.scene !== next.scene) {
        startAtmosphere(next.scene, next.volume)
      } else if (audioState.master) {
        audioState.master.gain.value = (next.volume / 100) * 0.7
      }
      return next
    }

    const ACHIEVEMENTS_KEY = 'dsh-funpack-achievements'
    const ACHIEVEMENTS = [
      { id: 'first-praise', title: '第一句夸', desc: '使用「夸我」1 次', icon: '✨', check: (state) => state.stats.praise >= 1 },
      { id: 'fortune-10', title: '玄学十连', desc: '抽签 10 次', icon: '🔮', check: (state) => state.stats.fortune >= 10 },
      { id: 'report-1', title: '战报初体验', desc: '生成 1 次战报', icon: '📊', check: (state) => state.stats.report >= 1 },
      { id: 'pomodoro-5', title: '番茄杀手', desc: '完成 5 个番茄钟', icon: '🍅', check: (state) => state.stats.pomodoro >= 5 },
      { id: 'break-10', title: '摸鱼十级学者', desc: '摸鱼 10 次', icon: '🛋️', check: (state) => state.stats.break >= 10 },
      { id: 'pet-lv2', title: '桌宠好友', desc: '桌宠好感达到 Lv.2', icon: '🐟', check: (state) => state.stats.petPoints >= 50 },
      { id: 'pet-lv5', title: '灵魂绑定', desc: '桌宠好感达到 Lv.5', icon: '💙', check: (state) => state.stats.petPoints >= 500 },
      { id: 'task-10', title: '任务收割机', desc: '完成 10 次任务', icon: '⚡', check: (state) => state.stats.task >= 10 },
      { id: 'streak-3', title: '三天热度', desc: '连续使用 3 天', icon: '🔥', check: (state) => state.streak >= 3 },
      { id: 'streak-7', title: '一周全勤', desc: '连续使用 7 天', icon: '👑', check: (state) => state.streak >= 7 },
      { id: 'season-500', title: '赛季王者', desc: '赛季积分达到 500', icon: '🏆', check: (state) => state.season.points >= 500 },
      { id: 'garden-1', title: '第一棵代码树', desc: '种下 1 棵代码树', icon: '🌱', check: (state) => state.stats.garden >= 1 },
      { id: 'garden-10', title: '代码森林', desc: '种下 10 棵代码树', icon: '🌳', check: (state) => state.stats.garden >= 10 },
    ]
    const SEASON_RANKS = [
      { min: 0, title: '摸鱼青铜' },
      { min: 120, title: '摸鱼白银' },
      { min: 280, title: '摸鱼黄金' },
      { min: 520, title: '摸鱼铂金' },
      { min: 880, title: '摸鱼钻石' },
      { min: 1400, title: '摸鱼王者' },
    ]
    const SEASON_POINTS = {
      praise: 2,
      fortune: 2,
      report: 3,
      pomodoro: 8,
      break: 4,
      pet: 1,
      feed: 2,
      hug: 2,
      task: 6,
      petPoints: 1,
      garden: 5,
    }
    const currentSeason = () => {
      const now = new Date()
      return `${now.getFullYear()}-S${Math.floor(now.getMonth() / 3) + 1}`
    }
    const pad2 = (value) => String(value).padStart(2, '0')
    const dateKeyForOffset = (offset = 0) => {
      const now = new Date(Date.now() + offset * 86400000)
      return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
    }
    const emptyActivity = () => ({
      praise: 0,
      fortune: 0,
      report: 0,
      pomodoro: 0,
      pomodoroMin: 0,
      break: 0,
      pet: 0,
      feed: 0,
      hug: 0,
      task: 0,
      petPoints: 0,
    })
    const defaultAchievements = () => ({
      stats: emptyActivity(),
      season: { ...emptyActivity(), id: currentSeason(), points: 0 },
      unlocked: [],
      streak: 0,
      lastActive: '',
    })
    const loadAchievements = () => {
      const defaults = defaultAchievements()
      try {
        const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
        if (!raw) return defaults
        const saved = JSON.parse(raw)
        const seasonMatches = saved.season?.id === defaults.season.id
        return {
          stats: { ...defaults.stats, ...(saved.stats || {}) },
          season: seasonMatches
            ? { ...defaults.season, ...saved.season, points: beautyClamp(saved.season?.points, 0, 999999, 0) }
            : defaults.season,
          unlocked: Array.isArray(saved.unlocked) ? saved.unlocked.filter((id) => typeof id === 'string') : [],
          streak: beautyClamp(saved.streak, 0, 999999, 0),
          lastActive: typeof saved.lastActive === 'string' ? saved.lastActive : '',
        }
      } catch {
        return defaults
      }
    }
    const saveAchievements = (state) => {
      try {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(state))
      } catch {}
    }
    const seasonRank = (points) => {
      let rank = SEASON_RANKS[0]
      for (const item of SEASON_RANKS) {
        if (points >= item.min) rank = item
      }
      return rank
    }
    const recordActivity = (type, amount = 1, extra = {}) => {
      const state = loadAchievements()
      const today = dateKeyForOffset()
      const yesterday = dateKeyForOffset(-1)
      if (state.lastActive !== today) {
        state.streak = state.lastActive === yesterday ? state.streak + 1 : 1
        state.lastActive = today
      }
      state.stats[type] = (state.stats[type] || 0) + amount
      state.season[type] = (state.season[type] || 0) + amount
      state.season.points += (SEASON_POINTS[type] || 1) * amount
      if (extra.pomodoroMin) {
        const minutes = Number(extra.pomodoroMin) || 0
        state.stats.pomodoroMin = (state.stats.pomodoroMin || 0) + minutes
        state.season.pomodoroMin = (state.season.pomodoroMin || 0) + minutes
      }
      const unlocked = []
      for (const achievement of ACHIEVEMENTS) {
        if (!state.unlocked.includes(achievement.id) && achievement.check(state)) {
          state.unlocked.push(achievement.id)
          unlocked.push(achievement)
        }
      }
      saveAchievements(state)
      window.dispatchEvent(new CustomEvent('dsh-funpack-achievements-change', { detail: { state } }))
      if (unlocked.length > 0) {
        window.dispatchEvent(new CustomEvent('dsh-funpack-unlock', {
          detail: { titles: unlocked.map((achievement) => achievement.title) },
        }))
      }
      return unlocked
    }
    const recordCommand = (command) => {
      const pomodoro = command.match(/^\/pomodoro\s+(\d+)/)
      if (pomodoro) return recordActivity('pomodoro', 1, { pomodoroMin: Number(pomodoro[1]) || 25 })
      if (command === '/break' || command === '/break-go' || command.startsWith('/break-go ')) {
        return recordActivity('break', 1)
      }
      const statMap = {
        '/praise': 'praise',
        '/fortune': 'fortune',
        '/report': 'report',
        '/pet': 'pet',
        '/feed': 'feed',
        '/hug': 'hug',
      }
      const key = statMap[command] || statMap[command.split(' ')[0]]
      return key ? recordActivity(key, 1) : []
    }

    const TTS_KEY = 'dsh-funpack-tts-config'
    const DEFAULT_TTS = { enabled: false, voice: '', rate: 1, pitch: 1, endpoint: '' }
    const loadTTS = () => {
      try {
        const raw = localStorage.getItem(TTS_KEY)
        if (!raw) return { ...DEFAULT_TTS }
        const saved = JSON.parse(raw)
        return {
          enabled: typeof saved.enabled === 'boolean' ? saved.enabled : DEFAULT_TTS.enabled,
          voice: typeof saved.voice === 'string' ? saved.voice : '',
          rate: beautyClamp(saved.rate, 0.5, 2, 1),
          pitch: beautyClamp(saved.pitch, 0.5, 2, 1),
          endpoint: typeof saved.endpoint === 'string' ? saved.endpoint : '',
        }
      } catch {
        return { ...DEFAULT_TTS }
      }
    }
    const saveTTS = (config) => {
      try {
        localStorage.setItem(TTS_KEY, JSON.stringify(config))
      } catch {}
    }

    const speakText = (text) => {
      const config = loadTTS()
      if (!config.enabled || !text) return
      const sayWithBrowser = () => {
        if (!('speechSynthesis' in window)) return
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'zh-CN'
        utterance.rate = config.rate
        utterance.pitch = config.pitch
        const voices = window.speechSynthesis.getVoices()
        const voice = voices.find((item) => item.name === config.voice || item.voiceURI === config.voice)
        if (voice) utterance.voice = voice
        window.speechSynthesis.speak(utterance)
      }
      if (config.endpoint) {
        fetch(config.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text, voice: config.voice }),
        })
          .then((response) => {
            if (!response.ok) throw new Error(String(response.status))
            return response.blob()
          })
          .then((blob) => {
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audio.onended = () => URL.revokeObjectURL(url)
            audio.play().catch(sayWithBrowser)
          })
          .catch(sayWithBrowser)
      } else {
        sayWithBrowser()
      }
    }

    const GARDEN_KEY = 'dsh-funpack-garden'
    const PENDING_POMODORO_KEY = 'dsh-funpack-pending-pomodoro'
    const GARDEN_EMOJI = ['🌰', '🌱', '🌿', '🪴', '🌳']
    const LIVE2D_SCRIPTS = [
      'https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.js',
      'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
      'https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js',
      'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism2.min.js',
      'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js',
      'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js',
    ]
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`脚本加载失败：${src}`))
      document.head.appendChild(script)
    })
    const destroyLive2d = () => {
      if (live2dRef?.current) {
        try { live2dRef.current.app?.destroy?.(true) } catch {}
        live2dRef.current = null
      }
    }
    const loadGarden = () => {
      const defaults = { trees: [], totalMinutes: 0, plantsToday: 0, log: [] }
      try {
        const raw = localStorage.getItem(GARDEN_KEY)
        if (!raw) return defaults
        const saved = JSON.parse(raw)
        return {
          trees: Array.isArray(saved.trees) ? saved.trees.filter((tree) => tree && typeof tree === 'object') : [],
          totalMinutes: beautyClamp(saved.totalMinutes, 0, 999999, 0),
          plantsToday: beautyClamp(saved.plantsToday, 0, 99999, 0),
          log: Array.isArray(saved.log) ? saved.log.slice(0, 20) : [],
        }
      } catch {
        return defaults
      }
    }
    const saveGarden = (garden) => {
      try {
        localStorage.setItem(GARDEN_KEY, JSON.stringify(garden))
      } catch {}
    }
    const growGarden = (minutes = 25) => {
      const garden = loadGarden()
      let tree = garden.trees.find((item) => item.stage < GARDEN_EMOJI.length - 1)
      const isNewTree = !tree
      if (!tree) {
        tree = { id: `${Date.now()}-${Math.random()}`, plantedAt: Date.now(), stage: 0, minutes: 0 }
        garden.trees.push(tree)
      }
      tree.stage += 1
      tree.minutes += minutes
      garden.totalMinutes += minutes
      garden.plantsToday += 1
      garden.log.unshift({
        time: Date.now(),
        text: isNewTree
          ? `种下第 ${garden.trees.length} 棵代码树，专注 ${minutes} 分钟`
          : `代码树长到 ${GARDEN_EMOJI[tree.stage]}，累计专注 ${tree.minutes} 分钟`,
      })
      garden.log = garden.log.slice(0, 20)
      saveGarden(garden)
      if (isNewTree) recordActivity('garden', 1)
      window.dispatchEvent(new CustomEvent('dsh-funpack-garden-change', { detail: { garden, tree } }))
      return garden
    }
    const scheduleGardenFromPending = () => {
      try {
        const raw = localStorage.getItem(PENDING_POMODORO_KEY)
        if (!raw) return null
        const pending = JSON.parse(raw)
        const remaining = Number(pending.endAt) - Date.now()
        if (remaining <= 0) {
          localStorage.removeItem(PENDING_POMODORO_KEY)
          growGarden(Number(pending.minutes) || 25)
          return null
        }
        return setTimeout(() => {
          localStorage.removeItem(PENDING_POMODORO_KEY)
          growGarden(Number(pending.minutes) || 25)
        }, remaining)
      } catch {
        return null
      }
    }

    const loadAffinity = () => {
      const defaults = { points: 0, pet: 0, feed: 0, hug: 0, task: 0 }
      try {
        const raw = localStorage.getItem(AFFINITY_STORAGE_KEY)
        if (!raw) return defaults
        const saved = JSON.parse(raw)
        return {
          points: beautyClamp(saved.points, 0, 999999, 0),
          pet: beautyClamp(saved.pet, 0, 999999, 0),
          feed: beautyClamp(saved.feed, 0, 999999, 0),
          hug: beautyClamp(saved.hug, 0, 999999, 0),
          task: beautyClamp(saved.task, 0, 999999, 0),
        }
      } catch {
        return defaults
      }
    }

    const affinityLevel = (points) => {
      let current = AFFINITY_LEVELS[0]
      for (const level of AFFINITY_LEVELS) {
        if (points >= level.min) current = level
      }
      return current
    }

    const nextAffinityLevel = (points) => AFFINITY_LEVELS.find((level) => level.min > points) || null

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

    const PET_IDLE = 'data:image/gif;base64,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'
    const PET_WAVING = 'data:image/gif;base64,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'

    const rowStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      padding: '6px 0 0',
      alignItems: 'center',
    }
    const buttonStyle = {
      border: '1px solid var(--fp-border, rgba(128,128,128,.35))',
      borderRadius: '6px',
      background: 'var(--fp-panel2, rgba(128,128,128,.08))',
      color: 'var(--fp-text, inherit)',
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
    const danmakuLayerStyle = {
      position: 'fixed',
      inset: 0,
      zIndex: 9998,
      pointerEvents: 'none',
      overflow: 'hidden',
    }

    function FunButtons({ run }) {
      const [error, setError] = useState(null)
      const [beautyOpen, setBeautyOpen] = useState(false)
      const [beauty, setBeauty] = useState(loadBeauty)
      const [petVisible, setPetVisible] = useState(loadPetVisible)
      const [danmaku, setDanmaku] = useState([])
      const [breakTarget, setBreakTarget] = useState(() => localStorage.getItem('dsh-funpack-break-target') || '')
      const [atmosphere, setAtmosphere] = useState(loadAtmosphere)
      const [achievements, setAchievements] = useState(loadAchievements)
      const [achievementOpen, setAchievementOpen] = useState(false)
      const [marketOpen, setMarketOpen] = useState(false)
      const [gardenOpen, setGardenOpen] = useState(false)
      const [hubOpen, setHubOpen] = useState(false)
      const [garden, setGarden] = useState(loadGarden)
      const [bossOpen, setBossOpen] = useState(false)
      const [bossKeyPath, setBossKeyPath] = useState(() => localStorage.getItem('dsh-funpack-boss-key-path') || '')
      const previousThemeRef = useRef(null)
      const pendingTimerRef = useRef(null)

      useEffect(() => {
        try {
          localStorage.setItem('dsh-funpack-beauty-config', JSON.stringify(beauty))
        } catch {}
        applyBeauty(beauty)
      }, [beauty])

      useEffect(() => {
        const syncPetVisible = () => setPetVisible(loadPetVisible())
        window.addEventListener('dsh-funpack-pet-visible-change', syncPetVisible)
        return () => window.removeEventListener('dsh-funpack-pet-visible-change', syncPetVisible)
      }, [])

      const showDanmaku = (text) => {
        if (!beauty.danmakuEnabled || !text) return
        const id = `${Date.now()}-${Math.random()}`
        setDanmaku((list) => [...list, { id, text }])
        setTimeout(() => setDanmaku((list) => list.filter((item) => item.id !== id)), 8000)
      }

      useEffect(() => {
        const syncAchievements = () => setAchievements(loadAchievements())
        const showUnlock = (event) => {
          const titles = event.detail?.titles
          if (titles?.length) showDanmaku(`🏆 解锁成就：${titles.join('、')}`)
        }
        window.addEventListener('dsh-funpack-achievements-change', syncAchievements)
        window.addEventListener('dsh-funpack-unlock', showUnlock)
        return () => {
          window.removeEventListener('dsh-funpack-achievements-change', syncAchievements)
          window.removeEventListener('dsh-funpack-unlock', showUnlock)
        }
      }, [])

      useEffect(() => {
        recordActivity('visit', 1)
      }, [])

      useEffect(() => {
        pendingTimerRef.current = scheduleGardenFromPending()
        return () => clearTimeout(pendingTimerRef.current)
      }, [])

      useEffect(() => {
        const syncGarden = () => setGarden(loadGarden())
        window.addEventListener('dsh-funpack-garden-change', syncGarden)
        return () => window.removeEventListener('dsh-funpack-garden-change', syncGarden)
      }, [])

      const click = async (command) => {
        setError(null)
        try {
          const result = await run(command)
          if (!result) return
          if (result.ok === false) {
            setError(result.error)
            return
          }
          recordCommand(command)
          const pomodoro = command.match(/^\/pomodoro\s+(\d+)/)
          if (pomodoro) {
            const minutes = Number(pomodoro[1]) || 25
            const endAt = Date.now() + minutes * 60000
            try {
              localStorage.setItem(PENDING_POMODORO_KEY, JSON.stringify({ endAt, minutes }))
            } catch {}
            clearTimeout(pendingTimerRef.current)
            pendingTimerRef.current = setTimeout(() => {
              try { localStorage.removeItem(PENDING_POMODORO_KEY) } catch {}
              growGarden(minutes)
            }, minutes * 60000)
          }
          if (command === '/pomodoro-stop') {
            clearTimeout(pendingTimerRef.current)
            try { localStorage.removeItem(PENDING_POMODORO_KEY) } catch {}
          }
          if (DANMAKU_COMMANDS.has(command) && result.text) showDanmaku(result.text)
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : String(reason))
        }
      }

      const updateAtmosphere = (patch) => {
        const next = applyAtmosphereConfig({ ...atmosphere, ...patch })
        setAtmosphere(next)
        return next
      }

      const clickButton = async (button) => {
        if ((button.command === '/break' || button.command.startsWith('/break-go')) && atmosphere.autoLink) {
          updateAtmosphere({ scene: 'lofi' })
        }
        if (button.command === '/break' && breakTarget.trim()) {
          const target = normalizeBreakTarget(breakTarget)
          if (isUrlBreakTarget(breakTarget)) {
            recordCommand('/break')
            window.open(target, '_blank', 'noopener,noreferrer')
            return
          }
          return click(`/break-go ${breakTarget.trim()}`)
        }
        if (button.command.startsWith('/pomodoro') && atmosphere.autoLink) {
          updateAtmosphere({ scene: 'cafe' })
        }
        return click(button.command)
      }

      const updateBeauty = (patch) => setBeauty((current) => ({ ...current, ...patch }))
      const moveModule = (key, delta) => setBeauty((current) => {
        const modules = current.modules.map((module) => ({ ...module }))
        const at = modules.findIndex((module) => module.key === key)
        const to = at + delta
        if (at === -1 || to < 0 || to >= modules.length) return current
        const [item] = modules.splice(at, 1)
        modules.splice(to, 0, item)
        return { ...current, modules }
      })
      const resetBeauty = () => setBeauty({
        ...DEFAULT_BEAUTY,
        modules: DEFAULT_BEAUTY.modules.map((module) => ({ ...module })),
      })

      const togglePet = () => {
        const next = !loadPetVisible()
        localStorage.setItem(PET_VISIBLE_KEY, next ? '1' : '0')
        setPetVisible(next)
        window.dispatchEvent(new Event('dsh-funpack-pet-visible-change'))
      }

      const toggleBoss = () => {
        if (bossOpen) {
          setBossOpen(false)
          if (previousThemeRef.current) updateBeauty({ theme: previousThemeRef.current })
          localStorage.setItem(PET_VISIBLE_KEY, '1')
          window.dispatchEvent(new Event('dsh-funpack-pet-visible-change'))
          return
        }
        previousThemeRef.current = beauty.theme
        setBossOpen(true)
        if (bossKeyPath.trim()) run(`/break-go ${bossKeyPath.trim()}`)
        updateBeauty({ theme: 'terminal' })
        updateAtmosphere({ scene: 'off' })
        localStorage.setItem(PET_VISIBLE_KEY, '0')
        window.dispatchEvent(new Event('dsh-funpack-pet-visible-change'))
      }

      const updateBossKeyPath = (value) => {
        setBossKeyPath(value)
        localStorage.setItem('dsh-funpack-boss-key-path', value)
      }

      const openFromHub = (key) => {
        setHubOpen(false)
        if (key === 'achievement') setAchievementOpen(true)
        if (key === 'market') setMarketOpen(true)
        if (key === 'garden') setGardenOpen(true)
        if (key === 'boss') toggleBoss()
      }

      const updateBreakTarget = (value) => {
        setBreakTarget(value)
        localStorage.setItem('dsh-funpack-break-target', value)
      }

      const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
      const scale = beauty.buttonScale / 100
      const enabledModules = beauty.modules.filter((module) => module.enabled)
      const row = bossOpen ? null : createElement(
        'div',
        { style: { ...rowStyle, justifyContent: alignMap[beauty.buttonAlign] } },
        enabledModules.map((button) => createElement('button', {
          key: button.key,
          type: 'button',
          style: {
            ...buttonStyle,
            fontSize: `${Math.round(12 * scale)}px`,
            lineHeight: `${Math.round(20 * scale)}px`,
            padding: `${Math.round(1 * scale)}px ${Math.round(8 * scale)}px`,
          },
          onClick: () => clickButton(button),
        }, button.label)),
        createElement('button', {
          key: 'pet-visible',
          type: 'button',
          style: {
            ...buttonStyle,
            fontSize: `${Math.round(12 * scale)}px`,
            lineHeight: `${Math.round(20 * scale)}px`,
            padding: `${Math.round(1 * scale)}px ${Math.round(8 * scale)}px`,
          },
          onClick: togglePet,
        }, petVisible ? '🐾 桌宠开' : '🐾 桌宠关'),
        createElement('button', {
          key: 'beauty',
          type: 'button',
          style: {
            ...buttonStyle,
            fontSize: `${Math.round(12 * scale)}px`,
            lineHeight: `${Math.round(20 * scale)}px`,
            padding: `${Math.round(1 * scale)}px ${Math.round(8 * scale)}px`,
          },
          onClick: () => setBeautyOpen((open) => !open),
        }, '🎨 美化'),
        createElement('button', {
          key: 'hub',
          type: 'button',
          style: {
            ...buttonStyle,
            fontSize: `${Math.round(12 * scale)}px`,
            lineHeight: `${Math.round(20 * scale)}px`,
            padding: `${Math.round(1 * scale)}px ${Math.round(8 * scale)}px`,
          },
          onClick: () => setHubOpen(true),
        }, '🧩 Fun'),
        createElement('button', {
          key: 'boss',
          type: 'button',
          style: {
            ...buttonStyle,
            fontSize: `${Math.round(12 * scale)}px`,
            lineHeight: `${Math.round(20 * scale)}px`,
            padding: `${Math.round(1 * scale)}px ${Math.round(8 * scale)}px`,
            borderColor: bossOpen ? 'var(--fp-accent, #22c55e)' : 'var(--fp-border, #2a3546)',
          },
          onClick: toggleBoss,
        }, bossOpen ? '🕶 恢复' : '🕶 Boss'),
        error === null ? null : createElement('span', { style: errorStyle, role: 'status' }, error),
      )

      const danmakuStyleDef = DANMAKU_STYLES.find((style) => style.id === beauty.danmakuStyle) || DANMAKU_STYLES[0]
      const danmakuSpeed = DANMAKU_SPEEDS[beauty.danmakuSpeed] || 8
      const danmakuSize = DANMAKU_SIZES[beauty.danmakuSize] || 22
      const danmakuLayer = bossOpen || danmaku.length === 0
        ? null
        : createPortal(
          createElement('div', { style: danmakuLayerStyle },
            danmaku.map((item, index) => createElement('span', {
              key: item.id,
              className: 'dsh-funpack-danmaku-item',
              style: {
                position: 'absolute',
                left: '100%',
                top: `${12 + (index % 7) * 12}%`,
                whiteSpace: 'nowrap',
                fontSize: danmakuSize,
                color: danmakuStyleDef.color,
                textShadow: danmakuStyleDef.shadow,
                opacity: beauty.danmakuOpacity / 100,
                fontWeight: 700,
                fontFamily: 'inherit',
                animation: `dshFpDanmaku ${danmakuSpeed}s linear forwards`,
              },
            }, item.text)),
          ),
          document.body,
        )

      const bossLayer = bossOpen
        ? createPortal(createElement('div', {
            id: 'dsh-funpack-boss',
            style: {
              position: 'fixed',
              right: 16,
              bottom: 16,
              zIndex: 10001,
              width: 290,
              maxWidth: 'calc(100vw - 32px)',
              background: '#0a0f0a',
              border: '1px solid #2c402c',
              borderRadius: 10,
              padding: 12,
              color: '#d6f5d6',
              fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
              boxShadow: '0 12px 32px rgba(0,0,0,.55)',
              pointerEvents: 'auto',
            },
          },
            createElement('div', { style: { fontSize: 12, color: '#7fa87f' } }, 'dsh-funpack · build output'),
            createElement('div', { style: { fontSize: 13, marginTop: 6 } }, '编译中 87% · 正在验证代码花园...'),
            createElement('div', { style: { height: 8, borderRadius: 999, background: '#182418', marginTop: 8, overflow: 'hidden' } },
              createElement('div', { style: { width: '87%', height: '100%', background: '#22c55e', borderRadius: 999 } }),
            ),
            createElement('button', {
              type: 'button',
              style: {
                ...smallButtonStyle,
                width: '100%',
                marginTop: 10,
                background: '#182418',
                color: '#d6f5d6',
                borderColor: '#2c402c',
              },
              onClick: toggleBoss,
            }, '恢复摸鱼'),
          ),
          document.body,
        )
        : null

      return createElement(Fragment, null,
        row,
        danmakuLayer,
        bossLayer,
        bossOpen ? null : hubOpen ? createPortal(createElement(FunHubPanel, {
          achievements,
          garden,
          onOpen: openFromHub,
          onClose: () => setHubOpen(false),
        }), document.body) : null,
        bossOpen ? null : beautyOpen ? createPortal(createElement(BeautyPanel, {
          beauty,
          update: updateBeauty,
          move: moveModule,
          reset: resetBeauty,
          breakTarget,
          onBreakTargetChange: updateBreakTarget,
          onPreviewDanmaku: () => showDanmaku('✨ 今天也是元气满满的一天！'),
          atmosphere,
          onAtmosphereChange: updateAtmosphere,
          bossKeyPath,
          onBossKeyPathChange: updateBossKeyPath,
          onClose: () => setBeautyOpen(false),
        }), document.body) : null,
        bossOpen ? null : achievementOpen ? createPortal(createElement(AchievementPanel, {
          state: achievements,
          onClose: () => setAchievementOpen(false),
        }), document.body) : null,
        bossOpen ? null : marketOpen ? createPortal(createElement(MarketPanel, {
          update: updateBeauty,
          run,
          onClose: () => setMarketOpen(false),
        }), document.body) : null,
        bossOpen ? null : gardenOpen ? createPortal(createElement(GardenPanel, {
          onClose: () => setGardenOpen(false),
        }), document.body) : null,
      )
    }

                const petBaseStyle = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 6,
      pointerEvents: 'none',
      userSelect: 'none',
    }
    const bubbleStyle = {
      background: 'var(--fp-panel, rgba(255,255,255,.96))',
      border: '1px solid var(--fp-border, rgba(74,144,217,.35))',
      borderRadius: 10,
      padding: '6px 10px',
      fontSize: 12,
      color: 'var(--fp-text, #16324f)',
      boxShadow: '0 2px 10px rgba(0,0,0,.12)',
      maxWidth: 220,
      lineHeight: 1.5,
    }
    const controlRowStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: 4,
      maxWidth: 260,
      pointerEvents: 'auto',
    }
    const controlButtonStyle = {
      height: 22,
      minWidth: 22,
      lineHeight: '20px',
      border: '1px solid var(--fp-border, rgba(74,144,217,.4))',
      borderRadius: 6,
      background: 'var(--fp-panel2, rgba(255,255,255,.92))',
      color: 'var(--fp-text, #16324f)',
      fontSize: 12,
      cursor: 'pointer',
      padding: '0 6px',
    }
    const panelStyle = {
      background: 'var(--fp-panel, rgba(255,255,255,.98))',
      border: '1px solid var(--fp-border, rgba(74,144,217,.35))',
      borderRadius: 12,
      boxShadow: '0 10px 30px rgba(0,0,0,.18)',
      padding: 10,
      boxSizing: 'border-box',
      width: 300,
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      color: 'var(--fp-text, #16324f)',
      fontSize: 12,
      fontFamily: 'inherit',
    }
    const petTabBarStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 4,
      padding: 3,
      borderRadius: 8,
      background: 'var(--fp-panel2, rgba(74,144,217,.12))',
    }
    const petTabStyle = {
      height: 26,
      border: 0,
      borderRadius: 6,
      background: 'transparent',
      color: 'var(--fp-dim, #5b7184)',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
    }
    const petTabActiveStyle = {
      ...petTabStyle,
      background: 'var(--fp-panel, #ffffff)',
      color: 'var(--fp-text, #16324f)',
      boxShadow: '0 1px 4px rgba(0,0,0,.12)',
    }
    const petHintStyle = {
      fontSize: 11,
      lineHeight: 1.4,
      color: 'var(--fp-dim, #7c8b9c)',
    }
    const petChipStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 7px',
      borderRadius: 999,
      border: '1px solid var(--fp-border, rgba(74,144,217,.35))',
      background: 'var(--fp-panel2, rgba(74,144,217,.1))',
      fontSize: 11,
      color: 'var(--fp-text, #16324f)',
    }
    const petProgressTrackStyle = {
      height: 8,
      borderRadius: 999,
      background: 'var(--fp-panel2, rgba(74,144,217,.18))',
      overflow: 'hidden',
    }
    const petProgressFillStyle = {
      height: '100%',
      borderRadius: 999,
      background: 'var(--fp-accent, #3b82f6)',
      transition: 'width .2s ease',
    }
    const textareaStyle = {
      width: '100%',
      boxSizing: 'border-box',
      fontSize: 12,
      fontFamily: 'inherit',
      borderRadius: 6,
      border: '1px solid var(--fp-border, rgba(74,144,217,.3))',
      padding: '4px 6px',
      resize: 'vertical',
      background: 'var(--fp-panel2, rgba(255,255,255,.98))',
      color: 'var(--fp-text, #16324f)',
    }
    const smallButtonStyle = {
      height: 24,
      border: '1px solid var(--fp-border, rgba(74,144,217,.4))',
      borderRadius: 6,
      background: 'var(--fp-panel2, #eaf3ff)',
      color: 'var(--fp-text, #16324f)',
      fontSize: 12,
      cursor: 'pointer',
      padding: '0 8px',
    }
    const configLabelStyle = {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fp-text, #16324f)',
    }

    const levelBadgeStyle = {
      background: 'var(--fp-accent, #3b82f6)',
      color: '#ffffff',
      borderRadius: 999,
      padding: '2px 8px',
      fontSize: 11,
      lineHeight: '16px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }

    const beautyPanelStyle = {
      position: 'fixed',
      left: 16,
      bottom: 16,
      zIndex: 10000,
      width: 320,
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
      background: 'var(--fp-panel, #10161f)',
      border: '1px solid var(--fp-border, #2a3546)',
      borderRadius: 12,
      boxShadow: '0 16px 40px rgba(0,0,0,.35)',
      padding: 12,
      color: 'var(--fp-text, #e6edf3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'auto',
      fontSize: 13,
      fontFamily: 'inherit',
    }
    const beautyLabelStyle = {
      color: 'var(--fp-dim, #8b98a9)',
      fontSize: 12,
    }
    const beautyRowStyle = {
      display: 'grid',
      gridTemplateColumns: '82px 1fr 46px',
      alignItems: 'center',
      gap: 8,
    }
    const beautyValueStyle = {
      textAlign: 'right',
      color: 'var(--fp-text, #e6edf3)',
      fontVariantNumeric: 'tabular-nums',
    }
    const beautySliderStyle = {
      width: '100%',
      accentColor: 'var(--fp-accent, #3b82f6)',
    }
    const beautyMiniButtonStyle = {
      height: 22,
      minWidth: 22,
      border: '1px solid var(--fp-border, #2a3546)',
      borderRadius: 5,
      background: 'var(--fp-panel2, #182130)',
      color: 'var(--fp-text, #e6edf3)',
      fontSize: 12,
      lineHeight: '20px',
      cursor: 'pointer',
      padding: 0,
    }
    const beautyFileButtonStyle = {
      ...smallButtonStyle,
      textAlign: 'center',
      display: 'grid',
      placeItems: 'center',
    }

    function BeautyPanel({ beauty, update, move, reset, breakTarget, onBreakTargetChange, onPreviewDanmaku, onClose, atmosphere, onAtmosphereChange, bossKeyPath, onBossKeyPathChange }) {
      const onBgFile = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => update({ bgImage: String(reader.result) })
        reader.readAsDataURL(file)
      }

      const rangeRow = (label, value, min, max, onChange) => createElement('div', { style: beautyRowStyle },
        createElement('span', { style: beautyLabelStyle }, label),
        createElement('input', {
          type: 'range',
          min,
          max,
          value,
          style: beautySliderStyle,
          onChange: (event) => onChange(Number(event.target.value)),
        }),
        createElement('span', { style: beautyValueStyle }, `${value}%`),
      )

      const alignOptions = [
        { value: 'left', label: '靠左' },
        { value: 'center', label: '居中' },
        { value: 'right', label: '靠右' },
      ]

      const exportConfig = () => {
        const payload = {}
        const beautyRaw = localStorage.getItem('dsh-funpack-beauty-config')
        const petRaw = localStorage.getItem('dsh-funpack-pet-config')
        const breakTargetRaw = localStorage.getItem('dsh-funpack-break-target') || ''
        const atmosphereRaw = localStorage.getItem(ATMOSPHERE_KEY)
        const bossKeyPathRaw = localStorage.getItem('dsh-funpack-boss-key-path') || ''
        if (beautyRaw) payload.beauty = JSON.parse(beautyRaw)
        if (petRaw) payload.pet = JSON.parse(petRaw)
        if (breakTargetRaw) payload.breakTarget = breakTargetRaw
        if (atmosphereRaw) payload.atmosphere = JSON.parse(atmosphereRaw)
        if (bossKeyPathRaw) payload.bossKeyPath = bossKeyPathRaw
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'dsh-funpack-config.json'
        link.click()
        URL.revokeObjectURL(url)
      }

      const onImportFile = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result))
            if (parsed && typeof parsed === 'object') {
              if (parsed.beauty) {
                localStorage.setItem('dsh-funpack-beauty-config', JSON.stringify(parsed.beauty))
                update({ ...parsed.beauty })
              }
              if (parsed.pet) {
                localStorage.setItem('dsh-funpack-pet-config', JSON.stringify(parsed.pet))
              }
              if (parsed.breakTarget) {
                localStorage.setItem('dsh-funpack-break-target', parsed.breakTarget)
                onBreakTargetChange(parsed.breakTarget)
              }
              if (parsed.atmosphere) {
                localStorage.setItem(ATMOSPHERE_KEY, JSON.stringify(parsed.atmosphere))
                onAtmosphereChange(parsed.atmosphere)
              }
              if (parsed.bossKeyPath) {
                localStorage.setItem('dsh-funpack-boss-key-path', parsed.bossKeyPath)
                onBossKeyPathChange(parsed.bossKeyPath)
              }
              window.location.reload()
            }
          } catch {}
        }
        reader.readAsText(file)
      }

      return createElement('div', { id: 'dsh-funpack-beauty-panel', style: beautyPanelStyle },
        createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, '美化面板'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: onClose }, '✕'),
        ),
        createElement('div', { style: configLabelStyle }, '主题'),
        createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          BEAUTY_PRESETS.map((preset) => createElement('button', {
            key: preset.id,
            type: 'button',
            style: {
              ...smallButtonStyle,
              borderColor: preset.id === beauty.theme ? 'var(--fp-accent, #3b82f6)' : 'var(--fp-border, #2a3546)',
              background: preset.id === beauty.theme ? 'var(--fp-accent, #3b82f6)' : 'var(--fp-panel2, #182130)',
              color: preset.id === beauty.theme ? '#ffffff' : 'var(--fp-text, #e6edf3)',
            },
            onClick: () => update({ theme: preset.id }),
          }, preset.label)),
        ),
        createElement('div', { style: configLabelStyle }, '背景图片'),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '背景图片'),
          createElement('label', { style: beautyFileButtonStyle },
            '选择图片',
            createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: onBgFile }),
          ),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: () => update({ bgImage: null }) }, '清除'),
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '铺放方式'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: beauty.bgFit,
            onChange: (event) => update({ bgFit: event.target.value }),
          }, BEAUTY_FITS.map((fit) => createElement('option', { key: fit, value: fit }, BEAUTY_FIT_LABELS[fit]))),
          createElement('span', { style: beautyValueStyle }, BEAUTY_FIT_LABELS[beauty.bgFit]),
        ),
        rangeRow('透明度', beauty.bgAlpha, 10, 100, (value) => update({ bgAlpha: value })),
        rangeRow('暗色蒙层', beauty.tint, 0, 90, (value) => update({ tint: value })),
        rangeRow('背景模糊', beauty.bgBlur, 0, 20, (value) => update({ bgBlur: value })),
        createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          createElement('input', {
            type: 'checkbox',
            checked: beauty.glass,
            onChange: (event) => update({ glass: event.target.checked }),
          }),
          createElement('span', { style: { color: 'var(--fp-text, #e6edf3)' } }, '输入区毛玻璃'),
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '背景范围'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: beauty.bgScope,
            onChange: (event) => update({ bgScope: event.target.value }),
          },
          createElement('option', { value: 'chat' }, '聊天区'),
          createElement('option', { value: 'full' }, '全屏'),
          ),
          createElement('span', { style: beautyValueStyle }, beauty.bgScope === 'chat' ? '聊天区' : '全屏'),
        ),
        rangeRow('按钮缩放', beauty.buttonScale, 80, 160, (value) => update({ buttonScale: value })),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '动态特效'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: beauty.effect,
            onChange: (event) => update({ effect: event.target.value }),
          }, EFFECT_OPTIONS.map((option) => createElement('option', { key: option.id, value: option.id }, option.label))),
          createElement('span', { style: beautyValueStyle }, EFFECT_OPTIONS.find((option) => option.id === beauty.effect)?.label),
        ),
        createElement('div', { style: configLabelStyle }, '沉浸氛围'),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '环境音'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: atmosphere.scene,
            onChange: (event) => onAtmosphereChange({ scene: event.target.value }),
          }, ATMOSPHERE_SCENES.map((scene) => createElement('option', { key: scene.id, value: scene.id }, scene.label))),
          createElement('span', { style: beautyValueStyle }, ATMOSPHERE_SCENES.find((scene) => scene.id === atmosphere.scene)?.label),
        ),
        rangeRow('音量', atmosphere.volume, 0, 100, (value) => onAtmosphereChange({ volume: value })),
        createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          createElement('input', {
            type: 'checkbox',
            checked: atmosphere.autoLink,
            onChange: (event) => onAtmosphereChange({ autoLink: event.target.checked }),
          }),
          createElement('span', { style: { color: 'var(--fp-text, #e6edf3)' } }, '番茄钟切雨声，摸鱼切 Lo-Fi'),
        ),
        createElement('div', { style: configLabelStyle }, '弹幕'),
        createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          createElement('input', {
            type: 'checkbox',
            checked: beauty.danmakuEnabled,
            onChange: (event) => update({ danmakuEnabled: event.target.checked }),
          }),
          createElement('span', { style: { color: 'var(--fp-text, #e6edf3)' } }, '夸我 / 运势以弹幕展示'),
        ),
        createElement('button', { type: 'button', style: { ...smallButtonStyle, width: '100%' }, onClick: onPreviewDanmaku }, '试看弹幕'),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '弹幕样式'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: beauty.danmakuStyle,
            onChange: (event) => update({ danmakuStyle: event.target.value }),
          }, DANMAKU_STYLES.map((style) => createElement('option', { key: style.id, value: style.id }, style.label))),
          createElement('span', { style: beautyValueStyle }, DANMAKU_STYLES.find((style) => style.id === beauty.danmakuStyle)?.label),
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '弹幕速度'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: beauty.danmakuSpeed,
            onChange: (event) => update({ danmakuSpeed: event.target.value }),
          }, DANMAKU_SPEED_IDS.map((speed) => createElement('option', { key: speed, value: speed }, DANMAKU_SPEED_LABELS[speed]))),
          createElement('span', { style: beautyValueStyle }, DANMAKU_SPEED_LABELS[beauty.danmakuSpeed]),
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '弹幕大小'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: beauty.danmakuSize,
            onChange: (event) => update({ danmakuSize: event.target.value }),
          }, DANMAKU_SIZE_IDS.map((size) => createElement('option', { key: size, value: size }, DANMAKU_SIZE_LABELS[size]))),
          createElement('span', { style: beautyValueStyle }, DANMAKU_SIZE_LABELS[beauty.danmakuSize]),
        ),
        rangeRow('弹幕透明度', beauty.danmakuOpacity, 30, 100, (value) => update({ danmakuOpacity: value })),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '按钮对齐'),
          createElement('div', { style: { display: 'flex', gap: 4 } },
            alignOptions.map((option) => createElement('button', {
              key: option.value,
              type: 'button',
              style: {
                ...beautyMiniButtonStyle,
                flex: 1,
                background: beauty.buttonAlign === option.value ? 'var(--fp-accent, #3b82f6)' : 'var(--fp-panel2, #182130)',
                color: beauty.buttonAlign === option.value ? '#ffffff' : 'var(--fp-text, #e6edf3)',
              },
              onClick: () => update({ buttonAlign: option.value }),
            }, option.label)),
          ),
          createElement('span', { style: beautyValueStyle }, alignOptions.find((option) => option.value === beauty.buttonAlign)?.label),
        ),
        createElement('div', { style: configLabelStyle }, '摸鱼按钮'),
        createElement('input', {
          type: 'text',
          style: textareaStyle,
          placeholder: '网址或程序路径，留空则显示摸鱼提醒',
          value: breakTarget,
          onChange: (event) => onBreakTargetChange(event.target.value),
        }),
        createElement('div', { style: configLabelStyle }, 'Boss 来了'),
        createElement('input', {
          type: 'text',
          style: textareaStyle,
          placeholder: 'Boss-Key 程序路径（可选），填写后一键启动',
          value: bossKeyPath,
          onChange: (event) => onBossKeyPathChange(event.target.value),
        }),
        createElement('div', { style: configLabelStyle }, '快捷按钮模块'),
        createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          beauty.modules.map((module) => createElement('div', { key: module.key, style: { display: 'flex', alignItems: 'center', gap: 6 } },
            createElement('input', {
              type: 'checkbox',
              checked: module.enabled,
              onChange: (event) => update({
                modules: beauty.modules.map((item) => item.key === module.key ? { ...item, enabled: event.target.checked } : item),
              }),
            }),
            createElement('span', { style: { flex: 1, color: 'var(--fp-text, #e6edf3)' } }, module.label),
            createElement('button', { type: 'button', style: beautyMiniButtonStyle, onClick: () => move(module.key, -1) }, '↑'),
            createElement('button', { type: 'button', style: beautyMiniButtonStyle, onClick: () => move(module.key, 1) }, '↓'),
          )),
        ),
        createElement('div', { style: { display: 'flex', gap: 6 } },
          createElement('button', { type: 'button', style: { ...smallButtonStyle, flex: 1 }, onClick: exportConfig }, '导出配置'),
          createElement('label', { style: { ...smallButtonStyle, flex: 1, display: 'grid', placeItems: 'center' } },
            '导入配置',
            createElement('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' }, onChange: onImportFile }),
          ),
        ),
        createElement('button', { type: 'button', style: { ...smallButtonStyle, width: '100%' }, onClick: reset }, '恢复默认'),
      )
    }

    const achievementPanelStyle = {
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: 10000,
      width: 340,
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
      background: 'var(--fp-panel, #10161f)',
      border: '1px solid var(--fp-border, #2a3546)',
      borderRadius: 12,
      boxShadow: '0 16px 40px rgba(0,0,0,.35)',
      padding: 12,
      color: 'var(--fp-text, #e6edf3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'auto',
      fontSize: 13,
      fontFamily: 'inherit',
    }
    const marketPanelStyle = {
      ...achievementPanelStyle,
      left: 16,
      right: 'auto',
    }
    const progressTrackStyle = {
      height: 8,
      borderRadius: 999,
      background: 'var(--fp-panel2, #182130)',
      overflow: 'hidden',
    }
    const progressFillStyle = {
      height: '100%',
      borderRadius: 999,
      background: 'var(--fp-accent, #3b82f6)',
      transition: 'width .3s ease',
    }
    const statChipStyle = {
      border: '1px solid var(--fp-border, #2a3546)',
      borderRadius: 6,
      background: 'var(--fp-panel2, #182130)',
      padding: '5px 7px',
      fontSize: 11,
      lineHeight: 1.4,
    }

    function AchievementPanel({ state, onClose }) {
      const unlockedCount = state.unlocked.length
      const total = ACHIEVEMENTS.length
      const progress = Math.round((unlockedCount / Math.max(1, total)) * 100)
      const rank = seasonRank(state.season.points)
      const stats = [
        ['夸我', state.stats.praise],
        ['运势', state.stats.fortune],
        ['战报', state.stats.report],
        ['番茄', `${state.stats.pomodoro} / ${state.stats.pomodoroMin}分`],
        ['摸鱼', state.stats.break],
        ['桌宠', `${state.stats.petPoints} 好感`],
        ['任务', state.stats.task],
        ['花园', `${state.stats.garden || 0} 棵`],
        ['连续', `${state.streak} 天`],
      ]
      const shareCard = () => {
        const escape = (value) => String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        const season = state.season
        const svg = [
          '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">',
          '<rect width="640" height="360" fill="#0d1b2a"/>',
          '<circle cx="560" cy="60" r="90" fill="#164e63" opacity=".55"/>',
          '<circle cx="80" cy="330" r="120" fill="#7c3aed" opacity=".22"/>',
          `<text x="32" y="58" font-size="30" font-weight="700" fill="#ffe66d">摸鱼赛季卡</text>`,
          `<text x="32" y="94" font-size="18" fill="#d7e3f4">${escape(season.id)} · ${escape(rank.title)}</text>`,
          `<text x="32" y="148" font-size="58" font-weight="700" fill="#ffffff">${season.points}</text>`,
          `<text x="110" y="148" font-size="18" fill="#8b98a9">赛季积分</text>`,
          `<text x="32" y="206" font-size="16" fill="#8b98a9">夸我 ${season.praise} · 运势 ${season.fortune} · 番茄 ${season.pomodoro} · 摸鱼 ${season.break}</text>`,
          `<text x="32" y="234" font-size="16" fill="#8b98a9">桌宠好感 ${season.petPoints} · 连续使用 ${state.streak} 天</text>`,
          `<text x="32" y="292" font-size="16" fill="#f472b6">已解锁 ${unlockedCount} / ${total} 个成就</text>`,
          `<text x="32" y="330" font-size="14" fill="#475569">dsh-funpack · DeepSeek Harness 摸鱼全家桶</text>`,
          '</svg>',
        ].join('')
        const link = document.createElement('a')
        link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
        link.download = `dsh-funpack-${season.id}.svg`
        link.click()
      }

      return createElement('div', { id: 'dsh-funpack-achievement-panel', style: achievementPanelStyle },
        createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, '成就 / 赛季'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: onClose }, '✕'),
        ),
        createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
          createElement('div', { style: { flex: 1, fontSize: 22, fontWeight: 700 } }, rank.title),
          createElement('div', { style: statChipStyle }, `${state.season.points} 赛季积分`),
        ),
        createElement('div', { style: progressTrackStyle },
          createElement('div', { style: { ...progressFillStyle, width: `${progress}%` } }),
        ),
        createElement('div', { style: { fontSize: 12, color: 'var(--fp-dim, #8b98a9)' } },
          `已解锁 ${unlockedCount} / ${total} 个成就（${progress}%）`,
        ),
        createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 } },
          stats.map(([label, value]) => createElement('div', { key: label, style: statChipStyle },
            createElement('div', { style: { color: 'var(--fp-dim, #8b98a9)' } }, label),
            createElement('div', { style: { fontWeight: 600 } }, value),
          )),
        ),
        createElement('div', { style: configLabelStyle }, '成就墙'),
        createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
          ACHIEVEMENTS.map((achievement) => {
            const unlocked = state.unlocked.includes(achievement.id)
            return createElement('div', {
              key: achievement.id,
              style: {
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                border: '1px solid var(--fp-border, #2a3546)',
                borderRadius: 6,
                background: unlocked ? 'var(--fp-panel2, #182130)' : 'rgba(128,128,128,.06)',
                padding: '6px 8px',
                opacity: unlocked ? 1 : .55,
              },
            },
              createElement('span', { style: { fontSize: 20 } }, achievement.icon),
              createElement('div', { style: { flex: 1, minWidth: 0 } },
                createElement('div', { style: { fontWeight: 600, fontSize: 12 } }, achievement.title),
                createElement('div', { style: { fontSize: 11, color: 'var(--fp-dim, #8b98a9)' } }, achievement.desc),
              ),
              unlocked ? createElement('span', { style: { color: '#fbbf24', fontSize: 14 } }, '✓') : null,
            )
          }),
        ),
        createElement('div', { style: { display: 'flex', gap: 6 } },
          createElement('button', { type: 'button', style: { ...smallButtonStyle, flex: 1 }, onClick: shareCard }, '生成赛季卡'),
        ),
      )
    }

    function GardenPanel({ onClose }) {
      const [garden, setGarden] = useState(loadGarden)
      useEffect(() => {
        const sync = () => setGarden(loadGarden())
        window.addEventListener('dsh-funpack-garden-change', sync)
        return () => window.removeEventListener('dsh-funpack-garden-change', sync)
      }, [])
      const forest = garden.trees.length
      const mature = garden.trees.filter((tree) => tree.stage >= GARDEN_EMOJI.length - 1).length
      const today = garden.log.filter((entry) => new Date(entry.time).toDateString() === new Date().toDateString()).length
      return createElement('div', { id: 'dsh-funpack-garden-panel', style: achievementPanelStyle },
        createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, '代码花园'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: onClose }, '✕'),
        ),
        createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 } },
          createElement('div', { style: statChipStyle },
            createElement('div', { style: { color: 'var(--fp-dim, #8b98a9)' } }, '树苗'),
            createElement('div', { style: { fontWeight: 600 } }, `${forest} 棵`),
          ),
          createElement('div', { style: statChipStyle },
            createElement('div', { style: { color: 'var(--fp-dim, #8b98a9)' } }, '成材'),
            createElement('div', { style: { fontWeight: 600 } }, `${mature} 棵`),
          ),
          createElement('div', { style: statChipStyle },
            createElement('div', { style: { color: 'var(--fp-dim, #8b98a9)' } }, '专注'),
            createElement('div', { style: { fontWeight: 600 } }, `${garden.totalMinutes} 分钟`),
          ),
        ),
        createElement('div', { style: configLabelStyle }, `今日种植 ${today} 次`),
        createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
            gap: 6,
            padding: 10,
            border: '1px solid var(--fp-border, #2a3546)',
            borderRadius: 8,
            background: 'linear-gradient(180deg, rgba(16,40,32,.8), rgba(10,24,20,.9))',
          },
        },
          (garden.trees.length === 0
            ? createElement('div', { style: { gridColumn: '1 / -1', textAlign: 'center', color: 'var(--fp-dim, #8b98a9)', fontSize: 12 } }, '完成一个番茄钟，种下第一棵树')
            : garden.trees.slice(-24).map((tree) => createElement('div', {
              key: tree.id,
              title: `${tree.minutes} 分钟 · ${new Date(tree.plantedAt).toLocaleDateString()}`,
              style: { textAlign: 'center', fontSize: 30 },
            }, GARDEN_EMOJI[tree.stage] || GARDEN_EMOJI[GARDEN_EMOJI.length - 1]))),
        ),
        createElement('div', { style: configLabelStyle }, '种植记录'),
        createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
          garden.log.slice(0, 8).map((entry, index) => createElement('div', {
            key: `${entry.time}-${index}`,
            style: { fontSize: 12, color: 'var(--fp-dim, #8b98a9)' },
          }, `${new Date(entry.time).toLocaleTimeString()} · ${entry.text}`)),
        ),
      )
    }

    const funHubItemStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      alignItems: 'flex-start',
      border: '1px solid var(--fp-border, #2a3546)',
      borderRadius: 8,
      background: 'var(--fp-panel2, #182130)',
      padding: '10px 12px',
      cursor: 'pointer',
      color: 'var(--fp-text, #e6edf3)',
      textAlign: 'left',
    }

    function FunHubPanel({ achievements, garden, onOpen, onClose }) {
      const unlocked = achievements.unlocked.length
      const total = ACHIEVEMENTS.length
      const trees = garden.trees.length
      const minutes = garden.totalMinutes
      const items = [
        { key: 'achievement', icon: '🏆', title: '成就 / 赛季', desc: `已解锁 ${unlocked} / ${total} · 赛季积分 ${achievements.season.points}` },
        { key: 'market', icon: '🧩', title: '资产市场', desc: '内置包 + 社区聚合目录' },
        { key: 'garden', icon: '🌳', title: '代码花园', desc: `${trees} 棵 · 专注 ${minutes} 分钟` },
        { key: 'boss', icon: '🕶', title: 'Boss 隐身', desc: '一键隐藏摸鱼现场' },
      ]
      return createElement('div', { id: 'dsh-funpack-fun-hub', style: achievementPanelStyle },
        createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Fun 中心'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: onClose }, '✕'),
        ),
        createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          items.map((item) => createElement('button', {
            key: item.key,
            type: 'button',
            style: funHubItemStyle,
            onClick: () => onOpen(item.key),
          },
            createElement('span', { style: { fontSize: 24 } }, item.icon),
            createElement('span', { style: { fontWeight: 600, fontSize: 13 } }, item.title),
            createElement('span', { style: { fontSize: 11, color: 'var(--fp-dim, #8b98a9)' } }, item.desc),
          )),
        ),
      )
    }

    const SENKO_MODEL_URL = 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model@master/Live2D/Senko_Normals/senko.model3.json'

    const MARKET_PRESETS = [
      { id: 'pet-default', kind: 'pet', pet: 'default', title: '蓝鱼娘', desc: '内置 DeepSeek 娘 GIF 形象' },
      { id: 'pet-taffy', kind: 'pet', pet: 'taffy', title: '塔菲', desc: 'Codex 社区塔菲宠物包' },
      { id: 'live2d-haru', kind: 'live2d', live2dUrl: 'https://raw.githubusercontent.com/Live2D/CubismWebSamples/develop/Samples/Resources/Haru/Haru.model3.json', title: 'Haru Live2D', desc: 'Live2D 官方测试模型，需要联网加载' },
      { id: 'live2d-senko', kind: 'live2d', live2dUrl: SENKO_MODEL_URL, title: '仙狐 Senko', desc: '热门狐娘 Live2D 桌宠，社区模型包直连' },
      { id: 'theme-deep', kind: 'theme', theme: 'deep', title: '深空', desc: '默认深色主题' },
      { id: 'theme-sakura', kind: 'theme', theme: 'sakura', title: '樱花', desc: '粉白樱色主题' },
      { id: 'theme-mint', kind: 'theme', theme: 'mint', title: '薄荷', desc: '清爽薄荷主题' },
      { id: 'theme-terminal', kind: 'theme', theme: 'terminal', title: '终端', desc: '绿色终端主题' },
      { id: 'theme-paper', kind: 'theme', theme: 'paper', title: '纸白', desc: '明亮纸白主题' },
      { id: 'persona-nee', kind: 'persona', command: '/persona nee', title: '大姐姐', desc: '温柔靠谱的大姐姐人设' },
      { id: 'persona-imouto', kind: 'persona', command: '/persona imouto', title: '小妹妹', desc: '元气小妹妹人设' },
      { id: 'persona-abstract', kind: 'persona', command: '/persona abstract', title: '抽象搞怪', desc: '抽象区脑洞人设' },
    ]

    function MarketPanel({ update, run, onClose }) {
      const [scanning, setScanning] = useState(false)
      const [repos, setRepos] = useState([])
      const [message, setMessage] = useState(null)
      const [source, setSource] = useState('curated')

      const install = async (item) => {
        setMessage(null)
        try {
          if (item.kind === 'theme') {
            update({ theme: item.theme })
          } else if (item.kind === 'persona') {
            await run(item.command)
          } else if (item.kind === 'live2d') {
            window.dispatchEvent(new CustomEvent('dsh-funpack-install-live2d', { detail: { url: item.live2dUrl } }))
          } else {
            window.dispatchEvent(new CustomEvent('dsh-funpack-apply-pet-preset', { detail: { kind: item.pet } }))
          }
          setMessage(`已安装：${item.title}`)
        } catch {
          setMessage(`安装失败：${item.title}`)
        }
      }

      const copyInstall = async (repo) => {
        const command = repo.install || `dsh plugin --profile web add github:${repo.full_name}`
        try {
          await navigator.clipboard.writeText(command)
          setMessage(`已复制：${command}`)
        } catch {
          setMessage(`安装命令：${command}`)
        }
      }

      const parseAssetPath = (assetPath) => {
        const parts = assetPath.split(' / ')
        if (parts.length < 3) return null
        return {
          repo: parts[0],
          branch: parts[1],
          path: parts.slice(2).join('/'),
        }
      }

      const fetchWithTimeout = async (url, timeout = 6000, headers = {}) => {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeout)
        try {
          return await fetch(url, { headers, signal: controller.signal })
        } finally {
          clearTimeout(timer)
        }
      }

      const resolveAssetUrl = (info, url) => {
        if (/^https?:\/\//i.test(url)) return url
        return `https://raw.githubusercontent.com/${info.repo}/${info.branch}/${url.replace(/^\.?\//, '')}`
      }

      const installCommunity = async (repo) => {
        setMessage('安装社区资产中…')
        try {
          const info = parseAssetPath(repo.assetPath)
          if (!info) throw new Error('资产路径无效')
          const response = await fetchWithTimeout(`https://raw.githubusercontent.com/${info.repo}/${info.branch}/${info.path}`)
          if (!response.ok) throw new Error(`manifest ${response.status}`)
          const manifest = await response.json()
          const packs = manifest.packs || manifest.assets || (manifest.pack ? [manifest.pack] : [])
          if (packs.length === 0) throw new Error('manifest 里没有资产')
          let installed = 0
          for (const pack of packs) {
            if (pack.type === 'theme' && pack.theme) {
              update({ theme: pack.theme })
              installed += 1
            } else if (pack.type === 'persona' && pack.command) {
              await run(pack.command)
              installed += 1
            } else if (pack.type === 'live2d' && pack.live2dUrl) {
              window.dispatchEvent(new CustomEvent('dsh-funpack-install-live2d', { detail: { url: resolveAssetUrl(info, pack.live2dUrl) } }))
              installed += 1
            } else if (pack.type === 'pet' && pack.petJsonUrl && pack.spritesheetUrl) {
              const [petResponse, sheetResponse] = await Promise.all([
                fetchWithTimeout(resolveAssetUrl(info, pack.petJsonUrl)),
                fetchWithTimeout(resolveAssetUrl(info, pack.spritesheetUrl)),
              ])
              if (!petResponse.ok || !sheetResponse.ok) throw new Error('宠物资产下载失败')
              const petJson = await petResponse.json()
              const sheetBlob = await sheetResponse.blob()
              const spritesheetDataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(String(reader.result))
                reader.onerror = () => reject(new Error('spritesheet 读取失败'))
                reader.readAsDataURL(sheetBlob)
              })
              window.dispatchEvent(new CustomEvent('dsh-funpack-install-pet-data', {
                detail: { petJson, spritesheetDataUrl },
              }))
              installed += 1
            }
          }
          setMessage(`已安装 ${installed} 个社区资产`)
        } catch (reason) {
          setMessage(reason instanceof Error ? reason.message : String(reason))
        }
      }

      const probeManifest = async (repo) => {
        const branches = [repo.default_branch || 'main', 'master']
        const paths = ['dsh-assets.json', 'assets/dsh-assets.json']
        for (const branch of branches) {
          for (const path of paths) {
            try {
              const response = await fetchWithTimeout(`https://raw.githubusercontent.com/${repo.full_name}/${branch}/${path}`, 2500)
              if (response.ok) return `${repo.full_name} / ${branch} / ${path}`
            } catch {}
          }
        }
        return null
      }

      const scanCommunity = async () => {
        setScanning(true)
        setRepos([])
        setMessage(null)
        try {
          if (source === 'curated') {
            const response = await fetchWithTimeout('https://raw.githubusercontent.com/like-study1/Oh-My-DSH/main/data/plugins.json', 12000)
            if (!response.ok) throw new Error(`Oh-My-DSH ${response.status}`)
            const json = await response.json()
            const candidates = (json.items || []).slice(0, 20)
            setRepos(candidates.map((item) => ({
              full_name: item.full_name,
              description: item.note || item.description || item.category || '',
              html_url: item.url,
              stars: item.stars || 0,
              assetPath: null,
              install: `dsh plugin --profile web add github:${item.full_name}`,
            })))
            setMessage(`已载入 Oh-My-DSH 精选目录：${candidates.length} 个插件`)
          } else {
            const response = await fetchWithTimeout(
              'https://api.github.com/search/repositories?q=topic%3Adsh-plugin&sort=updated&per_page=20',
              8000,
              { accept: 'application/vnd.github+json' },
            )
            if (!response.ok) throw new Error(`GitHub ${response.status}`)
            const json = await response.json()
            const candidates = (json.items || []).slice(0, 8)
            const withAssets = await Promise.all(candidates.map(async (repo) => {
              const assetPath = await probeManifest(repo)
              return {
                full_name: repo.full_name,
                description: repo.description || '',
                html_url: repo.html_url,
                stars: repo.stargazers_count || 0,
                assetPath,
                install: `dsh plugin --profile web add github:${repo.full_name}`,
              }
            }))
            setRepos(withAssets)
            setMessage(withAssets.length > 0 ? `发现 ${withAssets.length} 个 dsh-plugin 社区仓库` : '暂时没发现可安装资产，可以先看看仓库列表')
          }
        } catch (reason) {
          setMessage(reason instanceof Error ? reason.message : String(reason))
        } finally {
          setScanning(false)
        }
      }

      return createElement('div', { id: 'dsh-funpack-market-panel', style: marketPanelStyle },
        createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Fun 资产市场'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: onClose }, '✕'),
        ),
        message ? createElement('div', { style: { fontSize: 12, color: 'var(--fp-dim, #8b98a9)' } }, message) : null,
        createElement('div', { style: configLabelStyle }, '内置资产包'),
        createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
          MARKET_PRESETS.map((item) => createElement('div', {
            key: item.id,
            style: {
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              border: '1px solid var(--fp-border, #2a3546)',
              borderRadius: 6,
              background: 'var(--fp-panel2, #182130)',
              padding: '6px 8px',
            },
          },
            createElement('div', { style: { flex: 1, minWidth: 0 } },
              createElement('div', { style: { fontWeight: 600, fontSize: 12 } }, item.title),
              createElement('div', { style: { fontSize: 11, color: 'var(--fp-dim, #8b98a9)' } }, item.desc),
            ),
            createElement('button', { type: 'button', style: beautyMiniButtonStyle, onClick: () => install(item) }, '安装'),
          )),
        ),
        createElement('div', { style: configLabelStyle }, 'dsh-plugin 社区'),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '数据源'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #182130)',
              color: 'var(--fp-text, #e6edf3)',
            },
            value: source,
            onChange: (event) => setSource(event.target.value),
          },
          createElement('option', { value: 'curated' }, 'Oh-My-DSH 聚合目录'),
          createElement('option', { value: 'github' }, 'GitHub dsh-plugin 主题'),
          ),
          createElement('span', { style: beautyValueStyle }, source === 'curated' ? '聚合目录' : 'GitHub'),
        ),
        createElement('button', {
          type: 'button',
          style: { ...smallButtonStyle, width: '100%' },
          onClick: scanCommunity,
          disabled: scanning,
        }, scanning ? '扫描中…' : '扫描社区目录'),
        createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
          repos.map((repo) => createElement('div', {
            key: repo.full_name,
            style: {
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              border: '1px solid var(--fp-border, #2a3546)',
              borderRadius: 6,
              background: 'var(--fp-panel2, #182130)',
              padding: '6px 8px',
            },
          },
            createElement('div', { style: { flex: 1, minWidth: 0 } },
              createElement('div', { style: { fontWeight: 600, fontSize: 12 } }, repo.full_name),
              createElement('div', {
                style: {
                  fontSize: 11,
                  color: 'var(--fp-dim, #8b98a9)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }, repo.assetPath ? `资产：${repo.assetPath}` : (repo.description || `${repo.stars} stars`)),
            ),
            createElement('button', {
              type: 'button',
              style: beautyMiniButtonStyle,
              onClick: () => copyInstall(repo),
            }, '复制'),
            createElement('button', {
              type: 'button',
              style: beautyMiniButtonStyle,
              onClick: () => window.open(repo.html_url, '_blank', 'noopener,noreferrer'),
            }, '查看'),
            repo.assetPath ? createElement('button', {
              type: 'button',
              style: beautyMiniButtonStyle,
              onClick: () => installCommunity(repo),
            }, '安装') : null,
          )),
        ),
      )
    }

    const PET_CELL_WIDTH = 192
    const PET_CELL_HEIGHT = 208
    const PET_COLUMNS = 8
    const PET_STATES = {
      idle: { row: 0, durations: [420, 165, 165, 210, 210, 480] },
      waiting: { row: 6, durations: [225, 225, 225, 225, 225, 390] },
    }

    const PRESET_TAFFY = {
      manifestUrl: '/dsh-funpack/taffy/pet.json',
      spritesheetUrl: '/dsh-funpack/taffy/spritesheet.webp',
    }

    const SENKO_IDLE_LINES = [
      '仙狐正在偷偷观察你写代码哦～',
      '累了就摸鱼吧，我会帮你望风的！',
      '今天的尾巴状态：蓬松度 100%。',
      '代码报错了？让仙狐来亲亲你的屏幕～',
    ]

    const SENKO_THINKING_LINES = [
      '仙狐也在认真思考这个问题哦～',
      'DeepSeek 正在努力转脑子，别急！',
      '嘘，答案马上就从尾巴尖蹦出来啦。',
      '思考中……先吃一口团子再说。',
    ]

    const TAFFY_IDLE_LINES = [
      '塔菲在偷看你写代码哦～',
      '要一起摸鱼吗？我会帮你望风的！',
      '今天也要元气满满地 debug 呀～',
      '塔菲的尾巴已经准备好接住你的报错啦。',
    ]

    const TAFFY_THINKING_LINES = [
      '塔菲正在认真思考……才怪，其实在想晚饭。',
      '这个问题有点难，塔菲要加油！',
      '嘘，DeepSeek 正在努力转脑子～',
      '别急别急，答案马上就来啦！',
    ]

    const DEFAULT_BUTTONS = [
      { label: '摸头', command: '/pet' },
      { label: '喂食', command: '/feed' },
    ]

    const OLD_DEFAULT_BUTTONS = [
      { label: '摸头', command: '/praise' },
      { label: '喂食', command: '/break' },
    ]

    const sanitizeButtons = (value) => {
      if (!Array.isArray(value)) return DEFAULT_BUTTONS
      const buttons = value.filter((item) => item && typeof item.label === 'string' && typeof item.command === 'string')
      return JSON.stringify(buttons) === JSON.stringify(OLD_DEFAULT_BUTTONS) ? DEFAULT_BUTTONS : buttons
    }

    const DEFAULT_CONFIG = {
      image: null,
      petJson: null,
      spritesheetDataUrl: null,
      live2dModelUrl: null,
      idleLines: [],
      thinkingLines: [],
      buttons: DEFAULT_BUTTONS,
    }

    const loadConfig = () => {
      try {
        const raw = localStorage.getItem('dsh-funpack-pet-config')
        if (!raw) return DEFAULT_CONFIG
        const saved = JSON.parse(raw)
        return {
          image: typeof saved.image === 'string' ? saved.image : null,
          petJson: saved.petJson && typeof saved.petJson === 'object' ? saved.petJson : null,
          spritesheetDataUrl: typeof saved.spritesheetDataUrl === 'string' ? saved.spritesheetDataUrl : null,
          live2dModelUrl: typeof saved.live2dModelUrl === 'string' ? saved.live2dModelUrl : null,
          idleLines: Array.isArray(saved.idleLines) ? saved.idleLines.filter((item) => typeof item === 'string') : [],
          thinkingLines: Array.isArray(saved.thinkingLines) ? saved.thinkingLines.filter((item) => typeof item === 'string') : [],
          buttons: sanitizeButtons(saved.buttons),
        }
      } catch {
        return DEFAULT_CONFIG
      }
    }

    const PET_VISIBLE_KEY = 'dsh-funpack-pet-visible'

    const loadPetVisible = () => localStorage.getItem(PET_VISIBLE_KEY) !== '0'

    const normalizeBreakTarget = (target) => {
      const trimmed = target.trim()
      if (/^https?:\/\//i.test(trimmed)) return trimmed
      if (/^[^\s/]+\.\w{2,}/.test(trimmed)) return `https://${trimmed}`
      return trimmed
    }

    const isUrlBreakTarget = (target) => {
      const trimmed = target.trim()
      return /^https?:\/\//i.test(trimmed) || /^[^\s/]+\.\w{2,}/.test(trimmed)
    }

    function FunPet({ useSession, run }) {
      const [line, setLine] = useState(0)
      const [waving, setWaving] = useState(false)
      const [pos, setPos] = useState(null)
      const [size, setSize] = useState(96)
      const [panelOpen, setPanelOpen] = useState(false)
      const [petPanelTab, setPetPanelTab] = useState('look')
      const [config, setConfig] = useState(loadConfig)
      const [petFrame, setPetFrame] = useState(0)
      const [presetError, setPresetError] = useState(null)
      const [affinity, setAffinity] = useState(loadAffinity)
      const [reaction, setReaction] = useState(null)
      const [visible, setVisible] = useState(loadPetVisible)
      const [tts, setTts] = useState(loadTTS)
      const [ttsVoices, setTtsVoices] = useState([])
      const running = useSession((snapshot) => snapshot.running)
      const dragRef = useRef(null)
      const movedRef = useRef(false)
      const posRef = useRef(pos)
      const sizeRef = useRef(size)
      const prevRunningRef = useRef(running)
      const reactionTimerRef = useRef(null)
      const live2dRef = useRef(null)
      const live2dContainerRef = useRef(null)
      const [live2dError, setLive2dError] = useState(null)
      posRef.current = pos
      sizeRef.current = size

      const idleLines = config.idleLines.length > 0 ? config.idleLines : IDLE_LINES
      const thinkingLines = config.thinkingLines.length > 0 ? config.thinkingLines : THINKING_LINES
      const level = affinityLevel(affinity.points)
      const nextLevel = nextAffinityLevel(affinity.points)
      const bonusLines = LEVEL_BONUS_LINES[level.level] || []
      const lines = running ? thinkingLines : [...idleLines, ...bonusLines]

      useEffect(() => {
        const id = setInterval(() => {
          setLine((current) => (current + 1) % lines.length)
        }, 5000)
        return () => clearInterval(id)
      }, [running, lines.length])

      useEffect(() => {
        try {
          const raw = localStorage.getItem('dsh-funpack-pet')
          if (!raw) return
          const saved = JSON.parse(raw)
          if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) setPos({ x: saved.x, y: saved.y })
          if (Number.isFinite(saved?.size)) setSize(Math.max(48, Math.min(220, saved.size)))
        } catch {}
      }, [])

      useEffect(() => {
        try {
          localStorage.setItem('dsh-funpack-pet-config', JSON.stringify(config))
        } catch {}
      }, [config])

      useEffect(() => {
        const updateVoices = () => setTtsVoices(window.speechSynthesis?.getVoices?.() || [])
        updateVoices()
        window.speechSynthesis?.addEventListener?.('voiceschanged', updateVoices)
        return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', updateVoices)
      }, [])

      useEffect(() => {
        saveTTS(tts)
      }, [tts])

      useLayoutEffect(() => {
        if (!config.petJson || !config.spritesheetDataUrl) return
        setPetFrame(0)
        const durations = running ? PET_STATES.waiting.durations : PET_STATES.idle.durations
        let index = 0
        const id = setInterval(() => {
          setPetFrame(index)
          index = (index + 1) % durations.length
        }, 160)
        return () => clearInterval(id)
      }, [running, config.petJson, config.spritesheetDataUrl])

      const save = (nextPos, nextSize) => {
        try {
          localStorage.setItem('dsh-funpack-pet', JSON.stringify({
            x: nextPos?.x ?? null,
            y: nextPos?.y ?? null,
            size: nextSize,
          }))
        } catch {}
      }

      const startMove = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        const rect = event.currentTarget.getBoundingClientRect()
        movedRef.current = false
        dragRef.current = {
          id: event.pointerId,
          element: event.currentTarget,
          startX: event.clientX,
          startY: event.clientY,
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
      }

      const onMove = (event) => {
        const drag = dragRef.current
        if (!drag || event.pointerId !== drag.id) return
        if (Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY) > 3) {
          movedRef.current = true
        }
        const outer = drag.element.parentElement
        const outerRect = outer.getBoundingClientRect()
        const x = Math.max(0, Math.min(window.innerWidth - outerRect.width, event.clientX - drag.offsetX))
        const y = Math.max(0, Math.min(window.innerHeight - outerRect.height, event.clientY - drag.offsetY))
        setPos({ x, y })
      }

      const onUp = (event) => {
        const drag = dragRef.current
        if (!drag || event.pointerId !== drag.id) return
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        dragRef.current = null
        save(posRef.current, sizeRef.current)
      }

      const changeSize = (delta) => {
        const next = Math.max(48, Math.min(220, sizeRef.current + delta))
        setSize(next)
        save(posRef.current, next)
      }

      const saveAffinity = (next) => {
        try {
          localStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(next))
        } catch {}
        return next
      }

      const addAffinity = (type) => {
        const gain = AFFINITY_RULES[type] || 0
        setAffinity((current) => saveAffinity({
          ...current,
          points: current.points + gain,
          [type]: (current[type] || 0) + 1,
        }))
        if (gain) recordActivity('petPoints', gain)
        return gain
      }

      const showReaction = (message, duration = 2400) => {
        setReaction(message)
        speakText(message)
        clearTimeout(reactionTimerRef.current)
        reactionTimerRef.current = setTimeout(() => setReaction(null), duration)
      }

      const updateTTS = (patch) => setTts((current) => ({ ...current, ...patch }))

      useEffect(() => {
        if (prevRunningRef.current && !running) {
          addAffinity('task')
          recordActivity('task', 1)
          showReaction(`${DONE_LINES[Math.floor(Math.random() * DONE_LINES.length)]}（好感 +${AFFINITY_RULES.task}）`)
        }
        prevRunningRef.current = running
      }, [running])

      useEffect(() => {
        const syncPetVisible = () => setVisible(loadPetVisible())
        window.addEventListener('dsh-funpack-pet-visible-change', syncPetVisible)
        return () => window.removeEventListener('dsh-funpack-pet-visible-change', syncPetVisible)
      }, [])

      const handleClick = () => {
        if (movedRef.current) return
        setLine((current) => (current + 1) % lines.length)
        speakText(lines[line % lines.length])
        if (!waving && !config.image && !config.petJson) {
          setWaving(true)
          setTimeout(() => setWaving(false), 1400)
        }
      }

      const handlePetCommand = async (button) => {
        if (typeof run !== 'function') return
        const result = await run(button.command)
        if (!result || result.ok === false) return
        recordCommand(button.command)
        const type = AFFINITY_COMMANDS[button.command]
        if (!type) return
        const gain = addAffinity(type)
        showReaction(`${button.label}成功，好感 +${gain}`)
      }

      const onFile = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setConfig((current) => ({ ...current, live2dModelUrl: null, image: String(reader.result) }))
        reader.readAsDataURL(file)
      }

      const onPetJsonFile = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result))
            setConfig((current) => ({ ...current, live2dModelUrl: null, petJson: parsed }))
          } catch {}
        }
        reader.readAsText(file)
      }

      const onSpritesheetFile = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setConfig((current) => ({ ...current, live2dModelUrl: null, spritesheetDataUrl: String(reader.result) }))
        reader.readAsDataURL(file)
      }

      const clearPetPackage = () => setConfig((current) => ({ ...current, petJson: null, spritesheetDataUrl: null }))
      const clearLive2d = () => setConfig((current) => ({ ...current, live2dModelUrl: null }))

      const applyTaffyPreset = async () => {
        setPresetError(null)
        try {
          const response = await fetch(PRESET_TAFFY.manifestUrl)
          if (!response.ok) throw new Error(String(response.status))
          const petJson = await response.json()
          setConfig((current) => ({
            ...current,
            image: null,
            live2dModelUrl: null,
            petJson,
            spritesheetDataUrl: PRESET_TAFFY.spritesheetUrl,
            idleLines: current.idleLines.length > 0 ? current.idleLines : TAFFY_IDLE_LINES,
            thinkingLines: current.thinkingLines.length > 0 ? current.thinkingLines : TAFFY_THINKING_LINES,
          }))
        } catch {
          setPresetError('塔菲包加载失败，请重启 dsh 后重试')
        }
      }

      const applySenkoPreset = () => {
        setPresetError(null)
        setConfig((current) => ({
          ...current,
          image: null,
          petJson: null,
          spritesheetDataUrl: null,
          live2dModelUrl: SENKO_MODEL_URL,
          idleLines: current.idleLines.length > 0 ? current.idleLines : SENKO_IDLE_LINES,
          thinkingLines: current.thinkingLines.length > 0 ? current.thinkingLines : SENKO_THINKING_LINES,
        }))
      }

      const startLive2d = async () => {
        if (!config.live2dModelUrl) return
        setLive2dError(null)
        try {
          for (const src of LIVE2D_SCRIPTS) await loadScript(src)
          const Live2DModelClass = window.PIXI?.live2d?.Live2DModel
          if (!Live2DModelClass) throw new Error('Live2D 运行库加载失败')
          const container = live2dContainerRef.current
          if (!container) return
          if (live2dRef.current) {
            try { live2dRef.current.app?.destroy?.(true) } catch {}
            live2dRef.current = null
          }
          const width = container.clientWidth || sizeRef.current || 240
          const height = container.clientHeight || Math.round((sizeRef.current || 96) * 208 / 192)
          const app = new PIXI.Application({ width, height, backgroundAlpha: 0, antialias: true, autoStart: true })
          container.appendChild(app.view)
          const model = await Promise.race([
            Live2DModelClass.from(config.live2dModelUrl, { autoInteract: false, motionPreload: 'IDLE' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Live2D 模型加载超时')), 60000)),
          ])
          model.scale.set(Math.min(1, width / 420))
          model.x = width / 2
          model.y = height
          model.anchor.set(0.5, 1)
          app.stage.addChild(model)
          live2dRef.current = { app, model }
        } catch (error) {
          setLive2dError(error instanceof Error ? error.message : String(error))
        }
      }

      const parseButtons = (text) => text.split('\n').map((raw) => {
        const idx = raw.indexOf(',')
        if (idx === -1) return null
        const label = raw.slice(0, idx).trim()
        const command = raw.slice(idx + 1).trim()
        return label && command ? { label, command } : null
      }).filter(Boolean)

      const resetConfig = () => {
        setConfig({
          image: null,
          petJson: null,
          spritesheetDataUrl: null,
          live2dModelUrl: null,
          idleLines: [],
          thinkingLines: [],
          buttons: DEFAULT_BUTTONS,
        })
      }

      const resetLook = () => setConfig((current) => ({
        ...current,
        image: null,
        petJson: null,
        spritesheetDataUrl: null,
        live2dModelUrl: null,
      }))

      const resetLines = () => setConfig((current) => ({
        ...current,
        idleLines: [],
        thinkingLines: [],
      }))

      const changeSizeTo = (next) => {
        const clamped = Math.max(48, Math.min(220, next))
        setSize(clamped)
        save(posRef.current, clamped)
      }

      const currentLookLabel = config.live2dModelUrl
        ? 'Live2D'
        : config.petJson && config.spritesheetDataUrl
        ? '宠物包'
        : config.image
        ? '自定义图片'
        : '蓝鱼娘'

      const affinityProgress = nextLevel
        ? Math.max(0, Math.min(1, affinity.points / nextLevel.min))
        : 1

      const tabButton = (key, label) => createElement('button', {
        type: 'button',
        key,
        style: petPanelTab === key ? petTabActiveStyle : petTabStyle,
        onClick: () => setPetPanelTab(key),
      }, label)

      const renderLookTab = () => createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          createElement('span', { style: configLabelStyle }, '当前形象'),
          createElement('span', { style: levelBadgeStyle }, currentLookLabel),
        ),
        createElement('label', { style: { ...beautyFileButtonStyle, width: '100%', cursor: 'pointer' } },
          '上传图片（GIF / PNG / WebP）',
          createElement('input', { type: 'file', accept: 'image/*', onChange: onFile, style: { display: 'none' } }),
        ),
        createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: () => setConfig((current) => ({ ...current, image: null })) }, '清除图片'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: resetLook }, '重置形象'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: applyTaffyPreset }, '塔菲'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: applySenkoPreset }, '仙狐'),
        ),
        createElement('div', { style: configLabelStyle }, '宠物包'),
        createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
          createElement('label', { style: { ...beautyFileButtonStyle, cursor: 'pointer' } },
            '上传 pet.json',
            createElement('input', { type: 'file', accept: '.json,application/json', onChange: onPetJsonFile, style: { display: 'none' } }),
          ),
          createElement('label', { style: { ...beautyFileButtonStyle, cursor: 'pointer' } },
            '上传图集',
            createElement('input', { type: 'file', accept: 'image/*', onChange: onSpritesheetFile, style: { display: 'none' } }),
          ),
        ),
        presetError ? createElement('div', { style: errorStyle }, presetError) : null,
        createElement('div', { style: configLabelStyle }, 'Live2D'),
        createElement('input', {
          type: 'text',
          style: textareaStyle,
          placeholder: 'https://.../model.model3.json',
          value: config.live2dModelUrl || '',
          onChange: (event) => setConfig((current) => ({ ...current, live2dModelUrl: event.target.value || null })),
        }),
        createElement('div', { style: { display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' } },
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: clearPetPackage }, '清除宠物包'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: clearLive2d }, '清除 Live2D'),
          live2dError ? createElement('span', { style: errorStyle }, live2dError) : null,
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '大小'),
          createElement('input', {
            type: 'range',
            min: 48,
            max: 220,
            step: 4,
            value: size,
            style: beautySliderStyle,
            onChange: (event) => changeSizeTo(Number(event.target.value)),
          }),
          createElement('span', { style: beautyValueStyle }, `${size}px`),
        ),
      )

      const renderLinesTab = () => createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          createElement('span', { style: configLabelStyle }, '空闲台词'),
          createElement('button', { type: 'button', style: smallButtonStyle, onClick: resetLines }, '恢复默认'),
        ),
        createElement('textarea', {
          style: textareaStyle,
          rows: 3,
          value: config.idleLines.join('\n'),
          onChange: (event) => setConfig((current) => ({ ...current, idleLines: event.target.value.split('\n') })),
        }),
        createElement('span', { style: configLabelStyle }, '思考台词'),
        createElement('textarea', {
          style: textareaStyle,
          rows: 3,
          value: config.thinkingLines.join('\n'),
          onChange: (event) => setConfig((current) => ({ ...current, thinkingLines: event.target.value.split('\n') })),
        }),
        createElement('span', { style: configLabelStyle }, '互动键（每行：名称,命令）'),
        createElement('textarea', {
          style: textareaStyle,
          rows: 3,
          value: config.buttons.map((button) => `${button.label},${button.command}`).join('\n'),
          onChange: (event) => setConfig((current) => ({ ...current, buttons: parseButtons(event.target.value) })),
        }),
        createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
          config.buttons.map((button) => createElement('span', {
            key: `${button.label}-${button.command}`,
            style: petChipStyle,
          }, `${button.label} / ${button.command}`)),
        ),
      )

      const renderVoiceTab = () => createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          createElement('input', {
            type: 'checkbox',
            checked: tts.enabled,
            onChange: (event) => updateTTS({ enabled: event.target.checked }),
          }),
          createElement('span', { style: configLabelStyle }, '点击桌宠 / 互动时开口说话'),
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '声线'),
          createElement('select', {
            style: {
              ...smallButtonStyle,
              width: '100%',
              background: 'var(--fp-panel2, #ffffff)',
              color: 'var(--fp-text, #16324f)',
            },
            value: tts.voice,
            onChange: (event) => updateTTS({ voice: event.target.value }),
          },
          createElement('option', { value: '' }, '浏览器默认'),
          ttsVoices.map((voice) => createElement('option', { key: voice.name, value: voice.name }, voice.name)),
          ),
          createElement('span', { style: beautyValueStyle }, tts.voice ? '自定义' : '默认'),
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '语速'),
          createElement('input', {
            type: 'range',
            min: 0.5,
            max: 2,
            step: 0.1,
            value: tts.rate,
            style: beautySliderStyle,
            onChange: (event) => updateTTS({ rate: Number(event.target.value) }),
          }),
          createElement('span', { style: beautyValueStyle }, `${Math.round(tts.rate * 100)}%`),
        ),
        createElement('div', { style: beautyRowStyle },
          createElement('span', { style: beautyLabelStyle }, '音调'),
          createElement('input', {
            type: 'range',
            min: 0.5,
            max: 2,
            step: 0.1,
            value: tts.pitch,
            style: beautySliderStyle,
            onChange: (event) => updateTTS({ pitch: Number(event.target.value) }),
          }),
          createElement('span', { style: beautyValueStyle }, `${Math.round(tts.pitch * 100)}%`),
        ),
        createElement('input', {
          type: 'text',
          style: textareaStyle,
          placeholder: '本地 TTS API 地址（POST JSON {text} 返回音频）',
          value: tts.endpoint,
          onChange: (event) => updateTTS({ endpoint: event.target.value }),
        }),
        createElement('button', {
          type: 'button',
          style: { ...smallButtonStyle, width: '100%' },
          onClick: () => speakText('今天也要元气满满地摸鱼哦！'),
        }, '试听'),
      )

      const renderAffinityTab = () => createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
            createElement('span', { style: configLabelStyle }, `好感 Lv.${level.level}`),
            createElement('span', { style: levelBadgeStyle }, level.title),
          ),
          createElement('span', { style: { ...beautyValueStyle, color: 'var(--fp-dim, #7c8b9c)' } }, `${affinity.points} 分`),
        ),
        createElement('div', { style: petProgressTrackStyle },
          createElement('div', { style: { ...petProgressFillStyle, width: `${Math.round(affinityProgress * 100)}%` } }),
        ),
        createElement('div', { style: petHintStyle },
          nextLevel ? `距 ${nextLevel.title} 还差 ${nextLevel.min - affinity.points} 分` : '已满级，继续陪桌宠玩吧',
        ),
        createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
          createElement('span', { style: petHintStyle }, `摸头 ${affinity.pet}`),
          createElement('span', { style: petHintStyle }, `喂食 ${affinity.feed}`),
          createElement('span', { style: petHintStyle }, `抱抱 ${affinity.hug}`),
          createElement('span', { style: petHintStyle }, `任务 ${affinity.task}`),
        ),
        createElement('button', {
          type: 'button',
          style: { ...smallButtonStyle, width: '100%' },
          onClick: () => setAffinity(saveAffinity({ points: 0, pet: 0, feed: 0, hug: 0, task: 0 })),
        }, '重置好感'),
      )

      useEffect(() => {
        if (!config.live2dModelUrl) {
          if (live2dRef.current) {
            try { live2dRef.current.app?.destroy?.(true) } catch {}
            live2dRef.current = null
          }
          return undefined
        }
        startLive2d()
        return () => {
          if (live2dRef.current) {
            try { live2dRef.current.app?.destroy?.(true) } catch {}
            live2dRef.current = null
          }
        }
      }, [config.live2dModelUrl])

      useEffect(() => {
        const applyPreset = (event) => {
          const kind = event.detail?.kind
          if (kind === 'taffy') applyTaffyPreset()
          if (kind === 'default') resetConfig()
        }
        const installPetData = (event) => {
          const petJson = event.detail?.petJson
          const spritesheetDataUrl = event.detail?.spritesheetDataUrl
          if (petJson && spritesheetDataUrl) {
            setConfig((current) => ({
              ...current,
              image: null,
              live2dModelUrl: null,
              petJson,
              spritesheetDataUrl,
            }))
          }
        }
        const installLive2d = (event) => {
          const url = event.detail?.url
          if (url) {
            setConfig((current) => ({
              ...current,
              image: null,
              petJson: null,
              spritesheetDataUrl: null,
              live2dModelUrl: url,
              idleLines: url === SENKO_MODEL_URL && current.idleLines.length === 0 ? SENKO_IDLE_LINES : current.idleLines,
              thinkingLines: url === SENKO_MODEL_URL && current.thinkingLines.length === 0 ? SENKO_THINKING_LINES : current.thinkingLines,
            }))
          }
        }
        const onGardenChange = (event) => {
          const tree = event.detail?.tree
          if (tree) showReaction(`🌱 代码树长大了：${GARDEN_EMOJI[tree.stage] || GARDEN_EMOJI[GARDEN_EMOJI.length - 1]}`)
        }
        window.addEventListener('dsh-funpack-apply-pet-preset', applyPreset)
        window.addEventListener('dsh-funpack-install-pet-data', installPetData)
        window.addEventListener('dsh-funpack-install-live2d', installLive2d)
        window.addEventListener('dsh-funpack-garden-change', onGardenChange)
        return () => {
          window.removeEventListener('dsh-funpack-apply-pet-preset', applyPreset)
          window.removeEventListener('dsh-funpack-install-pet-data', installPetData)
          window.removeEventListener('dsh-funpack-install-live2d', installLive2d)
          window.removeEventListener('dsh-funpack-garden-change', onGardenChange)
        }
      }, [])

      const text = reaction || lines[line % lines.length]
      const petImage = config.image || (waving ? PET_WAVING : PET_IDLE)
      const petWidth = size
      const petHeight = Math.round((size * 208) / 192)
      const petScale = size / PET_CELL_WIDTH
      const sheetRows = config.petJson && config.petJson.spriteVersionNumber === 2 ? 11 : 9
      const petRow = running ? PET_STATES.waiting.row : PET_STATES.idle.row
      const petCol = petFrame % PET_COLUMNS
      const spritesheetStyle = {
        width: PET_CELL_WIDTH * petScale,
        height: PET_CELL_HEIGHT * petScale,
        backgroundImage: `url(${config.spritesheetDataUrl})`,
        backgroundSize: `${PET_CELL_WIDTH * PET_COLUMNS * petScale}px ${PET_CELL_HEIGHT * sheetRows * petScale}px`,
        backgroundPosition: `${-petCol * PET_CELL_WIDTH * petScale}px ${-petRow * PET_CELL_HEIGHT * petScale}px`,
        imageRendering: 'pixelated',
        display: 'block',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.18))',
      }
      const petElement = config.live2dModelUrl
        ? createElement('div', {
            ref: live2dContainerRef,
            style: {
              width: petWidth,
              height: petHeight,
              pointerEvents: 'none',
              display: 'block',
            },
          })
        : config.petJson && config.spritesheetDataUrl
        ? createElement('div', { style: spritesheetStyle })
        : createElement('img', {
            src: petImage,
            alt: '\u684c\u5ba0',
            width: petWidth,
            height: petHeight,
            draggable: false,
            style: { display: 'block', pointerEvents: 'none', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.18))' },
          })
      const unlockButtons = level.level >= 2 && !config.buttons.some((button) => button.command === '/hug')
        ? [{ label: '抱抱', command: '/hug' }]
        : []
      const containerStyle = pos === null
        ? { ...petBaseStyle, right: 16, bottom: 16 }
        : { ...petBaseStyle, left: pos.x, top: pos.y }
      if (!visible) return null
      return createPortal(
        createElement('div', { style: containerStyle },
          panelOpen ? createElement('div', { id: 'dsh-funpack-pet-panel', style: panelStyle },
            createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } },
              createElement('div', { style: { fontWeight: 600, fontSize: 13 } }, '桌宠设置'),
              createElement('button', { type: 'button', style: { ...controlButtonStyle, fontSize: 13, lineHeight: '18px' }, title: '关闭', onClick: () => setPanelOpen(false) }, '✕'),
            ),
            createElement('div', { style: petTabBarStyle },
              tabButton('look', '形象'),
              tabButton('lines', '台词'),
              tabButton('voice', '语音'),
              tabButton('affinity', '好感'),
            ),
            createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
              petPanelTab === 'look' ? renderLookTab() : null,
              petPanelTab === 'lines' ? renderLinesTab() : null,
              petPanelTab === 'voice' ? renderVoiceTab() : null,
              petPanelTab === 'affinity' ? renderAffinityTab() : null,
            ),
            createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
              createElement('button', { type: 'button', style: smallButtonStyle, onClick: resetConfig }, '重置全部'),
              createElement('button', { type: 'button', style: { ...smallButtonStyle, fontWeight: 600 }, onClick: () => setPanelOpen(false) }, '完成'),
            ),
          ) : null,
          createElement('div', { style: levelBadgeStyle }, `Lv.${level.level} ${level.title}`),
          createElement('div', { style: bubbleStyle, role: 'status' }, text),
          createElement('div', { style: controlRowStyle },
            createElement('button', { type: 'button', style: controlButtonStyle, title: '设置', onClick: () => setPanelOpen((open) => !open) }, '⚙'),
            createElement('button', { type: 'button', style: controlButtonStyle, title: '缩小', onClick: () => changeSize(-16) }, '-'),
            createElement('button', { type: 'button', style: controlButtonStyle, title: '放大', onClick: () => changeSize(16) }, '+'),
            ...[...config.buttons, ...unlockButtons].map((button) => createElement('button', {
              type: 'button',
              key: `${button.label}-${button.command}`,
              style: controlButtonStyle,
              onClick: () => handlePetCommand(button),
            }, button.label)),
          ),
          createElement('div', {
            style: {
              position: 'relative',
              pointerEvents: 'auto',
              touchAction: 'none',
              cursor: 'grab',
            },
            title: '拖拽移动',
            onPointerDown: startMove,
            onClick: handleClick,
          },
            petElement,
          ),
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
          inject: (sessionId) => ({
            run: async (line) => {
              const result = await ctx.remote.commands.execute(sessionId, line)
              if (!result.ok) return { ok: false, error: `${result.error.message} (${result.error.code})` }
              const value = result.value
              if (value === undefined) return { ok: false, error: `unknown command: ${line}` }
              return { ok: true, text: typeof value === 'string' ? value : (value?.result?.text || value?.text || '') }
            },
          }),
        }, FunPet))
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'funpack',
          order: 5,
          inject: (sessionId) => ({
            run: async (line) => {
              const result = await ctx.remote.commands.execute(sessionId, line)
              if (!result.ok) return { ok: false, error: `${result.error.message} (${result.error.code})` }
              const value = result.value
              if (value === undefined) return { ok: false, error: `unknown command: ${line}` }
              return { ok: true, text: typeof value === 'string' ? value : (value?.result?.text || value?.text || '') }
            },
          }),
        }, FunButtons))
      },
    }
  },
})
