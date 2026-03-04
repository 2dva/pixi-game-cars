import { GAME_MODE } from '../state'
import { EVENT_TYPE, Screen, type ScreenMode } from './Screen'

export class ScreenStart extends Screen {
  screenId: ScreenMode = 'startScreen'

  doUserAction(keyCode: string) {
    if (keyCode === 'Digit1') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.FREE_RIDE)
    } else if (keyCode === 'Digit2') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.COLLECT_IN_TIME)
    }
  }
}
