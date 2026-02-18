import { Application, Assets, Ticker } from 'pixi.js'
import { addCars, animateCars, checkCollisionCars, checkObstacleAhead, checkReleaseCar, preloadCarAssets } from './cars'
import { APP_BACKGROUND, APP_HEIGHT, APP_WIDTH, TOP_SPEED } from './configuration'
import { Controller } from './controller'
import { addHero, heroGetBounds, heroSetCollision, moveHero, preloadHeroAsset } from './hero'
import { addHUD, preloadHudAssets, updateHUD } from './hud/hud'
import { addRoadMark, animateTerrain, checkReleaseTerrain, preloadTerrainAssets } from './terrain/road'
import { calculateDistance, runEveryHundredMeters, runEverySecond } from './utils'

const app = new Application()

// @ts-expect-error this is for debug
globalThis.__PIXI_APP__ = app
// @ts-expect-error this is for debug
window.__PIXI_DEVTOOLS__ = { app }

let speed = 0
let distance = 0

async function setup() {
  // Intialize the application.
  await app.init({ width: APP_WIDTH, height: APP_HEIGHT, backgroundColor: APP_BACKGROUND })

  // Then adding the application's canvas to the DOM body.
  document.body.appendChild(app.canvas)
}

async function preload() {
  Assets.init({ basePath: 'assets/' })
  await preloadHudAssets()
  await preloadCarAssets()
  await preloadHeroAsset()
  await preloadTerrainAssets()
}

;(async () => {
  await setup()
  await preload()

  addRoadMark(app)
  addCars(app)
  addHero(app)
  addHUD(app, 0)

  const controller = new Controller()

  app.ticker.add((time: Ticker) => {
    const { speed, deltaSpeed, distance, deltaDistance, deltaX, score } = calculateState(controller)

    updateHUD(speed, distance, score)
    moveHero(speed, deltaSpeed, deltaX, time)
    animateCars(speed)
    animateTerrain(speed)

    runEverySecond(time, () => {
      checkReleaseCar(speed)
    })

    runEveryHundredMeters(deltaDistance, () => {
      checkReleaseTerrain(speed)
    })
  })
})()

function calculateState(controller: Controller) {
    const upPressed = controller.keys.up.pressed
    const downPressed = controller.keys.down.pressed
    const rightPressed = controller.keys.right.pressed
    const leftPressed = controller.keys.left.pressed
    const spacePressed = controller.keys.space.pressed

    // Проверяем препятствие впереди перед изменением скорости
    const heroBounds = heroGetBounds()
    const obstacleAhead = checkObstacleAhead(heroBounds)
    const crash = checkCollisionCars(heroBounds)

    heroSetCollision(crash)

    let deltaX = 0
    if (rightPressed) deltaX = 3
    if (leftPressed) deltaX = -3

    // Если препятствие впереди, не позволяем увеличивать скорость
    let deltaSpeed = 0
    if (!obstacleAhead) {
      if (upPressed) deltaSpeed = 1
      if (downPressed) deltaSpeed = -1.3 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
      if (spacePressed) deltaSpeed = -2.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    }
    speed += Math.floor(deltaSpeed)

    // Если препятствие впереди, полностью останавливаемся
    if (obstacleAhead) {
      speed = 0
    }

    // Проверка чтобы не выйти за границу скорости
    speed = Math.min(Math.max(speed, 0), TOP_SPEED)

    const deltaDistance = calculateDistance(speed)
    distance += deltaDistance

    // Пока очки считаем просто по дистанции
    const score = Math.floor(distance / 1000) * 100

    return { speed, deltaSpeed, distance, deltaDistance, deltaX, score }
}