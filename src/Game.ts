import { Assets, Container, Rectangle, Text, Ticker, type Application } from 'pixi.js'
import { Cars } from './Cars'
import { gameConfig } from './configuration'
import { Controller } from './Controller/Controller'
import fontStyles from './fontStyles.json'
import { Hero } from './Hero/Hero'
import { HUD } from './HUD/HUD'
import { loadTranslations, setMobileVersion } from './i18n'
import { EVENT_TYPE, InfoScreen, SCREEN_MODE, screenEventName, type ScreenEvent } from './InfoScreen'
import { calculateNextMove } from './physics'
import { Sound } from './sound'
import { defaultState, GAME_MODE, GAME_MODE_REASON, type GameMode, type GameModeReason, type State } from './state'
import { Terrain } from './Terrain/Terrain'
import { saveMyScore } from './topScore'
import type { BoundsLike } from './types'
import { throttle, useRunEverySegment, type RunEverySegment } from './utils'

export class Game {
  private app: Application
  private stage: Container
  private ticker: Ticker
  private rootContainer: HTMLElement
  private state!: State
  private controller: Controller
  private hero: Hero
  private cars: Cars
  private hud: HUD
  private terrain: Terrain
  private infoScreen: InfoScreen
  private runEverySegment: RunEverySegment
  private onResizeThrottled = throttle(this.onResize.bind(this), 300)

  constructor(app: Application) {
    this.initState()
    this.app = app
    this.rootContainer = app.canvas.parentElement!
    this.stage = app.stage
    this.ticker = app.ticker
    this.infoScreen = new InfoScreen()
    this.controller = new Controller()
    this.terrain = new Terrain(app.renderer)
    this.hud = new HUD()
    this.cars = new Cars()
    this.hero = new Hero()
    this.runEverySegment = useRunEverySegment(100)

    setMobileVersion(gameConfig.isMobileDevice)
    app.renderer.addListener('resize', this.onResizeThrottled)
  }

  private initState() {
    this.state = Object.assign({}, defaultState)
  }

  async preloadAssets() {
    const textLoading = new Text({
      text: 'Loading...',
      style: fontStyles.fontGameLoading,
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2,
      anchor: 0.5,
    })

    this.stage.addChild(textLoading)

    await loadTranslations()

    Assets.init({ basePath: 'assets/' })
    await this.hud.preloadAssets()
    await this.cars.preloadAssets()
    await this.terrain.preloadAssets()
    await this.hero.preloadAssets()

    this.stage.removeChild(textLoading)
  }

  async setup() {
    const { stage } = this
    stage.eventMode = 'static'
    stage.hitArea = new Rectangle(0, 0, gameConfig.appWidth, gameConfig.appHeight)

    await this.preloadAssets()

    this.controller.setup(stage)
    this.infoScreen.setup(stage)
    this.terrain.setup(stage)
    this.cars.setup(stage)
    this.hero.setup(stage)
    this.hud.setup(stage)

    this.infoScreen.on(screenEventName, (event: ScreenEvent) => {
      this.controller.reset()
      if (event.type === EVENT_TYPE.SELECT_GAME_MODE) this.switchMode(event.mode!)
      else if (event.type === EVENT_TYPE.UNPAUSE_GAME) this.state.paused = false
    })

    this.onResize()
  }

  private onResize(): void {
    let ratio = 1
    const { offsetWidth, offsetHeight } = this.rootContainer
    if (offsetWidth < gameConfig.appWidth) {
      ratio = Math.round(Math.max(offsetWidth / gameConfig.appWidth, 0.4) * 100) / 100
    } else if (offsetHeight < gameConfig.appHeight) {
      ratio = Math.round(Math.max(offsetHeight / gameConfig.appHeight, 0.4) * 100) / 100
    }
    this.stage.scale.y = this.stage.scale.x = ratio
  }

  launch() {
    this.switchMode(GAME_MODE.DEMO)

    this.ticker.add(this.updateOnTick, this)
  }

  switchMode(mode: GameMode, modeReason: GameModeReason = GAME_MODE_REASON.NO_REASON) {
    if (mode === GAME_MODE.GAME_OVER) {
      this.state.mode = mode
      this.state.modeReason = modeReason
      if (modeReason === GAME_MODE_REASON.END_TIME_IS_UP) {
        saveMyScore('User', this.state.score)
      }
      this.infoScreen.show(
        modeReason === GAME_MODE_REASON.END_TIME_IS_UP ? SCREEN_MODE.FINISH : SCREEN_MODE.FAILURE,
        this.state
      )
      this.state.speed = 0
      this.controller.disabled = true
      return
    }

    const isDemo = mode === GAME_MODE.DEMO

    if (isDemo) {
      this.infoScreen.show(SCREEN_MODE.START, this.state)
    }

    this.initState()
    this.state.mode = mode
    this.state.speed = isDemo ? 15 : 0
    this.controller.disabled = isDemo

    this.terrain.reset()
    this.cars.reset()
    this.hero.reset()
    this.hud.reset()

    this.hero.setVisible(!isDemo)
  }

  private handleHotkeys() {
    let stopCurrentUpdate = false
    const { keyOther } = this.controller.state
    if (keyOther === 'KeyM') {
      this.switchMode(GAME_MODE.DEMO, GAME_MODE_REASON.END_MANUAL)
      stopCurrentUpdate = true
    }

    if (keyOther === 'KeyP') {
      this.state.paused = true
      this.infoScreen.show(SCREEN_MODE.PAUSE, this.state)
      stopCurrentUpdate = true
    }
    return stopCurrentUpdate
  }

  private handleClaimable(heroBounds: BoundsLike) {
    let claimed = this.terrain.checkObjectIsClaimed(heroBounds)

    if (claimed) Sound.pickCoin.play()

    this.runEverySegment(this.state.deltaDistance, () => {
      claimed += 10 // 10 очков за каждые 100 метров дороги
    })

    Object.assign(this.state, {
      score: this.state.score + claimed,
      claim: claimed >= 100,
    })
  }

  private updateOnTick(time: Ticker) {
    if (this.state.paused) return
    if (this.handleHotkeys()) return

    const heroBounds = this.hero.getBounds()
    const carBounds = this.cars.getCarsBounds()
    const collision = calculateNextMove(this.state, this.controller.state, heroBounds, carBounds)

    if (collision && !Sound.carHit.playing()) {
      Sound.carHit.play()
    }

    // apply collision effect on cars
    this.cars.applyCollisionOnCar(collision)

    let { health, timeLeft } = this.state
    if (this.state.mode === GAME_MODE.GAME_OVER) {
      Object.assign(this.state, {
        speed: 0,
        deltaSpeed: 0,
        crash: health === 0,
      })
    }

    if (this.state.mode === GAME_MODE.COLLECT_IN_TIME) {
      if (collision) health -= collision.damage
      health = Math.max(0, health)
      timeLeft -= time.elapsedMS / 1000
      Object.assign(this.state, {
        health,
        timeLeft,
      })

      if (timeLeft <= 0.0) {
        this.switchMode(GAME_MODE.GAME_OVER, GAME_MODE_REASON.END_TIME_IS_UP)
      } else if (health === 0) {
        this.switchMode(GAME_MODE.GAME_OVER, GAME_MODE_REASON.END_CRASHED)
      }
    }

    this.handleClaimable(heroBounds)

    this.hud.draw(this.state)
    this.hero.draw(this.state, time)
    this.cars.draw(this.state, time)
    this.terrain.draw(this.state)
  }
}
