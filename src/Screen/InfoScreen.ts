import { Container, Graphics, Text, Ticker, type DestroyOptions, type TextStyleOptions } from 'pixi.js'
import { gameConfig, zIndexFixed } from '../configuration'
import fontStyles from '../fontStyles.json'
import { tr } from '../lib/i18n'
import screenConfig from './screenConfig.json'
import { GAME_MODE, type GameMode, type State } from '../state'
import { getTopScore, isRecordScore, saveMyScore } from '../lib/topScore'
import { applyTemplate, formatDistance, type TemplateData } from '../utils'
import { Sound } from '../lib/sound'

type ScreenMode = keyof typeof screenConfig

export const SCREEN_MODE: Record<string, ScreenMode> = {
  START: 'startScreen',
  PAUSE: 'pauseScreen',
  FAILURE: 'endScreenCrashed',
  FINISH: 'endScreenTimeIsUp',
  INPUT_NAME: 'inputNameScreen',
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

const DEFAULT_NAME = 'User'

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
    this.zIndex = zIndexFixed.splashScreens
    this.ticker = new Ticker()
    this.elapsedSeconds = 0
    this.blinkText = new Text()
    this.screenMode = null
  }

  async preloadAssets() {}

  setup(stage: Container) {
    this.contentWidth = gameConfig.appWidth - 2 * gameConfig.screenContentPadding
    this.contentHeight = 350
    this.content.x = gameConfig.screenContentPadding
    this.content.y = (gameConfig.appHeight - this.contentHeight) / 2

    this.ticker.add(this.tickHandler, this)

    this.visible = false

    const background = new Graphics()
    background.rect(0, 0, gameConfig.appWidth, gameConfig.appHeight).fill({
      color: 0x000000,
      alpha: 0.25,
    })
    background
      .roundRect(gameConfig.screenContentPadding, this.content.y, this.contentWidth, this.contentHeight, 10)
      .fill({
        color: 0x000000,
        alpha: 0.5,
      })
    this.addChild(background)

    if (gameConfig.appVersion) {
      this.addChild(
        new Text({
          text: `v ${gameConfig.appVersion}`,
          style: fontStyles.fontScreenVersion as TextStyleOptions,
          x: gameConfig.screenContentPadding + this.contentWidth - 5,
          y: this.content.y + this.contentHeight - 3,
          anchor: 1,
        })
      )
    }

    if (gameConfig.isMobileDevice) {
      this.eventMode = 'static'
      this.on('pointerdown', this.doUserAction.bind(this, 'Space'))
    }

    this.addChild(this.content)
    stage.addChild(this)
  }

  private buildTopScoreTable(name: string, score: number = 0) {
    const data = getTopScore()
    let results = '',
      highlightOnce = false
    for (let i = 0; i < Math.min(6, data.length); i++) {
      const [n, s] = data[i]
      let row = String(n).padEnd(6) + '   ' + String(s).padStart(6, '0') + '\n'
      if (n === name && s === score && !highlightOnce) {
        highlightOnce = true
        row = `<b>${row}</b>`
      }
      results += row
    }

    return results
  }

  private setupScreen(screenId: ScreenMode, data: TemplateData = {}) {
    const cfgScreen = screenConfig[screenId]
    const txtFields: Text[] = []

    for (const textObj of cfgScreen.content) {
      const alignCenter = 'center' in textObj
      const style = fontStyles[textObj.style as FontStyleKey] as TextStyleOptions
      const txt = new Text({
        text: applyTemplate(tr(textObj.text), data),
        style: { ...style, wordWrap: true, wordWrapWidth: this.contentWidth - 20 },
        x: alignCenter ? this.contentWidth / 2 : textObj.x,
        y: textObj.y,
        anchor: alignCenter ? 0.5 : 0,
      })
      if ('clickAction' in textObj) {
        txt.eventMode = 'static'
        txt.cursor = 'pointer'
        txt.on('pointerdown', this.doUserAction.bind(this, textObj.clickAction!))
      }

      txtFields.push(txt)
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
      y: 380,
      anchor: 0.5,
    })
    txtFields.push(txtBlink)
    this.blinkText = txtBlink

    this.content.removeChildren()
    this.content.addChild(...txtFields)
  }

  private tickHandler(time: Ticker) {
    if (!document.hasFocus()) return
    this.elapsedSeconds += time.elapsedMS
    if (this.elapsedSeconds > 1000.0) {
      this.elapsedSeconds -= 1000.0
      this.blinkText.visible = !this.blinkText.visible
    }
  }

  private keydownHandler(event: KeyboardEvent) {
    const keyCode = event.code
    this.doUserAction(keyCode)
  }

  private doUserAction(keyCode: string) {
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
    if (mode === SCREEN_MODE.FINISH) {
      const record = isRecordScore(state.score)
      if (record) {
        saveMyScore(DEFAULT_NAME, state.score)
      }
      data = { score: state.score, distance: formatDistance(state.distance), record }
    }
    if (mode === SCREEN_MODE.TOP_SCORE) {
      data = { topScore: this.buildTopScoreTable(DEFAULT_NAME, state.score) }
    }
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
    Sound.tap.play()
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
