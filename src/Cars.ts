import { Assets, Container, Sprite, Ticker } from 'pixi.js'
import { type CollisionObject } from './collision'
import { APP_HEIGHT, ROAD_LANE_COUNT, ROAD_LANE_WIDTH, ROAD_LEFT_GAP } from './configuration'
import type { State } from './state'
import type { IMajorGameContainer } from './types'
import { type BoundsLike } from './types'
import { rollBoolDice, rollDice } from './utils'

// Cars configuration
const CHANCE_TO_RELEASE_CAR = 5 // 1 is always release (per 1 sec)
const STAGE_PADDING = 120

// Create an array of asset data to load.
const carConfig = {
  car01: { alias: 'car01', src: 'cars/car01.png' },
  car02: { alias: 'car02', src: 'cars/car02.png' },
  car03: { alias: 'car03', src: 'cars/car03.png' },
}

// type CarAlias = keyof typeof carConfig
type Lane = number // -1 .. ROAD_LANE_COUNT-1
type Car = {
  lane: Lane
  active: boolean
  sprite: Sprite
  speed: number
}

let elapsedSeconds = 0.0
export function runEverySecond(elapsedMS: number, cb: () => void) {
  elapsedSeconds += elapsedMS
  if (elapsedSeconds < 1000.0) return
  elapsedSeconds -= 1000.0
  cb()
}

export class Cars extends Container implements IMajorGameContainer {
  cars: Map<number, Car> = new Map()
  occupiedLanes: Record<string, boolean> = {}

  constructor() {
    super()
  }

  async preloadAssets() {
    await Assets.load(Object.values(carConfig))
  }

  setup(stage: Container) {
    for (let i = -1; i < ROAD_LANE_COUNT; i++) {
      this.createCarOnLane(i)
    }

    stage.addChild(this)
  }

  reset() {
    for (const car of this.cars.values()) {
      this.removeCar(car)
    }
  }

  draw(state: State, time: Ticker) {
    const { speed } = state
    for (const car of this.cars.values()) {
      if (!car.active) continue
      const deltaSpeed = speed - car.speed
      car.sprite.y += deltaSpeed * 0.1
      // машинка уехала - убираем со сцены
      if (car.sprite.y < -STAGE_PADDING || car.sprite.y > APP_HEIGHT + STAGE_PADDING) {
        this.removeCar(car)
      }
    }

    runEverySecond(time.elapsedMS, () => {
      this.checkReleaseCar(state)
    })
  }

  private createRandomCarSprite() {
    const carAsset = Object.keys(carConfig)[rollDice(3)]
    const sprite = Sprite.from(carAsset)
    sprite.anchor.set(0.5)
    sprite.scale.set(0.6)
    return sprite
  }

  private createCarOnLane(n: Lane) {
    this.cars.set(n, { lane: n, active: false, sprite: new Sprite(), speed: 0 })
  }

  private addCarToLane(n: Lane, globalSpeed: number) {
    const speed = Math.floor(25 + rollDice(30)) * Math.sign(n + 0.1)
    const carSprite = this.createRandomCarSprite()
    carSprite.x = ROAD_LEFT_GAP + 50 + ROAD_LANE_WIDTH * n
    carSprite.y = speed > globalSpeed ? APP_HEIGHT + STAGE_PADDING : -STAGE_PADDING
    carSprite.rotation = n < 0 ? Math.PI : 0
    const car = this.cars.get(n)!
    car.sprite = carSprite
    car.speed = speed
    car.active = true
    this.addChild(carSprite)
  }

  private removeCar(car: Car) {
    car.active = false
    this.occupiedLanes[car.lane] = false
    this.removeChild(car.sprite)
    car.sprite.destroy()
  }

  checkReleaseCar({ speed }: State) {
    // в цикле проверяем свободные полосы
    for (let i = -1; i < ROAD_LANE_COUNT; i++) {
      // если есть свободная полоса
      if (!this.occupiedLanes[i]) {
        // бросаем кубик, и если ок, то выпускаем машину
        if (rollBoolDice(CHANCE_TO_RELEASE_CAR)) {
          this.addCarToLane(i, speed)
          this.occupiedLanes[i] = true
        }
      }
    }
  }

  getCarsBounds() {
    const bounds: Map<Lane, BoundsLike> = new Map()
    for (const [n, car] of this.cars) {
      if (!car.active) continue
      bounds.set(n, car.sprite.getBounds())
    }
    return bounds
  }

  applyCollisionOnCar(collision: CollisionObject | null) {
    if (collision === null) return

    const car = this.cars.get(collision.lane)!
    car.speed = Math.max(car.speed - collision.speedLoss, 0)
    car.sprite.x += collision.recoil[0]
    car.sprite.y += collision.recoil[1]
  }
}
