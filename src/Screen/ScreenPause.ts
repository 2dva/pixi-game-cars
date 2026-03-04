import { EVENT_TYPE, Screen, type ScreenMode } from './Screen'

export class ScreenPause extends Screen {
  screenId: ScreenMode = 'pauseScreen'

  onUserAction(keyCode: string) {
    if (keyCode === 'KeyP') {
      this.fire(EVENT_TYPE.UNPAUSE_GAME)
    }
  }
}
