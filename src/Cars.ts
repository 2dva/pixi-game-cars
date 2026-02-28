import { Assets, Container, Sprite, Ticker } from 'pixi.js'
import { type CollisionObject } from './collision'
import { gameConfig } from './configuration'
import type { State } from './state'
import type { IMajorGameContainer } from './types'
import { type BoundsLike } from './types'
import { rollDice, rollDiceBool } from './utils'

// Cars configuration
const TRAFFIC_DENSITY = 5 // 1 to n (per 1 sec for free lane)
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
    for (let i = -1; i < gameConfig.roadLaneCount; i++) {
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
      if (car.sprite.y < -STAGE_PADDING || car.sprite.y > gameConfig.appHeight + gameConfig.stagePadding) {
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
    sprite.cullable = true
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
    carSprite.x = gameConfig.roadLeftGap + gameConfig.roadLaneWidth * (n + 0.5)
    carSprite.y = speed > globalSpeed ? gameConfig.appHeight + gameConfig.stagePadding : -gameConfig.stagePadding
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
    for (let i = -1; i < gameConfig.roadLaneCount; i++) {
      // если есть свободная полоса
      if (!this.occupiedLanes[i]) {
        // бросаем кубик, и если ок, то выпускаем машину
        if (rollDiceBool(TRAFFIC_DENSITY)) {
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
