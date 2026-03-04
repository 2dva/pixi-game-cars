import { GAME_MODE } from '../state'
import { EVENT_TYPE, Screen, type ScreenMode } from './Screen'

export class ScreenFailure extends Screen {
  screenId: ScreenMode = 'endScreenCrashed'

  doUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
    }
  }
}
