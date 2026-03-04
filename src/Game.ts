import { Assets, Container, Rectangle, Text, Ticker, type Application } from 'pixi.js'
import { Cars } from './Cars/Cars'
import { gameConfig } from './configuration'
import { Controller } from './Controller/Controller'
import fontStyles from './fontStyles.json'
import { Hero } from './Hero/Hero'
import { HUD } from './HUD/HUD'
import { loadTranslations, setMobileVersion } from './lib/i18n'
import { calculateNextMove } from './lib/physics'
import { Sound } from './lib/sound'
import { SCREEN_MODE, type ScreenMode } from './Screen/Screen'
import { screenCloseEvent, ScreenFactory, screenGameModeEvent, screenShowEvent } from './Screen/ScreenFactory'
import { defaultState, GAME_MODE, GAME_MODE_REASON, type GameMode, type GameModeReason, type State } from './state'
import { Terrain } from './Terrain/Terrain'
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
  private screenFactory: ScreenFactory
  private runEverySegment: RunEverySegment
  private onResizeThrottled = throttle(this.onResize.bind(this), 300)

  constructor(app: Application) {
    this.initState()
    this.app = app
    this.rootContainer = app.canvas.parentElement!
    this.stage = app.stage
    this.ticker = app.ticker
    this.screenFactory = new ScreenFactory()
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
    this.terrain.setup(stage)
    this.cars.setup(stage)
    this.hero.setup(stage)
    this.hud.setup(stage)
    this.screenFactory.setup(stage)
    this.screenFactory.on(screenGameModeEvent, this.switchMode, this)
    this.screenFactory.on(screenShowEvent, () => {
      this.controller.disabled = true
    })
    this.screenFactory.on(screenCloseEvent, () => {
      this.controller.reset()
      this.controller.disabled = false
      this.state.paused = false
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

  showScreen(mode: ScreenMode) {
    this.screenFactory.show(mode, this.state)
  }

  switchMode(mode: GameMode, modeReason: GameModeReason = GAME_MODE_REASON.NO_REASON) {
    this.controller.reset()

    if (mode === GAME_MODE.GAME_OVER) {
      this.state.mode = mode
      this.state.modeReason = modeReason
      this.showScreen(modeReason === GAME_MODE_REASON.END_TIME_IS_UP ? SCREEN_MODE.FINISH : SCREEN_MODE.FAILURE)
      this.state.speed = 0
      return
    }

    const isDemo = mode === GAME_MODE.DEMO

    if (isDemo) {
      this.showScreen(SCREEN_MODE.START)
    }

    this.initState()
    this.state.mode = mode
    this.state.speed = isDemo ? 15 : 0

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
      this.showScreen(SCREEN_MODE.PAUSE)
      stopCurrentUpdate = true
    }
    return stopCurrentUpdate
  }

  private handleClaimable(heroBounds: BoundsLike) {
    let claimed = this.terrain.checkObjectIsClaimed(heroBounds)

    if (claimed) Sound.pickCoin.play()

    if (this.state.mode !== GAME_MODE.DEMO) {
      this.runEverySegment(this.state.deltaDistance, () => {
        claimed += 10 // 10 очков за каждые 100 метров дороги
      })
    }

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

    if (collision && !Sound.carHit.playing() && !Sound.hitHard.playing()) {
      if (collision.force > 3) {
        Sound.hitHard.play()
      } else {
        Sound.carHit.play()
      }
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
        Sound.finish.play()
        this.switchMode(GAME_MODE.GAME_OVER, GAME_MODE_REASON.END_TIME_IS_UP)
      } else if (health === 0) {
        Sound.failed.play()
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
