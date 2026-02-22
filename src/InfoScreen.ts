import { Container, Graphics, Text, Ticker, type DestroyOptions, type TextStyleOptions } from 'pixi.js'
import { APP_HEIGHT, APP_WIDTH, zIndexFixed } from './configuration'
import { GAME_MODE, GAME_MODE_REASON, type GameMode, type GameModeReason, type State } from './state'

export const SCREEN_MODE = {
  START: 'mode_start',
  PAUSE: 'mode_pause',
  END: 'mode_end',
} as const

export const screenEventName = 'screenEvent'

export const EVENT_TYPE = {
  SELECT_GAME_MODE: 'selectGameMode',
} as const

export type ScreenMode = (typeof SCREEN_MODE)[keyof typeof SCREEN_MODE]
export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

export type ScreenEvent = {
  type: EventType
  mode: GameMode
}

const fontTitle: TextStyleOptions = {
  fontFamily: 'Arial',
  fontSize: 36,
  fill: '#eeeeee',
  letterSpacing: 2,
}
const fontMain: TextStyleOptions = {
  fontFamily: 'Arial',
  fontSize: 24,
  letterSpacing: 2,
  fill: '#eeeeee',
  lineHeight: 46,
  tagStyles: {
    b: {
      fontWeight: 'bold',
      fill: 0xfff568,
    },
  },
}
const fontSecondary: TextStyleOptions = {
  fontFamily: 'Arial',
  fontSize: 18,
  fill: '#eeeeee',
  letterSpacing: 2,
}

export class InfoScreen extends Container {
  keydownHandlerBound = this.keydownHandler.bind(this)
  ticker: Ticker
  elapsedSeconds: number
  blinkText: Text
  screenMode: ScreenMode | null

  constructor() {
    super()
    this.zIndex = zIndexFixed.infoScreens
    this.ticker = new Ticker()
    this.elapsedSeconds = 0
    this.blinkText = new Text()
    this.screenMode = null
  }

  async preloadAssets() {}

  setup(stage: Container) {
    this.ticker.add(this.tickHandler, this)

    this.visible = false
    stage.addChild(this)
  }

  setupBackground() {
    const background = new Graphics()
    background.rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({
      color: 0x000000,
      alpha: 0.2,
    })
    const padding = 125
    background.roundRect(padding, padding, APP_WIDTH - 2 * padding, APP_HEIGHT - 2 * padding, 10).fill({
      color: 0x000000,
      alpha: 0.5,
    })
    this.addChild(background)
  }

  setupStartScreen() {
    this.removeChildren()
    this.setupBackground()

    const text1 = new Text({
      text: 'Выбери тип игры:',
      style: fontTitle,
      x: APP_WIDTH / 2,
      y: 180,
    })
    text1.anchor.set(0.5, 0)
    const text2 = new Text({
      text: '1 - Свободная езда\n2 - Собери монетки',
      style: fontMain,
      x: 240,
      y: 260,
    })
    const text3 = new Text({
      text: 'Нажми клавишу для выбора режима',
      style: fontSecondary,
      x: APP_WIDTH / 2,
      y: 435,
    })
    text3.anchor.set(0.5, 0)
    this.blinkText = text3

    this.addChild(text1, text2, text3)
  }

  setupEndScreen(reason: GameModeReason, score: number) {
    this.removeChildren()
    this.setupBackground()

    const title = reason === GAME_MODE_REASON.END_TIME_IS_UP ? 'Время вышло' : 'Игра закончена'
    const content = reason === GAME_MODE_REASON.END_TIME_IS_UP ? `Ты набрал <b>${score}</b> очков` : 'Машина разбилась'
    const info = 'Нажми пробел чтобы продолжить'

    const text1 = new Text({
      text: title,
      style: fontTitle,
      x: APP_WIDTH / 2,
      y: 180,
    })
    text1.anchor.set(0.5, 0)
    const text2 = new Text({
      text: content,
      style: fontMain,
      x: 240,
      y: 260,
    })
    const text3 = new Text({
      text: info,
      style: fontSecondary,
      x: APP_WIDTH / 2,
      y: 435,
    })
    text3.anchor.set(0.5, 0)
    this.blinkText = text3

    this.addChild(text1, text2, text3)
  }

  tickHandler(time: Ticker) {
    this.elapsedSeconds += time.elapsedMS
    if (this.elapsedSeconds > 1000.0) {
      this.elapsedSeconds -= 1000.0
      this.blinkText.visible = !this.blinkText.visible
    }
  }

  keydownHandler(event: KeyboardEvent) {
    const keyCode = event.code
    if (this.screenMode === SCREEN_MODE.START) {
      if (keyCode === 'Digit1') {
        this.emitAndHide(GAME_MODE.FREE_RIDE) // start FREE_RIDE game
      } else if (keyCode === 'Digit2') {
        this.emitAndHide(GAME_MODE.COLLECT_IN_TIME) // start COLLECT_IN_TIME game
      }
    } else if (this.screenMode === SCREEN_MODE.END) {
      if (keyCode === 'Space') {
        this.emitAndHide(GAME_MODE.DEMO)
      }
    }
  }

  show(mode: ScreenMode, state: State) {
    if (this.visible) return

    this.screenMode = mode
    this.ticker.start()
    if (mode === SCREEN_MODE.START) {
      this.setupStartScreen()
    } else if (mode === SCREEN_MODE.END) {
      const { modeReason, score } = state
      this.setupEndScreen(modeReason, score)
    }
    this.visible = true
    setTimeout(() => {
      window.addEventListener('keydown', this.keydownHandlerBound)
    }, 500)
  }

  private emitAndHide(mode: number) {
    this.hide()
    this.emit(screenEventName, {
      type: EVENT_TYPE.SELECT_GAME_MODE,
      mode,
    })
  }

  private hide() {
    if (this.ticker.started) this.ticker.stop()
    window.removeEventListener('keydown', this.keydownHandlerBound)
    this.visible = false
  }

  destroy(options?: DestroyOptions): void {
    this.hide()
    this.removeChildren()

    super.destroy(options)
  }
}
