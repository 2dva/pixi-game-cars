import { Container, FederatedPointerEvent, Graphics, Point, Rectangle } from 'pixi.js'
import { gameConfig } from '../configuration'
import type { DirectionKey } from '../types'

export const touchActionEventName = 'touchActionEventName'

export type DirectionObject = Record<DirectionKey, boolean>

const MOVE_TRESHOLD_X = 15
const MOVE_TRESHOLD_Y = 22
const TOUCH_AREA_SIZE = 250

export class TouchController extends Container {
  private touchStartPoint: [number, number] | null = null
  private touchStart!: Graphics

  constructor() {
    super()
  }

  setup(stage: Container) {
    Object.assign(this, {
      x: 0,
      y: gameConfig.appHeight - TOUCH_AREA_SIZE,
      width: gameConfig.appWidth,
      height: TOUCH_AREA_SIZE,
      eventMode: 'static',
      hitArea: new Rectangle(0, 0, gameConfig.appWidth, TOUCH_AREA_SIZE)
    })
    const touchStart = new Graphics()
    touchStart.circle(gameConfig.appWidth / 2, TOUCH_AREA_SIZE / 2, 60).fill({
      color: 0x000000,
      alpha: 0.25,
    })
    this.touchStart = touchStart
    this.addChild(touchStart)
    stage.addChild(this)

    this.on('pointerdown', this.touchDown, this)
    this.on('pointermove', this.touchMove, this)
    stage.on('pointerup', this.resetTouch, this)
  }

  private touchDown(e: FederatedPointerEvent) {
    const localPos = this.toLocal(e.global)
    const point = new Point(localPos.x, localPos.y)

    this.touchStartPoint = null
    if (this.touchStart.containsPoint(point)) {
      this.touchStartPoint = [localPos.x, localPos.y]
    }
  }

  private touchMove(e: FederatedPointerEvent) {
    if (!this.touchStartPoint) {
      return this.resetTouch()
    }

    const localPos = this.toLocal(e.global)
    const diffX = this.touchStartPoint[0] - localPos.x
    const diffY = this.touchStartPoint[1] - localPos.y

    let actionX: DirectionKey | null = null
    let actionY: DirectionKey | null = null

    if (Math.abs(diffX) > MOVE_TRESHOLD_X) {
      actionX = diffX > 0 ? 'left' : 'right'
    }
    if (Math.abs(diffY) > MOVE_TRESHOLD_Y) {
      actionY = diffY > 0 ? 'up' : 'down'
    }

    this.applyAction(actionX, actionY)
  }

  private resetTouch() {
    this.applyAction(null, null)
  }

  private applyAction(actionX: DirectionKey | null, actionY: DirectionKey | null) {
    const actionObject: DirectionObject = {
      up: false,
      down: false,
      left: false,
      right: false,
    }
    if (actionX) actionObject[actionX] = true
    if (actionY) actionObject[actionY] = true

    this.emit(touchActionEventName, actionObject)
  }
}
