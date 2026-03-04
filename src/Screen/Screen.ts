import { Container, EventEmitter, Text, Ticker, type TextStyleOptions } from 'pixi.js'
import fontStyles from '../fontStyles.json'
import { tr } from '../lib/i18n'
import { type GameMode, type State } from '../state'
import { applyTemplate, type TemplateData } from '../utils'
import screenConfig from './screenConfig.json'
import { gameConfig } from '../configuration'

export type ScreenMode = keyof typeof screenConfig

export const SCREEN_MODE: Record<string, ScreenMode> = {
  START: 'startScreen',
  PAUSE: 'pauseScreen',
  FAILURE: 'endScreenCrashed',
  FINISH: 'endScreenTimeIsUp',
  INPUT_NAME: 'inputNameScreen',
  TOP_SCORE: 'endScreenTopScore',
} as const

export const screenSingleEvent = 'screenSingleEvent'

export const EVENT_TYPE = {
  SELECT_GAME_MODE: 'selectGameMode',
  UNPAUSE_GAME: 'unpauseGame',
  GO_TO_SCREEN: 'goToScreen',
} as const

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

export type ScreenEvent = {
  type: EventType
  gameMode?: GameMode
  screenMode?: ScreenMode
}

type FontStyleKey = keyof typeof fontStyles

export abstract class Screen extends EventEmitter {
  ticker: Ticker
  elapsedSeconds: number
  blinkText: Text
  screenMode: ScreenMode | null
  timer: NodeJS.Timeout | null = null
  keydownHandlerBound = this.keydownHandler.bind(this)
  contentWidth!: number
  contentHeight!: number
  screenId!: ScreenMode

  constructor() {
    super()
    this.ticker = new Ticker()
    this.elapsedSeconds = 0
    this.blinkText = new Text()
    this.screenMode = null
  }

  setup(cont: Container, state: State) {
    this.contentWidth = gameConfig.appWidth - 2 * gameConfig.screenContentPadding
    this.contentHeight = gameConfig.screenContentHeight

    this.ticker.add(this.tickHandler, this)

    if (!this.ticker.started) this.ticker.start()

    const data: TemplateData = this.setupData(state)
    this.setupScreen(cont, data)
    this.onAfterSetup(state)

    setTimeout(() => {
      window.addEventListener('keydown', this.keydownHandlerBound)
    }, 400)
  }

  onUserAction(_keyCode: string) {}

  protected onAfterSetup(_state: State) {}

  protected setupData(_state: State): TemplateData {
    return {}
  }

  protected setupScreen(cont: Container, data: TemplateData = {}) {
    const cfgScreen = screenConfig[this.screenId]
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
        txt.on('pointerdown', this.onUserAction.bind(this, textObj.clickAction!))
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

    cont.removeChildren()
    cont.addChild(...txtFields)
  }

  protected tickHandler(time: Ticker) {
    if (!document.hasFocus()) return
    this.elapsedSeconds += time.elapsedMS
    if (this.elapsedSeconds > 1000.0) {
      this.elapsedSeconds -= 1000.0
      this.blinkText.visible = !this.blinkText.visible
    }
  }

  private keydownHandler(event: KeyboardEvent) {
    const keyCode = event.code
    this.onUserAction(keyCode)
  }

  fire(type: EventType, gameMode?: GameMode, screenMode?: ScreenMode) {
    this.emit(screenSingleEvent, { type, gameMode, screenMode } as ScreenEvent)
  }

  destroy(): void {
    this.removeAllListeners()
    if (this.timer) clearTimeout(this.timer)
    if (this.ticker.started) this.ticker.stop()
    window.removeEventListener('keydown', this.keydownHandlerBound)
  }
}
