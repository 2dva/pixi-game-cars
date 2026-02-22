import { Assets, Container, Text, Ticker, type Application } from 'pixi.js'
import { Cars } from './_cars'
import { APP_HEIGHT, APP_WIDTH, TOP_SPEED } from './configuration'
import { Controller } from './_controller'
import { Hero } from './_Hero/Hero'
import { HUD } from './_HUD/_hud'
import { EVENT_TYPE, InfoScreen, SCREEN_MODE, screenEventName, type ScreenEvent } from './InfoScreen'
import { defaultState, GAME_MODE, GAME_MODE_REASON, type GameMode, type GameModeReason, type State } from './state'
import { Terrain } from './_Terrain/_terrain'
import { calculateDistance } from './utils'

export class Game {
  private stage: Container
  private ticker: Ticker
  private state!: State
  private controller: Controller
  private hero: Hero
  private cars: Cars
  private hud: HUD
  private terrain: Terrain
  private infoScreen: InfoScreen

  constructor(app: Application) {
    this.initState()
    this.stage = app.stage
    this.ticker = app.ticker
    this.infoScreen = new InfoScreen()
    this.controller = new Controller()
    this.terrain = new Terrain(app.renderer)
    this.hud = new HUD()
    this.cars = new Cars()
    this.hero = new Hero()
  }

  initState() {
    this.state = Object.assign({}, defaultState)
  }

  async preloadAssets() {
    const textLoading = new Text({
      text: 'Loading...',
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: '#ffffff',
      },
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
      if (event.type === EVENT_TYPE.SELECT_GAME_MODE) this.switchMode(event.mode)
    })
  }

  launch() {
    this.switchMode(GAME_MODE.DEMO)

    this.ticker.add((time: Ticker) => {
      this.updateState(time)

      this.hud.draw(this.state)
      this.hero.draw(this.state, time)
      this.cars.draw(this.state, time)
      this.terrain.draw(this.state)
    })
  }

  /**
   * GAME_MODES.DEMO: hide hero, speed = 15, block controls
   * GAME_MODES.FREE_RIDE: endless life
   * GAME_MODES.CLASSIC: can die if health drops to zero
   */
  switchMode(mode: GameMode, modeReason: GameModeReason = GAME_MODE_REASON.NO_REASON) {
    if (mode === GAME_MODE.GAME_OVER) {
      this.state.mode = mode
      this.state.modeReason = modeReason
      this.infoScreen.show(SCREEN_MODE.END, this.state)
      this.state.speed = 0
      this.controller.disabled = true
      return
    }

    if (mode === GAME_MODE.DEMO) {
      this.infoScreen.show(SCREEN_MODE.START, this.state)
    }

    const isDemo = mode === GAME_MODE.DEMO

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

  private updateState(time: Ticker) {
    let { speed, distance, score, health, timeLeft } = this.state
    const { keyUp, keyDown, keyLeft, keyRight, keySpace, m } = this.controller.state

    // Проверяем препятствие впереди перед изменением скорости
    const heroBounds = this.hero.getBounds()
    const obstacleAhead = this.cars.checkCarsAheadHero(heroBounds)

    let deltaX = 0
    if (keyRight) deltaX = 3
    if (keyLeft) deltaX = -3

    // Если препятствие впереди, не позволяем увеличивать скорость
    let deltaSpeed = 0
    if (!obstacleAhead && keyUp) deltaSpeed = 1
    if (keyDown) deltaSpeed = -1.3 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    if (keySpace) deltaSpeed = -2.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    speed += Math.floor(deltaSpeed)

    // Если препятствие впереди, полностью останавливаемся
    if (obstacleAhead) {
      speed -= 15
    }

    // Проверка чтобы не выйти за границу скорости
    speed = Math.min(Math.max(speed, 0), TOP_SPEED)

    const offsetX = this.hero.calculateOffset(deltaX, speed)

    const heroBoundsWithShift = {
      left: heroBounds.left + offsetX,
      right: heroBounds.right + offsetX,
      top: heroBounds.top,
      bottom: heroBounds.bottom,
    }
    const collision = this.cars.checkCollisionCars(heroBoundsWithShift)
    let crash = !!collision
    if (collision) deltaX = deltaX * 0.6
    const deltaDistance = calculateDistance(speed)
    distance += deltaDistance

    if (this.state.mode === GAME_MODE.GAME_OVER) {
      crash = health === 0
      speed = 0
      deltaSpeed = 0
    }

    if (this.state.mode === GAME_MODE.COLLECT_IN_TIME) {
      if (collision) health -= collision.damage
      health = Math.max(0, health)
      timeLeft -= time.elapsedMS / 1000

      if (timeLeft <= 0.0) {
        this.switchMode(GAME_MODE.GAME_OVER, GAME_MODE_REASON.END_TIME_IS_UP)
      } else if (health === 0) {
        this.switchMode(GAME_MODE.GAME_OVER, GAME_MODE_REASON.END_CRASHED)
      }
    }

    if (m) {
      this.switchMode(GAME_MODE.DEMO, GAME_MODE_REASON.END_MANUAL)
      return
    }

    const claim = this.terrain.checkObjectIsClaimed(heroBounds)
    if (claim) score += 100

    Object.assign(this.state, {
      speed,
      deltaSpeed,
      distance,
      deltaDistance,
      deltaX,
      score,
      health,
      timeLeft,
      crash,
      claim,
    })
  }
}
