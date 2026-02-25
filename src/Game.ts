import { Assets, Container, Text, Ticker, type Application } from 'pixi.js'
import { Cars } from './Cars'
import { APP_HEIGHT, APP_WIDTH } from './configuration'
import { Controller } from './Controller'
import fontStyles from './fontStyles.json'
import { Hero } from './Hero/Hero'
import { HUD } from './HUD/HUD'
import { EVENT_TYPE, InfoScreen, SCREEN_MODE, screenEventName, type ScreenEvent } from './InfoScreen'
import { calculateNextMove } from './physics'
import { defaultState, GAME_MODE, GAME_MODE_REASON, type GameMode, type GameModeReason, type State } from './state'
import { Terrain } from './Terrain/Terrain'
import type { BoundsLike } from './types'
import { throttle } from './utils'

export class Game {
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
  private onResizeThrottled = throttle(this.onResize.bind(this), 300)

  constructor(app: Application) {
    this.initState()
    this.rootContainer = app.canvas.parentElement!
    this.stage = app.stage
    this.ticker = app.ticker
    this.infoScreen = new InfoScreen()
    this.controller = new Controller()
    this.terrain = new Terrain(app.renderer)
    this.hud = new HUD()
    this.cars = new Cars()
    this.hero = new Hero()
  }

  private initState() {
    this.state = Object.assign({}, defaultState)
  }

  async preloadAssets() {
    const textLoading = new Text({
      text: 'Loading...',
      style: fontStyles.fontGameLoading,
      x: APP_WIDTH / 2,
      y: APP_HEIGHT / 2,
    })
    textLoading.anchor.set(0.5, 0.5)

    this.stage.addChild(textLoading)

    Assets.init({ basePath: 'assets/' })
    await this.hud.preloadAssets()
    await this.cars.preloadAssets()
    await this.terrain.preloadAssets()
    await this.hero.preloadAssets()

    this.stage.removeChild(textLoading)
  }

  async setup() {
    const { stage } = this

    await this.preloadAssets()

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

    window.addEventListener('resize', this.onResizeThrottled)
    this.onResize()
  }

  private onResize(): void {
    let ratio = 1
    const { offsetWidth , offsetHeight } = this.rootContainer
    if (offsetWidth < APP_WIDTH) {
      ratio = Math.round(Math.max(offsetWidth / APP_WIDTH, 0.4) * 100) / 100
    } else if (offsetHeight < APP_HEIGHT) {
      ratio = Math.round(Math.max(offsetHeight / APP_HEIGHT, 0.4) * 100) / 100
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
    const claimed = this.terrain.checkObjectIsClaimed(heroBounds)

    Object.assign(this.state, {
      score: this.state.score + claimed,
      claim: claimed > 0,
    })
  }

  private updateOnTick(time: Ticker) {
    if (this.state.paused) return
    if (this.handleHotkeys()) return

    this.hud.draw(this.state)
    this.hero.draw(this.state, time)
    this.cars.draw(this.state, time)
    this.terrain.draw(this.state)

    const heroBounds = this.hero.getBounds()
    const carBounds = this.cars.getCarsBounds()
    const collision = calculateNextMove(this.state, this.controller.state, heroBounds, carBounds)

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
  }
}
