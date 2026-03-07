import { gameConfig } from '../configuration'
import { type StateHero } from '../state/state'
import { GAME_MODE } from '../types'
import { EVENT_TYPE, Screen, SCREEN_MODE, type ScreenMode } from './Screen'

export class ScreenStart extends Screen {
  screenId: ScreenMode = 'startScreen'

  onAfterSetup(_state: StateHero): void {
    if (!gameConfig.isTouchDevice) {
      this.timer = setTimeout(() => {
        this.fire(EVENT_TYPE.GO_TO_SCREEN, undefined, SCREEN_MODE.KEYBOARD)
      }, 5000)
    }
  }

  onUserAction(keyCode: string) {
    if (keyCode === 'Digit1') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.FREE_RIDE)
    } else if (keyCode === 'Digit2') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.COLLECT_IN_TIME)
    }
  }
}
