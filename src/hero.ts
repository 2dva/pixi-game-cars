import { ColorOverlayFilter } from 'pixi-filters'
import { Application, Assets, Container, Graphics, Sprite, Ticker } from 'pixi.js'
import { checkCollisionCars } from './cars'
import { APP_HEIGHT, APP_WIDTH, ROAD_LEFT_GAP, SIDEWALK_WIDTH } from './configuration'

// Hero configuration
const START_POSITION = APP_WIDTH - SIDEWALK_WIDTH - 100
const HERO_HALF_WIDTH = 30
const MOVE_LIMITS = [ROAD_LEFT_GAP + HERO_HALF_WIDTH, APP_WIDTH - SIDEWALK_WIDTH - HERO_HALF_WIDTH - 5]

type Hero = {
  container: Container | null
  sprite: Sprite | null
}

const hero: Hero = {
  container: null,
  sprite: null,
}

export async function preloadHeroAsset() {
  const heroAsset = { alias: 'hero', src: 'cars/car00.png' }
  await Assets.load(heroAsset)
}

export function addHero(app: Application) {
  const heroContainer = new Container({
    x: START_POSITION,
    y: APP_HEIGHT - 150,
  })
  app.stage.addChild(heroContainer)

  const sprite = Sprite.from('hero')
  sprite.scale.set(0.6)
  heroContainer.addChild(sprite)

  hero.container = heroContainer
  hero.sprite = sprite
  addSmoke(heroContainer)
}

let extraBrake = true
let extraBrakeStage = 0
const extraBrakeRotation = [
  0.01, 0.02, 0.03, 0.04, 0.03, 0.02, 0.01, 0, -0.01, -0.02, -0.03, -0.04, -0.03, -0.02, -0.01, 0,
]

export function moveHero(speed: number, deltaSpeed: number, delta: number, time: Ticker) {
  const car = hero.container!
  const oldX = car.x
  let newX = car.x + delta * ((speed * 12) / (speed * 10 + 200))
  newX = Math.min(MOVE_LIMITS[1], newX)
  newX = Math.max(MOVE_LIMITS[0], newX)
  
  
  // Проверяем коллизию перед применением новой позиции
  car.x = newX
  const heroBounds = heroGetBounds()
  // if (delta < 0) console.log(Math.floor(heroBounds.top), Math.floor(heroBounds.bottom))
  const hasCollision = checkCollisionCars(heroBounds)
  
  // Если есть коллизия, возвращаемся к старой позиции
  if (hasCollision) {
    car.x = oldX
  }
  
  car.rotation = delta * speed * 0.0003
  if (deltaSpeed < -3) {
    if (!extraBrake) {
      extraBrake = true
      extraBrakeStage = 0
    }
    car.rotation = extraBrakeRotation[extraBrakeStage]
    extraBrakeStage++
    if (extraBrakeStage === extraBrakeRotation.length) extraBrakeStage = 0
  }
  animateSmoke(speed, deltaSpeed, time)
}

const groups: Graphics[] = []
const smokePos: number[] = []
const baseX = 40
const baseY = 120

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

export function heroGetBounds() {
  return hero.sprite!.getBounds()
}

const crashFilter = new ColorOverlayFilter({ color: 'red', alpha: 0.2 })

export function heroSetCollision(crash: boolean) {
  hero.sprite!.filters = crash ? [crashFilter] : []
}
