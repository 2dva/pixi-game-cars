import { Container, Graphics, Text, Ticker, type DestroyOptions, type TextStyleOptions } from 'pixi.js'
import { APP_HEIGHT, APP_VERSION, APP_WIDTH, zIndexFixed } from './configuration'
import fontStyles from './fontStyles.json'
import screenConfig from './screenConfig.json'
import { GAME_MODE, type GameMode, type State } from './state'
import { applyTemplate, formatDistance, type TemplateData } from './utils'

const CONTENT_PADDING = 125
const CONTENT_WIDTH = APP_WIDTH - 2 * CONTENT_PADDING
const CONTENT_HEIGHT = APP_HEIGHT - 2 * CONTENT_PADDING

type ScreenMode = keyof typeof screenConfig

export const SCREEN_MODE: Record<string, ScreenMode> = {
  START: 'startScreen',
  PAUSE: 'pauseScreen',
  FAILURE: 'endScreenCrashed',
  FINISH: 'endScreenTimeIsUp',
} as const

export const screenEventName = 'screenEvent'

export const EVENT_TYPE = {
  SELECT_GAME_MODE: 'selectGameMode',
} as const

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

export type ScreenEvent = {
  type: EventType
  mode: GameMode
}

type FontStyleKey = keyof typeof fontStyles

export class InfoScreen extends Container {
  content: Container
  ticker: Ticker
  elapsedSeconds: number
  blinkText: Text
  screenMode: ScreenMode | null
  keydownHandlerBound = this.keydownHandler.bind(this)

  constructor() {
    super()
    this.content = new Container()
    this.zIndex = zIndexFixed.infoScreens
    this.ticker = new Ticker()
    this.elapsedSeconds = 0
    this.blinkText = new Text()
    this.screenMode = null
  }

  async preloadAssets() {}

  setup(stage: Container) {
    this.content.x = this.content.y = CONTENT_PADDING

    this.ticker.add(this.tickHandler, this)

    this.visible = false

    const background = new Graphics()
    background.rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({
      color: 0x000000,
      alpha: 0.2,
    })
    background.roundRect(CONTENT_PADDING, CONTENT_PADDING, CONTENT_WIDTH, CONTENT_HEIGHT, 10).fill({
      color: 0x000000,
      alpha: 0.5,
    })
    if (APP_VERSION) {
      this.addChild(
        new Text({
          text: `v ${APP_VERSION}`,
          style: fontStyles.fontScreenVersion as TextStyleOptions,
          x: APP_WIDTH - CONTENT_PADDING - 5,
          y: APP_HEIGHT - CONTENT_PADDING - 3,
          anchor: 1,
        })
      )
    }
    this.addChild(background)
    this.addChild(this.content)
    stage.addChild(this)
  }

  setupScreen(screenId: ScreenMode, data: TemplateData = {}) {
    const cfgScreen = screenConfig[screenId]
    const txtFields: Text[] = []

    for (const textObj of cfgScreen.content) {
      const alignCenter = 'center' in textObj
      const style = fontStyles[textObj.style as FontStyleKey] as TextStyleOptions
      txtFields.push(
        new Text({
          text: applyTemplate(textObj.text, data),
          style: { ...style, wordWrap: true, wordWrapWidth: CONTENT_WIDTH - 20 },
          x: alignCenter ? CONTENT_WIDTH / 2 : textObj.x,
          y: textObj.y,
          anchor: alignCenter ? 0.5 : 0,
        })
      )
    }
    txtFields.push(
      new Text({
        text: cfgScreen.titleText,
        style: fontStyles.fontScreenTitle,
        x: CONTENT_WIDTH / 2,
        y: 35,
        anchor: 0.5,
      })
    )
    const txtBlink = new Text({
      text: cfgScreen.blinkText,
      style: fontStyles.fontScreenBlink,
      x: CONTENT_WIDTH / 2,
      y: 325,
      anchor: 0.5,
    })
    txtFields.push(txtBlink)
    this.blinkText = txtBlink

    this.content.removeChildren()
    this.content.addChild(...txtFields)
  }

  tickHandler(time: Ticker) {
    if (!document.hasFocus()) return
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
        this.emitAndHide(GAME_MODE.FREE_RIDE)
      } else if (keyCode === 'Digit2') {
        this.emitAndHide(GAME_MODE.COLLECT_IN_TIME)
      }
    } else if (this.screenMode === SCREEN_MODE.FINISH || this.screenMode === SCREEN_MODE.FAILURE) {
      if (keyCode === 'Space') {
        this.emitAndHide(GAME_MODE.DEMO)
      }
    }
  }

  show(mode: ScreenMode, state: State) {
    if (this.visible && mode === this.screenMode) return

    this.screenMode = mode
    if (!this.ticker.started) this.ticker.start()
    this.setupScreen(mode, { score: state.score, distance: formatDistance(state.distance) })

    this.visible = true
    setTimeout(() => {
      window.addEventListener('keydown', this.keydownHandlerBound)
    }, 400)
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
