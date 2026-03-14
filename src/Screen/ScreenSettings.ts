import { GAME_MODE } from '../types'
import { EVENT_TYPE, Screen, type ScreenMode } from './Screen'

export class ScreenSettings extends Screen {
  screenId: ScreenMode = 'settingsScreen'

  onUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
    }
  }

  onAfterSetup(): void {

  }
}
