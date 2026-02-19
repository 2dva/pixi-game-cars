import { ColorOverlayFilter } from 'pixi-filters'
import { Application, Assets, Container, Sprite, Ticker } from 'pixi.js'
import { APP_HEIGHT, APP_WIDTH, ROAD_LEFT_GAP, SIDEWALK_WIDTH } from '../configuration'
import type { State } from '../state'
import { Exhaust } from './Exhaust'

// Hero configuration
const START_POSITION = APP_WIDTH - SIDEWALK_WIDTH - 100
const HERO_WIDTH = 60
const MOVE_LIMITS = [ROAD_LEFT_GAP, APP_WIDTH - SIDEWALK_WIDTH - HERO_WIDTH - 5]
const crashFilter = new ColorOverlayFilter({ color: 'red', alpha: 0.3 })
const claimFilter = new ColorOverlayFilter({ color: 'yellow', alpha: 0.5 })

const extraBrakeRotation = [
  0.01, 0.02, 0.03, 0.04, 0.03, 0.02, 0.01, 0, -0.01, -0.02, -0.03, -0.04, -0.03, -0.02, -0.01, 0,
]

export class Hero {
  container!: Container
  sprite!: Sprite
  exhaust: Exhaust
  extraBrake = true
  extraBrakeStage = 0

  constructor() {
    this.exhaust = new Exhaust()
  }

  async preloadAssets() {
    await Assets.load({ alias: 'hero', src: 'cars/car00.png' })
  }

  setup(app: Application) {
    const heroContainer = new Container({
      x: START_POSITION,
      y: APP_HEIGHT - 150,
    })
    app.stage.addChild(heroContainer)

    const sprite = Sprite.from('hero')
    sprite.scale.set(0.6)
    heroContainer.addChild(sprite)

    this.container = heroContainer
    this.sprite = sprite
    this.exhaust.setup(heroContainer)
  }

  draw({ speed, deltaSpeed, deltaX, crash, claim }: State, time: Ticker) {
    const car = this.container!
    const oldX = car.x
    if (!crash) {
      // Если не происходит коллизия - перемещаем машинку
      const newX = car.x + this.calculateOffset(deltaX, speed)
      car.x = Math.max(MOVE_LIMITS[0], Math.min(MOVE_LIMITS[1], newX))
    }

    this.showEffect({ crash, claim })

    // при повороте руля влево/вправо не делаем rotation если не было перемещения
    car.rotation = (car.x - oldX) * speed * 0.0003
    if (deltaSpeed < -3) {
      if (!this.extraBrake) {
        this.extraBrake = true
        this.extraBrakeStage = 0
      }
      // подергивание при экстренном торможении
      car.rotation = extraBrakeRotation[this.extraBrakeStage]
      this.extraBrakeStage++
      if (this.extraBrakeStage === extraBrakeRotation.length) this.extraBrakeStage = 0
    }
    this.exhaust.draw(speed, deltaSpeed, time)
  }

  getBounds() {
    return this.sprite!.getBounds()
  }

  calculateOffset(delta: number, speed: number) {
    return delta * ((speed * 12) / (speed * 10 + 200))
  }

  showEffect(state: Record<string, boolean>) {
    const filters: ColorOverlayFilter[] = []
    if (state.crash) filters.push(crashFilter)
    if (state.claim) filters.push(claimFilter)
    this.sprite!.filters = filters
  }
}
