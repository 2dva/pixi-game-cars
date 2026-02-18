import { Application, Assets, Bounds, Container, Sprite } from 'pixi.js'
import { APP_HEIGHT, ROAD_LANE_COUNT, ROAD_LANE_WIDTH, ROAD_LEFT_GAP } from './configuration'
import { rollBoolDice, rollDice } from './utils'

// Cars configuration
const CHANCE_TO_RELEASE_CAR = 5 // 1 is always release / per 1 sec
const STAGE_PADDING = 120

type CarAlias = 'car01' | 'car02' | 'car03'

type CarData = {
  alias: CarAlias
  src: string
}

type CarConfig = {
  [k in CarAlias]: CarData
}

// Create an array of asset data to load.
const carConfig: CarConfig = {
  car01: { alias: 'car01', src: 'cars/car01.png' },
  car02: { alias: 'car02', src: 'cars/car02.png' },
  car03: { alias: 'car03', src: 'cars/car03.png' },
}

type Car = {
  sprite: Sprite
  lane: number
  speed: number
}

let carContainer: Container | null = null
const cars: Set<Car> = new Set()
const occupiedLanes: Record<string, boolean> = {}

export async function preloadCarAssets() {
  await Assets.load(Object.values(carConfig))
}

function createRandomCarSprite() {
  const carAsset = Object.keys(carConfig)[rollDice(3)]
  const sprite = Sprite.from(carAsset)
  sprite.anchor.set(0.5)
  sprite.scale.set(0.6)
  return sprite
}

function addCarToLane(n: number, globalSpeed: number) {
  const speed = Math.floor(25 + rollDice(30))
  const carSprite = createRandomCarSprite()
  carSprite.x = ROAD_LEFT_GAP + 50 + ROAD_LANE_WIDTH * n
  carSprite.y = speed > globalSpeed ? APP_HEIGHT + STAGE_PADDING : -STAGE_PADDING
  cars.add({ sprite: carSprite, lane: n, speed })
  carContainer!.addChild(carSprite)
}

function removeCar(car: Car) {
  cars.delete(car)
  occupiedLanes[car.lane] = false
  carContainer!.removeChild(car.sprite)
  car.sprite.destroy()
}

export function addCars(app: Application) {
  // Create a container to hold all the car sprites.
  carContainer = new Container()
  // Add the car container to the stage.
  app.stage.addChild(carContainer)
}

export function animateCars(speed: number) {
  cars.forEach((car) => {
    const deltaSpeed = speed - car.speed
    car.sprite.y += deltaSpeed * 0.1
    // машинка уехала - убираем со сцены
    if (car.sprite.y < -STAGE_PADDING || car.sprite.y > APP_HEIGHT + STAGE_PADDING) {
      removeCar(car)
    }
  })
}

export function checkReleaseCar(speed: number) {
  // в цикле проверяем свободные полосы
  for (let i = 0; i < ROAD_LANE_COUNT; i++) {
    // если есть свободная полоса
    if (!occupiedLanes[i]) {
      // бросаем кубик, и если ок, то выпускаем машину
      if (rollBoolDice(CHANCE_TO_RELEASE_CAR)) {
        addCarToLane(i, speed)
        occupiedLanes[i] = true
      }
    }
  }
}

function checkCollisionOneCar(a: Bounds, b: Bounds) {
  const rightmostLeft = a.left < b.left ? b.left : a.left
  const leftmostRight = a.right > b.right ? b.right : a.right

  if (leftmostRight <= rightmostLeft) {
    return false
  }

  const bottommostTop = a.top < b.top ? b.top : a.top
  const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom

  return topmostBottom > bottommostTop
}

export function checkCollisionCars(heroBounds: Bounds) {
  for (const { sprite } of cars) {
    const carBounds = sprite.getBounds()
    if (checkCollisionOneCar(heroBounds, carBounds)) {
      return true
    }
  }
  return false
}

export function checkObstacleAhead(heroBounds: Bounds): boolean {
  // Проверяем, есть ли препятствие впереди (справа от героя)
  const heroLeft = heroBounds.left
  const heroRight = heroBounds.right
  const heroTop = heroBounds.top

  for (const { sprite } of cars) {
    const carBounds = sprite.getBounds()
    // Проверяем, находится ли машина впереди (справа) и на той же высоте
    if (
      carBounds.right >= heroLeft &&
      carBounds.left <= heroRight &&
      carBounds.bottom >= heroTop &&
      carBounds.top < heroTop
    ) {
      return true
    }
  }
  return false
}
