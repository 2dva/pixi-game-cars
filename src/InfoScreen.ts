import { Application, Container, Graphics, Text, type DestroyOptions } from 'pixi.js'
import { APP_HEIGHT, APP_WIDTH, GAME_MODES, type GameMode } from './configuration'

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

const fontTitle = {
  fontFamily: 'Arial',
  fontSize: 36,
  fill: '#eeeeee',
  letterSpacing: 2,
}
const fontMain = {
  fontFamily: 'Arial',
  fontSize: 24,
  letterSpacing: 2,
  fill: '#eeeeee',
  lineHeight: 46,
}
const fontSecondary = {
  fontFamily: 'Arial',
  fontSize: 18,
  fill: '#eeeeee',
  letterSpacing: 2,
}

export class InfoScreen extends Container {
  keydownHandlerBound = this.keydownHandler.bind(this)

  constructor() {
    super()
  }

  async preloadAssets() {}

  setup(app: Application) {
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
      y: 410,
    })
    text3.anchor.set(0.5, 0)
    this.addChild(text1, text2, text3)
    this.visible = false
    app.stage.addChild(this)

    let elapsed = 0
    app.ticker.add(({ deltaTime }) => {
      elapsed += deltaTime
      // Toggle visibility every 30 frames (approx 0.5 seconds at 60fps)
      if (Math.floor(elapsed / 60) % 2 === 0) {
        text3.visible = true
      } else {
        text3.visible = false
      }
    })
  }

  keydownHandler(event: KeyboardEvent) {
    const keyCode = event.code
    if (keyCode === 'Digit1') {
      this.emitAndHide(GAME_MODES.FREE_RIDE) // start FREE_RIDE game
    } else if (keyCode === 'Digit2') {
      this.emitAndHide(GAME_MODES.COLLECT_IN_TIME) // start COLLECT_IN_TIME game
    }
  }

  show(mode: ScreenMode) {
    if (mode === SCREEN_MODE.START) {
      // пока только один режим
    }
    this.visible = true
    window.addEventListener('keydown', this.keydownHandlerBound)
  }

  private emitAndHide(mode: number) {
    this.emit(screenEventName, {
      type: EVENT_TYPE.SELECT_GAME_MODE,
      mode,
    })
    this.hide()
  }

  private hide() {
    window.removeEventListener('keydown', this.keydownHandlerBound)
    this.visible = false
  }

  destroy(options?: DestroyOptions): void {
    this.hide()
    this.removeChildren()

    super.destroy(options)
  }
}
