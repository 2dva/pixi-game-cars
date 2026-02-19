import { Assets, Bounds, Text, Ticker, type Application } from 'pixi.js'
import { addCars, animateCars, checkCollisionCars, checkObstacleAhead, checkReleaseCar, preloadCarAssets } from './cars'
import { APP_HEIGHT, APP_WIDTH, TOP_SPEED } from './configuration'
import { Controller } from './controller'
import { addHero, calculateHeroOffset, heroGetBounds, moveHero, preloadHeroAsset } from './hero'
import { addHUD, preloadHudAssets, updateHUD } from './hud/hud'
import {
  addRoadMark,
  animateTerrain,
  checkObjectIsClaimed,
  checkReleaseTerrain,
  preloadTerrainAssets,
} from './terrain/road'
import { calculateDistance, runEveryHundredMeters, runEverySecond, throttle } from './utils'

type State = {
  score: number
  speed: number
  distance: number
  condition: number
}

export class Game {
  app: Application
  state!: State

  constructor(app: Application) {
    this.app = app
    this.initState()
  }

  initState() {
    this.state = {
      score: 0,
      speed: 0,
      distance: 0,
      condition: 100,
    }
  }

  async preloadAssets() {
    Assets.init({ basePath: 'assets/' })
    await preloadHudAssets()
    await preloadCarAssets()
    await preloadHeroAsset()
    await preloadTerrainAssets()
  }

  async setup() {
    const { app, preloadAssets } = this

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
    app.stage.addChild(textLoading)

    await preloadAssets()

    app.stage.removeChild(textLoading)

    addRoadMark(app)
    addCars(app)
    addHero(app)
    addHUD(app, 0)
  }

  launch() {
    const controller = new Controller()

    const updateHUDThrottled = throttle(updateHUD, 200)

    this.app.ticker.add((time: Ticker) => {
      const { speed, deltaSpeed, distance, deltaDistance, deltaX, score, condition, crash, claim } =
        this.calculateState(controller)

      updateHUDThrottled(speed, distance, score, condition)
      moveHero(speed, deltaSpeed, deltaX, crash, !!claim, time)
      animateCars(speed)
      animateTerrain(speed)

      runEverySecond(time, () => {
        checkReleaseCar(speed)
      })

      runEveryHundredMeters(deltaDistance, () => {
        checkReleaseTerrain()
      })
    })
  }

  calculateState(controller: Controller) {
    let { speed, distance, score, condition } = this.state

    const upPressed = controller.keys.up.pressed
    const downPressed = controller.keys.down.pressed
    const rightPressed = controller.keys.right.pressed
    const leftPressed = controller.keys.left.pressed
    const spacePressed = controller.keys.space.pressed

    // Проверяем препятствие впереди перед изменением скорости
    const heroBounds = heroGetBounds()
    const obstacleAhead = checkObstacleAhead(heroBounds)

    let deltaX = 0
    if (rightPressed) deltaX = 3
    if (leftPressed) deltaX = -3

    // Если препятствие впереди, не позволяем увеличивать скорость
    let deltaSpeed = 0
    if (!obstacleAhead && upPressed) deltaSpeed = 1
    if (downPressed) deltaSpeed = -1.3 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    if (spacePressed) deltaSpeed = -2.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    speed += Math.floor(deltaSpeed)

    // Если препятствие впереди, полностью останавливаемся
    if (obstacleAhead) {
      speed -= 15
    }

    // Проверка чтобы не выйти за границу скорости
    speed = Math.min(Math.max(speed, 0), TOP_SPEED)

    const offsetX = calculateHeroOffset(deltaX, speed)
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

    const claim = checkObjectIsClaimed(heroBounds)
    if (claim) score += 100
    // Пока очки считаем просто по дистанции
    // score = Math.floor(distance / 1000) * 100

    Object.assign(this.state, { speed, distance, score, condition })

    return { speed, deltaSpeed, distance, deltaDistance, deltaX, score, condition, crash, claim }
  }
}
