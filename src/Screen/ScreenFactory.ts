import { Container, Graphics, Text, type DestroyOptions, type TextStyleOptions } from 'pixi.js'
import { gameConfig, zIndexFixed } from '../configuration'
import fontStyles from '../fontStyles.json'
import { Sound } from '../lib/sound'
import { type GameMode, type State } from '../state'
import { EVENT_TYPE, SCREEN_MODE, screenSingleEvent, type EventType, type Screen, type ScreenMode } from './Screen'
import { ScreenFailure } from './ScreenFailure'
import { ScreenFinish } from './ScreenFinish'
import { ScreenPause } from './ScreenPause'
import { ScreenStart } from './ScreenStart'
import { ScreenTopScore } from './ScreenTopScore'

const createScreenInstance = (mode: ScreenMode): Screen => {
  switch (mode) {
    case SCREEN_MODE.START:
      return new ScreenStart()
    case SCREEN_MODE.FAILURE:
      return new ScreenFailure()
    case SCREEN_MODE.FINISH:
      return new ScreenFinish()
    case SCREEN_MODE.TOP_SCORE:
      return new ScreenTopScore()
    case SCREEN_MODE.INPUT_NAME:
      return new ScreenPause()
    case SCREEN_MODE.PAUSE:
    default:
      return new ScreenPause()
  }
}

export const screenFactoryEvent = 'screenFactoryEvent'

export class ScreenFactory extends Container {
  content: Container
  screenMode: ScreenMode | null
  contentWidth!: number
  contentHeight!: number
  currentScreen: Screen | null = null
  event: CustomEvent

  constructor() {
    super()
    this.content = new Container()
    this.zIndex = zIndexFixed.splashScreens
    this.event = new CustomEvent(screenFactoryEvent)
    this.screenMode = null
  }

  async preloadAssets() {}

  setup(stage: Container) {
    this.contentWidth = gameConfig.appWidth - 2 * gameConfig.screenContentPadding
    this.contentHeight = gameConfig.screenContentHeight
    this.content.x = gameConfig.screenContentPadding
    this.content.y = (gameConfig.appHeight - this.contentHeight) / 2

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
      this.on('pointerdown', this.onPoinerDown.bind(this)) // fixme: пернести обработчик
    }

    this.addChild(this.content)
    stage.addChild(this)
  }

  private onPoinerDown() {
    this.currentScreen?.doUserAction('Space')
  }

  show(mode: ScreenMode, state: State) {
    if (this.visible && mode === this.screenMode) return

    // create Screen instance
    this.currentScreen = createScreenInstance(mode)
    this.currentScreen.setup(this.content, state)
    this.currentScreen.on(screenSingleEvent, (type: EventType, mode?: GameMode | ScreenMode) => {
      this.currentScreen?.destroy()
      this.screenMode = null
      switch (type) {
        case EVENT_TYPE.SELECT_GAME_MODE:
        case EVENT_TYPE.UNPAUSE_GAME:
          Sound.tap.play()
          this.emitAndHide(type, mode as GameMode)
          break
        case EVENT_TYPE.GO_TO_SCREEN:
          this.show(mode as ScreenMode, state)
          break
      }
    })

    this.screenMode = mode
    this.visible = true
  }

  private emitAndHide(type: EventType, mode?: GameMode) {
    this.hide()
    this.emit(screenFactoryEvent, {
      type,
      mode,
    })
  }

  private hide() {
    this.visible = false
  }

  destroy(options?: DestroyOptions): void {
    this.removeChildren()
    super.destroy(options)
  }
}
