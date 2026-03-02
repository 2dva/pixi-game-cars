import { Container, Graphics, Point, Rectangle, type FederatedPointerEvent } from 'pixi.js'
import { gameConfig } from './configuration'

const MOVE_TRESHOLD_X = 15
const MOVE_TRESHOLD_Y = 22
const TOUCH_AREA_SIZE = 250

// Action keys type
type ActionKey = 'up' | 'left' | 'down' | 'right' | 'space' | 'other'

// Key state interface
interface KeyState {
  pressed: boolean
}

// Controller keys type
type ControllerKeys = Record<ActionKey, KeyState>

// Key map type
type KeyMap = Record<string, ActionKey>

// Map keyboard key codes to controller's state keys
const keyMap: KeyMap = {
  Space: 'space',
  KeyW: 'up',
  ArrowUp: 'up',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyD: 'right',
  ArrowRight: 'right',
}

const defaultState: ControllerKeys = {
  up: { pressed: false },
  left: { pressed: false },
  down: { pressed: false },
  right: { pressed: false },
  space: { pressed: false },
  other: { pressed: false },
}

type KeyName = 'keyUp' | 'keyDown' | 'keyRight' | 'keyLeft' | 'keySpace' | 'keyOther'

export type ControllerState = {
  [keyName in KeyName]: boolean | string
}

// Class for handling keyboard inputs.
export class Controller {
  private keys: ControllerKeys
  private lastCode = ''
  private touchStartPoint: [number, number] | null = null
  private touchArea!: Container
  private touchStart!: Graphics
  disabled = false

  constructor() {
    // The controller's state.
    this.keys = structuredClone(defaultState)
  }

  setup(stage: Container) {
    // Register event listeners for keydown and keyup events.
    window.addEventListener('keydown', (event) => this.keydownHandler(event))
    window.addEventListener('keyup', (event) => this.keyupHandler(event))

    if (gameConfig.isTouchDevice) {
      this.setupMobile(stage)
    }
  }

  private setupMobile(stage: Container) {
      this.touchArea = new Container({
        x: (gameConfig.appWidth - TOUCH_AREA_SIZE) / 2,
        y: gameConfig.appHeight - TOUCH_AREA_SIZE,
        width: TOUCH_AREA_SIZE,
        height: TOUCH_AREA_SIZE,
      })
      this.touchArea.eventMode = 'static'
      this.touchArea.hitArea = new Rectangle(0, 0, TOUCH_AREA_SIZE, TOUCH_AREA_SIZE)
      const roundPlace = new Graphics()
      roundPlace.circle(TOUCH_AREA_SIZE / 2, TOUCH_AREA_SIZE / 2, 60).fill({
        color: 0x000000,
        alpha: 0.25,
      })
      this.touchStart = roundPlace
      this.touchArea.addChild(roundPlace)
      stage.addChild(this.touchArea)

      this.touchArea.on('pointerdown', this.touchDown, this)
      // this.touchArea.on('pointerup', this.touchUp, this)
      this.touchArea.on('pointermove', this.touchMove, this)
      stage.on('pointerup', this.resetTouch, this)
  }

  reset() {
    this.keys = structuredClone(defaultState)
  }

  get state(): ControllerState {
    if (this.disabled) {
      return {
        keyUp: false,
        keyDown: false,
        keyRight: false,
        keyLeft: false,
        keySpace: false,
        keyOther: false,
      }
    }
    return {
      keyUp: this.keys.up.pressed,
      keyDown: this.keys.down.pressed,
      keyRight: this.keys.right.pressed,
      keyLeft: this.keys.left.pressed,
      keySpace: this.keys.space.pressed,
      keyOther: this.keys.other.pressed ? this.lastCode : false,
    }
  }

  private touchDown(e: FederatedPointerEvent) {
    const localPos = this.touchArea.toLocal(e.global)
    const point = new Point(localPos.x, localPos.y)

    this.touchStartPoint = null
    if (this.touchStart.containsPoint(point)) {
      this.touchStartPoint = [localPos.x, localPos.y]
    }
  }

  private touchMove(e: FederatedPointerEvent) {
    if (!this.touchStartPoint) return

    const localPos = this.touchArea.toLocal(e.global)
    const diffX = this.touchStartPoint[0] - localPos.x
    const diffY = this.touchStartPoint[1] - localPos.y

    let actionX: ActionKey | null = null
    let actionY: ActionKey | null = null

    if (Math.abs(diffX) > MOVE_TRESHOLD_X) {
      actionX = diffX > 0 ? 'left' : 'right'
    }
    if (Math.abs(diffY) > MOVE_TRESHOLD_Y) {
      actionY = diffY > 0 ? 'up' : 'down'
    }

    this.resetTouch()
    if (actionX) this.keys[actionX].pressed = true
    if (actionY) this.keys[actionY].pressed = true
  }

  private resetTouch() {
    this.keys['up'].pressed = false
    this.keys['down'].pressed = false
    this.keys['left'].pressed = false
    this.keys['right'].pressed = false
  }

  private keydownHandler(event: KeyboardEvent) {
    const key = keyMap[event.code] || 'other'

    // Toggle on the key pressed state.
    this.keys[key].pressed = true
    this.lastCode = event.code
  }

  private keyupHandler(event: KeyboardEvent) {
    const key = keyMap[event.code] || 'other'

    // Reset the key pressed state.
    this.keys[key].pressed = false
  }
}
