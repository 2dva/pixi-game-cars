import { Application, Assets, Container, Graphics, Sprite, Ticker } from 'pixi.js'
import { APP_HEIGHT, APP_WIDTH, ROAD_LEFT_GAP, SIDEWALK_WIDTH } from './configuration'

// Hero configuration
const START_POSITION = APP_WIDTH - SIDEWALK_WIDTH
const HERO_HALF_WIDTH = 40
const MOVE_LIMITS = [ROAD_LEFT_GAP + HERO_HALF_WIDTH, APP_WIDTH - SIDEWALK_WIDTH - HERO_HALF_WIDTH]

let hero: Container | null = null

export async function preloadHeroAsset() {
  const heroAsset = { alias: 'hero', src: 'cars/car00.png' }
  await Assets.load(heroAsset)
}

export function addHero(app: Application) {
  const carContainer = new Container()
  carContainer.x = START_POSITION
  carContainer.y = APP_HEIGHT - 100
  app.stage.addChild(carContainer)
  const car = Sprite.from('hero')
  car.anchor.set(0.5)
  car.scale.set(0.6)
  carContainer.addChild(car)
  hero = carContainer
  addSmoke(carContainer)
  
}

let extraBrake = true
let extraBrakeStage = 0
const extraBrakeRotation = [
  0.01, 0.02, 0.03, 0.04, 0.03, 0.02, 0.01, 0, -0.01, -0.02, -0.03, -0.04, -0.03, -0.02, -0.01, 0,
]

export function moveHero(speed: number, deltaSpeed: number, delta: number, time: Ticker) {
  const car = hero!
  let newX = car.x + delta * (speed*12/(speed*10  + 200))
  newX = Math.min(MOVE_LIMITS[1], newX)
  newX = Math.max(MOVE_LIMITS[0], newX)
  car.x = newX
  car.rotation = delta * speed * 0.0003
  if (deltaSpeed < -3) {
    if (!extraBrake) {
      extraBrake = true
      extraBrakeStage = 0
    }
    car.rotation = extraBrakeRotation[extraBrakeStage]
    extraBrakeStage++
    if (extraBrakeStage === extraBrakeRotation.length ) extraBrakeStage = 0
  }
  animateSmoke(speed, deltaSpeed, time)
}

const groups: Graphics[] = []
const baseX = 10
const baseY = 60
const smokePos: number[] = []

function addSmoke(container: Container) {
  const groupCount = 3
  const particleCount = 4

  for (let i = 0; i < groupCount; i++) {
    const smokeGroup = new Graphics()

    for (let i = 0; i < particleCount; i++) {
      const radius = 20 + Math.random() * 8
      const x = (Math.random() * 2 - 1) * 10
      const y = (Math.random() * 2 - 1) * 10

      smokeGroup.circle(x, y, radius)
    }

    smokeGroup.fill({ color: 0xc9c9c9, alpha: 0.5 })

    smokeGroup.x = baseX
    smokeGroup.y = baseY
    smokePos[i] = i * (1 / groupCount)
    groups.push(smokeGroup)
    container.addChild(smokeGroup)
  }
}

function animateSmoke(speed: number, deltaSpeed: number, time: Ticker) {
  const dt = time.deltaTime * 0.02
  const visible = deltaSpeed > 0

  groups.forEach((group, i) => {
    group.visible = speed > 0
    group.alpha = visible ? 0.5 : 0.06
    smokePos[i] = (smokePos[i] + dt) % 1
    group.x = baseX - Math.pow(smokePos[i], 2) * 4
    group.y = baseY + smokePos[i] * 80
    group.scale.set(Math.pow(smokePos[i], 0.75))
  })
}