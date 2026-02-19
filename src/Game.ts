import { Assets, Bounds, Text, Ticker, type Application } from 'pixi.js'
import { addCars, animateCars, checkCollisionCars, checkObstacleAhead, checkReleaseCar, preloadCarAssets } from './cars'
import { APP_HEIGHT, APP_WIDTH, TOP_SPEED } from './configuration'
import { Controller } from './Controller'
import { Hero } from './Hero/Hero'
import { HUD } from './HUD/HUD'
import { defaultState, type State } from './state'
import { calculateDistance, runEveryHundredMeters, runEverySecond } from './utils'
import { Terrain } from './Terrain/Terrain'

export class Game {
  private app: Application
  private state!: State
  private controller: Controller
  private hero: Hero
  private hud: HUD
  private terrain: Terrain

  constructor(app: Application) {
    this.initState()
    this.app = app
    this.controller = new Controller()
    this.terrain = new Terrain()
    this.hud = new HUD()
    this.hero = new Hero()
  }

  initState() {
    this.state = defaultState
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

    this.app.stage.addChild(textLoading)

    Assets.init({ basePath: 'assets/' })
    await this.hud.preloadAssets()
    await preloadCarAssets()
    await this.terrain.preloadAssets()
    await this.hero.preloadAssets()

    this.app.stage.removeChild(textLoading)
  }

  async setup() {
    const { app } = this

    await this.preloadAssets()

    this.terrain.setup(app)
    addCars(app)
    this.hero.setup(app)
    this.hud.setup(app)
  }

  launch() {
    this.app.ticker.add((time: Ticker) => {
      this.updateState()

      this.hud.draw(this.state)
      this.hero.draw(this.state, time)
      animateCars(this.state)
      this.terrain.draw(this.state)

      runEverySecond(time, () => {
        checkReleaseCar(this.state)
      })

      runEveryHundredMeters(this.state.deltaDistance, () => {
        this.terrain.checkObjectRelease()
      })
    })
  }

  updateState() {
    let { speed, distance, score, condition } = this.state
    const { keyUp, keyDown, keyLeft, keyRight, keySpace } = this.controller.state

    // Проверяем препятствие впереди перед изменением скорости
    const heroBounds = this.hero.getBounds()
    const obstacleAhead = checkObstacleAhead(heroBounds)

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
    const heroBoundsWithShift = new Bounds(
      heroBounds.minX + offsetX,
      heroBounds.minY,
      heroBounds.maxX + offsetX,
      heroBounds.maxY
    )
    const collision = checkCollisionCars(heroBoundsWithShift)
    const crash = !!collision
    if (collision) deltaX = deltaX * 0.6
    const deltaDistance = calculateDistance(speed)
    distance += deltaDistance

    if (collision) condition -= collision.damage
    condition = Math.max(0, condition)

    const claim = this.terrain.checkObjectIsClaimed(heroBounds)
    if (claim) score += 100
    // Пока очки считаем просто по дистанции
    // score = Math.floor(distance / 1000) * 100

    Object.assign(this.state, { speed, deltaSpeed, distance, deltaDistance, deltaX, score, condition, crash, claim })
  }
}
