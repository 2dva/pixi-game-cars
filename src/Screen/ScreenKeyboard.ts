import { tr } from '../lib/i18n'
import { GAME_MODE } from '../types'
import { EVENT_TYPE, Screen, SCREEN_MODE, type ScreenMode } from './Screen'

export class ScreenKeyboard extends Screen {
  screenId: ScreenMode = 'keyboardScreen'

  setupData() {
    const keys = {
      '← → ↑ ↓': tr('keyboardScreen.control1'),
      'W A S D': tr('keyboardScreen.control2'),
      [tr('keyboardScreen.space')]: tr('keyboardScreen.break'),
      P: tr('keyboardScreen.pause'),
      M: tr('keyboardScreen.exitToMenu'),
    }
    type K = keyof typeof keys
    const controls = Object.keys(keys).reduce((a, k) => `${a}${k.padEnd(8)}- ${keys[k as K]}\n`, '')
    return { controls }
  }

  onUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
    }
  }

  onAfterSetup(): void {
    this.timer = setTimeout(() => {
      this.fire(EVENT_TYPE.GO_TO_SCREEN, undefined, SCREEN_MODE.START)
    }, 3000)
  }
}
