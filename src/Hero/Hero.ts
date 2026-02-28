import { ColorOverlayFilter } from 'pixi-filters'
import { Assets, Container, Sprite, Ticker } from 'pixi.js'
import { gameConfig } from '../configuration'
import type { State } from '../state'
import type { IMajorGameContainer } from '../types'
import { Exhaust } from './Exhaust'

// Hero configuration
const HERO_WIDTH = 60
const crashFilter = new ColorOverlayFilter({ color: 'red', alpha: 0.3 })
const claimFilter = new ColorOverlayFilter({ color: 'yellow', alpha: 0.5 })

const extraBrakeRotation = [
  0.01, 0.02, 0.03, 0.04, 0.03, 0.02, 0.01, 0, -0.01, -0.02, -0.03, -0.04, -0.03, -0.02, -0.01, 0,
]

export class Hero extends Container implements IMajorGameContainer {
  sprite!: Sprite
  exhaust: Exhaust
  extraBrake = true
  extraBrakeStage = 0
  startPositionX!: number
  startPositionY!: number
  moveLimits!: [number, number]

  constructor() {
    super()
    this.exhaust = new Exhaust()
  }

  async preloadAssets() {
    await Assets.load({ alias: 'hero', src: 'cars/car00.png' })
  }

  setup(stage: Container) {
    this.startPositionX = gameConfig.appWidth - gameConfig.roadSidewalkWidth - 80
    this.startPositionY = gameConfig.appHeight - 160
    this.moveLimits = [gameConfig.roadLeftGap, gameConfig.appWidth - gameConfig.roadSidewalkWidth - HERO_WIDTH - 5]

    const sprite = Sprite.from('hero')
    sprite.scale.set(0.6)
    this.addChild(sprite)

    this.sprite = sprite
    this.exhaust.setup(this)
    this.reset()

    stage.addChild(this)
  }

  reset() {
    this.x = this.startPositionX
    this.y = this.startPositionY
  }

  setVisible(show: boolean) {
    this.visible = show
    this.y = show ? this.startPositionY : -999
  }

  draw({ speed, deltaSpeed, deltaX, crash, claim }: State, time: Ticker) {
    const oldX = this.x
    if (!crash) {
      // Если не происходит коллизия - перемещаем машинку
      const newX = this.x + this.calculateOffset(deltaX, speed)
      this.x = Math.max(this.moveLimits[0], Math.min(this.moveLimits[1], newX))
    }

    this.showEffect({ crash, claim })

    // при повороте руля влево/вправо не делаем rotation если не было перемещения
    this.rotation = (this.x - oldX) * speed * 0.0003
    if (deltaSpeed < -3) {
      if (!this.extraBrake) {
        this.extraBrake = true
        this.extraBrakeStage = 0
      }
      // подергивание при экстренном торможении
      this.rotation = extraBrakeRotation[this.extraBrakeStage]
      this.extraBrakeStage++
      if (this.extraBrakeStage === extraBrakeRotation.length) this.extraBrakeStage = 0
    }
    this.exhaust.draw(speed, deltaSpeed, time)
  }

  getBounds() {
    return this.sprite.getBounds()
  }

  calculateOffset(delta: number, speed: number) {
    return delta * ((speed * 12) / (speed * 10 + 200))
  }

  showEffect(state: Record<string, boolean>) {
    const filters: ColorOverlayFilter[] = []
    if (state.crash) filters.push(crashFilter)
    if (state.claim) filters.push(claimFilter)
    this.sprite.filters = filters
  }
}
