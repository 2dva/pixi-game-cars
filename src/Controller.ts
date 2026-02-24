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
  disabled = false

  constructor() {
    // The controller's state.
    this.keys = structuredClone(defaultState)

    // Register event listeners for keydown and keyup events.
    window.addEventListener('keydown', (event) => this.keydownHandler(event))
    window.addEventListener('keyup', (event) => this.keyupHandler(event))
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
