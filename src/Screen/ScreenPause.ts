import { EVENT_TYPE, Screen, type ScreenMode } from './Screen'

export class ScreenPause extends Screen {
  screenId: ScreenMode = 'pauseScreen'

  doUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.UNPAUSE_GAME)
    }
  }
}
