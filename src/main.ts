import { Application, Assets, Sprite, Ticker } from 'pixi.js'
import { addCars, animateCars, checkCollisionCars, checkObstacleAhead, preloadCarAssets } from './cars'
import { APP_BACKGROUND, APP_HEIGHT, APP_WIDTH, TOP_SPEED } from './configuration'
import { Controller } from './controller'
import { addHero, heroGetBounds, heroSetCollision, moveHero, preloadHeroAsset } from './hero'
import { addHUD, addScore, calcDistance, updateHUD, updateScore } from './hud/hud'
import { addRoadMark, moveRoad as animateRoad } from './terrain/road'

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
  await Assets.load('fonts/Segment7Standard.otf')
  await Assets.load('fonts/alarm_clock.ttf')
  await Assets.load('logo.png')
  await preloadCarAssets()
  await preloadHeroAsset()
}

;(async () => {
  await setup()
  await preload()

  addRoadMark(app)
  addCars(app)
  addHero(app)
  addScore(app)
  addHUD(app, 0)

  const logo = Sprite.from('logo.png')
  logo.x = 12
  logo.y = APP_HEIGHT - 50
  logo.width = 200
  logo.scale.y = logo.scale.x
  logo.alpha = 0.55
  app.stage.addChild(logo)

  const controller = new Controller()

  app.ticker.add((time: Ticker) => {
    const upPressed = controller.keys.up.pressed
    const downPressed = controller.keys.down.pressed
    const rightPressed = controller.keys.right.pressed
    const leftPressed = controller.keys.left.pressed
    const spacePressed = controller.keys.space.pressed
    // Проверяем препятствие впереди перед изменением скорости
    const heroBounds = heroGetBounds()
    const obstacleAhead = checkObstacleAhead(heroBounds)
    
    let delta = 0
    if (rightPressed) delta = 3
    if (leftPressed) delta = -3
    let deltaSpeed = 0
    
    // Если препятствие впереди, не позволяем увеличивать скорость
    if (!obstacleAhead) {
      if (upPressed) deltaSpeed = 1
      if (downPressed) deltaSpeed = -1.3 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
      if (spacePressed) deltaSpeed = -2.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    } else {
      // Если препятствие впереди, только тормозим
      if (downPressed) deltaSpeed = -1.3 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
      if (spacePressed) deltaSpeed = -2.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    }
    
    speed += deltaSpeed
    if (speed < 0) speed = 0
    if (speed > TOP_SPEED) speed = TOP_SPEED
    
    // Если препятствие впереди, полностью останавливаемся
    if (obstacleAhead) {
      speed = 0
    }
    
    distance += calcDistance(speed)
    updateHUD(speed, distance)
    updateScore(Math.floor(distance / 10000) * 100)
    moveHero(speed, deltaSpeed, delta, time)
    animateCars(speed)
    animateRoad(speed)

    const crash = checkCollisionCars(heroBounds)
    heroSetCollision(crash)
    
    // Если есть столкновение, сбрасываем скорость
    if (crash) {
      speed *= 0.8 // Уменьшаем скорость на 20%
      if (speed < 0.1) speed = 0
    }
  })
})()
