import { Application, Assets, Ticker } from 'pixi.js'
import { addBackground } from './background'
import { addCars, animateCars, preloadCarAssets } from './cars'
import { Controller } from './controller'
import { addHero, moveHero, preloadHeroAsset } from './hero'
import { addHUD, updateHUD } from './hud'
import { addRoadMark, moveRoad as animateRoad } from './road'
import { APP_HEIGHT, APP_WIDTH } from './configuration'

const app = new Application()

let speed = 0

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
  await Assets.load('asphalt.png')
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

  const controller = new Controller()

  app.ticker.add((time: Ticker) => {
    const upPressed = controller.keys.up.pressed
    const downPressed = controller.keys.down.pressed
    const rightPressed = controller.keys.right.pressed
    const leftPressed = controller.keys.left.pressed
    let delta = 0
    if (rightPressed) delta = 3
    if (leftPressed) delta = -3
    let deltaSpeed = 0
    if (upPressed) deltaSpeed = 1
    if (downPressed) deltaSpeed = -1.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
    // console.log(speed > 10 ? 1 + 1 / speed : 1);
    speed += Math.floor(deltaSpeed)
    if (speed < 0) speed = 0
    if (speed > 150) speed = 150
    updateHUD(speed)
    moveHero(app, speed, deltaSpeed, delta, time)
    animateCars(app, speed, time)
    animateRoad(speed)
  })
})()
