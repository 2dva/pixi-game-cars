import { Container, Graphics, Text, type TextStyleOptions } from 'pixi.js'
import { gameConfig, zIndexFixed } from '../configuration'
import fontStyles from '../fontStyles.json'
import { Sound } from '../lib/sound'
import { EVENT_TYPE, screenSingleEvent, type Screen, type ScreenEvent, type ScreenMode } from './Screen'
import { ScreenFailure } from './ScreenFailure'
import { ScreenFinish } from './ScreenFinish'
import { ScreenKeyboard } from './ScreenKeyboard'
import { ScreenNameInput } from './ScreenNameInput'
import { ScreenPause } from './ScreenPause'
import { ScreenSettings } from './ScreenSettings'
import { ScreenStart } from './ScreenStart'
import { ScreenTopScore } from './ScreenTopScore'

export const screenGameModeEvent = 'screenGameModeEvent'
export const screenShowEvent = 'screenShowEvent'
export const screenCloseEvent = 'screenCloseEvent'

export const SCREEN_MODE: Record<string, ScreenMode> = {
  START: 'startScreen',
  PAUSE: 'pauseScreen',
  FAILURE: 'endScreenCrashed',
  FINISH: 'endScreenTimeIsUp',
  INPUT_NAME: 'inputNameScreen',
  TOP_SCORE: 'endScreenTopScore',
  KEYBOARD: 'keyboardScreen',
  SETTINGS: 'settingsScreen',
} as const

export const createScreenInstance = (mode: ScreenMode): Screen => {
  switch (mode) {
    case SCREEN_MODE.START:
      return new ScreenStart()
    case SCREEN_MODE.KEYBOARD:
      return new ScreenKeyboard()
    case SCREEN_MODE.FAILURE:
      return new ScreenFailure()
    case SCREEN_MODE.FINISH:
      return new ScreenFinish()
    case SCREEN_MODE.INPUT_NAME:
      return new ScreenNameInput()
    case SCREEN_MODE.PAUSE:
      return new ScreenPause()
    case SCREEN_MODE.SETTINGS:
      return new ScreenSettings()
    case SCREEN_MODE.TOP_SCORE:
    default:
      return new ScreenTopScore()
  }
}

export class ScreenFactory extends Container {
  private contentArea = new Container()
  private currentScreen: Screen | null = null

  constructor() {
    super({
      zIndex: zIndexFixed.splashScreens,
    })
  }

  async preloadAssets() {}

  setup(stage: Container) {
    const contentWidth = gameConfig.appWidth - 2 * gameConfig.screenContentPadding
    const contentHeight = gameConfig.screenContentHeight
    this.contentArea.x = gameConfig.screenContentPadding
    this.contentArea.y = (gameConfig.appHeight - contentHeight) / 2
    this.visible = false

    const background = new Graphics()
    background.rect(0, 0, gameConfig.appWidth, gameConfig.appHeight).fill({
      color: 0x000000,
      alpha: 0.25,
    })
    background.roundRect(gameConfig.screenContentPadding, this.contentArea.y, contentWidth, contentHeight, 10).fill({
      color: 0x000000,
      alpha: 0.5,
    })
    this.addChild(background)

    if (gameConfig.appVersion) {
      this.addChild(
        new Text({
          text: `v ${gameConfig.appVersion}`,
          style: fontStyles.fontScreenVersion as TextStyleOptions,
          x: gameConfig.screenContentPadding + contentWidth - 5,
          y: this.contentArea.y + contentHeight - 3,
          anchor: 1,
        })
      )
    }

    if (gameConfig.isMobileDevice) {
      this.eventMode = 'static'
      this.on('pointerdown', () => {
        // fixme: пернести обработчик
        this.currentScreen?.onUserAction('Space')
      })
    }

    this.addChild(this.contentArea)
    stage.addChild(this)
  }

  show(mode: ScreenMode) {
    if (this.visible && mode === this.currentScreen?.screenId) return
    this.currentScreen?.destroy() // in case it's not destroyed yet

    this.emit(screenShowEvent)
    this.currentScreen = createScreenInstance(mode) // create Screen instance
    this.currentScreen.setup(this.contentArea)
    this.currentScreen.on(screenSingleEvent, (event: ScreenEvent) => {
      this.visible = false
      this.currentScreen?.destroy()
      this.currentScreen = null
      this.emit(screenCloseEvent)
      switch (event.type) {
        case EVENT_TYPE.SELECT_GAME_MODE:
          Sound.tap.play()
          this.emit(screenGameModeEvent, event.gameMode)
          break
        case EVENT_TYPE.UNPAUSE_GAME:
          Sound.tap.play()
          break
        case EVENT_TYPE.GO_TO_SCREEN:
          this.show(event.screenMode!)
          break
      }
    })

    this.visible = true
  }
}
