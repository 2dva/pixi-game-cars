import { Container, Graphics, Text, Ticker, type DestroyOptions, type TextStyleOptions } from 'pixi.js'
import { gameConfig, zIndexFixed } from './configuration'
import fontStyles from './fontStyles.json'
import { tr } from './i18n'
import screenConfig from './screenConfig.json'
import { GAME_MODE, type GameMode, type State } from './state'
import { getTopResults } from './topScore'
import { applyTemplate, formatDistance, type TemplateData } from './utils'

type ScreenMode = keyof typeof screenConfig

export const SCREEN_MODE: Record<string, ScreenMode> = {
  START: 'startScreen',
  PAUSE: 'pauseScreen',
  FAILURE: 'endScreenCrashed',
  FINISH: 'endScreenTimeIsUp',
  TOP_SCORE: 'endScreenTopScore',
} as const

export const screenEventName = 'screenEvent'

export const EVENT_TYPE = {
  SELECT_GAME_MODE: 'selectGameMode',
  UNPAUSE_GAME: 'unpauseGame',
} as const

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

export type ScreenEvent = {
  type: EventType
  mode?: GameMode
}

type FontStyleKey = keyof typeof fontStyles

export class InfoScreen extends Container {
  content: Container
  ticker: Ticker
  elapsedSeconds: number
  blinkText: Text
  screenMode: ScreenMode | null
  timer: NodeJS.Timeout | null = null
  keydownHandlerBound = this.keydownHandler.bind(this)
  contentWidth!: number
  contentHeight!: number

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
    this.contentWidth = gameConfig.appWidth - 2 * gameConfig.screenContentPadding
    this.contentHeight = Math.min(gameConfig.appHeight - 2 * gameConfig.screenContentPadding, 350)
    this.content.x = this.content.y = gameConfig.screenContentPadding

    this.ticker.add(this.tickHandler, this)

    this.visible = false

    const background = new Graphics()
    background.rect(0, 0, gameConfig.appWidth, gameConfig.appHeight).fill({
      color: 0x000000,
      alpha: 0.2,
    })
    background.roundRect(gameConfig.screenContentPadding, gameConfig.screenContentPadding, this.contentWidth, this.contentHeight, 10).fill({
      color: 0x000000,
      alpha: 0.5,
    })
    if (gameConfig.appVersion) {
      this.addChild(
        new Text({
          text: `v ${gameConfig.appVersion}`,
          style: fontStyles.fontScreenVersion as TextStyleOptions,
          x: gameConfig.appWidth - gameConfig.screenContentPadding - 5,
          y: gameConfig.appHeight - gameConfig.screenContentPadding - 3,
          anchor: 1,
        })
      )
    }
    this.addChild(background)
    this.addChild(this.content)
    stage.addChild(this)
  }

  private buildTopScoreTable() {
    const data = getTopResults()
    let results = ''
    for (let i = 0; i < Math.min(6, data.length); i++) {
      const [name, score] = data[i]
      results += String(name).padEnd(6) + '   ' + String(score).padStart(6, '0') + '\n'
    }

    return results
  }

  setupScreen(screenId: ScreenMode, data: TemplateData = {}) {
    const cfgScreen = screenConfig[screenId]
    const txtFields: Text[] = []

    for (const textObj of cfgScreen.content) {
      const alignCenter = 'center' in textObj
      const style = fontStyles[textObj.style as FontStyleKey] as TextStyleOptions
      txtFields.push(
        new Text({
          text: applyTemplate(tr(textObj.text), data),
          style: { ...style, wordWrap: true, wordWrapWidth: this.contentWidth - 20 },
          x: alignCenter ? this.contentWidth / 2 : textObj.x,
          y: textObj.y,
          anchor: alignCenter ? 0.5 : 0,
        })
      )
    }
    txtFields.push(
      new Text({
        text: tr(cfgScreen.titleText),
        style: fontStyles.fontScreenTitle,
        x: this.contentWidth / 2,
        y: 35,
        anchor: 0.5,
      })
    )
    const txtBlink = new Text({
      text: tr(cfgScreen.blinkText),
      style: fontStyles.fontScreenBlink,
      x: this.contentWidth / 2,
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
        this.emitAndHide(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.FREE_RIDE)
      } else if (keyCode === 'Digit2') {
        this.emitAndHide(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.COLLECT_IN_TIME)
      }
    } else if (this.screenMode === SCREEN_MODE.PAUSE) {
      if (keyCode === 'Space') {
        this.emitAndHide(EVENT_TYPE.UNPAUSE_GAME)
      }
    } else if (
      this.screenMode === SCREEN_MODE.FINISH ||
      this.screenMode === SCREEN_MODE.TOP_SCORE ||
      this.screenMode === SCREEN_MODE.FAILURE
    ) {
      if (keyCode === 'Space') {
        this.emitAndHide(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
      }
    }
  }

  show(mode: ScreenMode, state: State) {
    if (this.visible && mode === this.screenMode) return
    if (this.timer) clearTimeout(this.timer)

    this.screenMode = mode
    if (!this.ticker.started) this.ticker.start()
    let data: TemplateData = {}
    if (mode === SCREEN_MODE.FINISH) data = { score: state.score, distance: formatDistance(state.distance) }
    if (mode === SCREEN_MODE.TOP_SCORE) data = { topScore: this.buildTopScoreTable() }
    this.setupScreen(mode, data)

    if (mode === SCREEN_MODE.FINISH && state.score > 0) {
      this.timer = setTimeout(() => {
        this.show(SCREEN_MODE.TOP_SCORE, state)
      }, 2000)
    }

    this.visible = true
    setTimeout(() => {
      window.addEventListener('keydown', this.keydownHandlerBound)
    }, 400)
  }

  private emitAndHide(type: EventType, mode?: GameMode) {
    this.hide()
    this.emit(screenEventName, {
      type,
      mode,
    })
  }

  private hide() {
    if (this.timer) clearTimeout(this.timer)
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
