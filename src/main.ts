import { Application, Assets, Sprite, Ticker } from 'pixi.js'
import { addBackground } from './background'
import { addCars, animateCars, preloadCarAssets } from './cars'
import { Controller } from './controller'
import { addHero, moveHero, preloadHeroAsset } from './hero'
import { addHUD, calcDistance, updateHUD } from './hud'
import { addRoadMark, moveRoad as animateRoad } from './road'
import { APP_HEIGHT, APP_WIDTH, TOP_SPEED } from './configuration'

const app = new Application()

let speed = 0
let distance = 0

async function setup() {
  // Intialize the application.
  await app.init({ width: APP_WIDTH, height: APP_HEIGHT, backgroundColor: 0x545457 })

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

  addBackground(app)
  addRoadMark(app)
  addCars(app)
  addHero(app)
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
    let delta = 0
    if (rightPressed) delta = 3
    if (leftPressed) delta = -3
    let deltaSpeed = 0
    if (upPressed) deltaSpeed = 1
    if (downPressed) deltaSpeed = -1.3 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    if (spacePressed) deltaSpeed = -2.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    speed += deltaSpeed
    if (speed < 0) speed = 0
    if (speed > TOP_SPEED) speed = TOP_SPEED
    distance += calcDistance(speed)
    updateHUD(speed, distance)
    moveHero(app, speed, deltaSpeed, delta, time)
    animateCars(app, speed, time)
    animateRoad(speed)
  })
})()
